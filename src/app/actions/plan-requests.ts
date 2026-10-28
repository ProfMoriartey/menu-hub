// src/app/actions/plan-requests.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import { planRequests, restaurantBilling, restaurants } from "~/server/db/schema";
import { checkOwnerAuthorization, isSystemAdmin } from "~/app/actions/auth";
import { ActionError, type ActionResult } from "~/lib/action-result";
import { billingToday } from "~/lib/billing";
import { TIERS } from "~/lib/plans";
import { isUuid } from "~/lib/slug";
import { isApprovedToPublish } from "~/server/plan-requests";
import { syncEntitlements } from "~/server/plans";
import { revalidatePublicRestaurant } from "~/server/public-menu";
import { runAction } from "~/server/run-action";

/*
 * Owners ask, admins decide: a plan change requested from the owner's Plan
 * tab, an admin approving or dismissing it (or a new restaurant's
 * sign-up), and going live, which an approved restaurant's owners may do
 * themselves.
 */

const changeSchema = z.object({
  tier: z.enum(TIERS),
  billingCycle: z.enum(["monthly", "yearly"]),
  note: z.string().trim().max(1000),
});

/** Owners and admins: ask for another plan. Replaces an open request. */
export async function requestPlanChange(restaurantId: string, input: unknown): Promise<ActionResult> {
  return runAction("requestFailed", async () => {
    await checkOwnerAuthorization(restaurantId);
    const parsed = changeSchema.safeParse(input);
    if (!parsed.success) throw new ActionError("invalidInput");
    const { userId } = await auth();

    await db.transaction(async (tx) => {
      await tx
        .delete(planRequests)
        .where(
          and(
            eq(planRequests.restaurantId, restaurantId),
            eq(planRequests.kind, "change"),
            isNull(planRequests.resolution),
          ),
        );
      await tx.insert(planRequests).values({
        restaurantId,
        kind: "change",
        tier: parsed.data.tier,
        billingCycle: parsed.data.billingCycle,
        note: parsed.data.note || null,
        requestedBy: userId,
      });
    });
  });
}

/** Owners: withdraw an open plan change request. */
export async function cancelPlanChange(restaurantId: string): Promise<ActionResult> {
  return runAction("requestFailed", async () => {
    await checkOwnerAuthorization(restaurantId);
    await db
      .delete(planRequests)
      .where(
        and(
          eq(planRequests.restaurantId, restaurantId),
          eq(planRequests.kind, "change"),
          isNull(planRequests.resolution),
        ),
      );
  });
}

/**
 * Admin only. Approving a sign-up lets the restaurant go live and starts
 * its billing today (unless a start date is set); approving a change moves
 * the restaurant to the plan asked for. Dismissing just closes it.
 */
export async function resolvePlanRequest(
  requestId: string,
  decision: "approved" | "dismissed",
): Promise<ActionResult> {
  return runAction("requestFailed", async () => {
    if (!(await isSystemAdmin())) throw new ActionError("adminOnly");
    if (!isUuid(requestId) || (decision !== "approved" && decision !== "dismissed"))
      throw new ActionError("invalidInput");
    const request = await db.query.planRequests.findFirst({ where: eq(planRequests.id, requestId) });
    if (!request || request.resolution) throw new ActionError("requestNotFound");

    await db.transaction(async (tx) => {
      await tx
        .update(planRequests)
        .set({ resolution: decision, resolvedAt: new Date() })
        .where(eq(planRequests.id, requestId));
      if (decision !== "approved") return;

      const billing = await tx.query.restaurantBilling.findFirst({
        where: eq(restaurantBilling.restaurantId, request.restaurantId),
        columns: { startsOn: true },
      });
      const values = {
        tier: request.tier,
        billingCycle: request.billingCycle,
        ...(request.kind === "signup" && !billing?.startsOn ? { startsOn: billingToday() } : {}),
        updatedAt: new Date(),
      };
      await tx
        .insert(restaurantBilling)
        .values({ restaurantId: request.restaurantId, ...values })
        .onConflictDoUpdate({ target: restaurantBilling.restaurantId, set: values });
    });
    if (decision === "approved") await syncEntitlements(request.restaurantId);
  });
}

/**
 * Owners and admins: put the menu live or take it offline. Going live
 * waits for an admin to approve a restaurant's sign-up.
 */
export async function setRestaurantLive(restaurantId: string, live: boolean): Promise<ActionResult> {
  return runAction("saveRestaurantFailed", async () => {
    await checkOwnerAuthorization(restaurantId);
    if (live === true && !(await isApprovedToPublish(restaurantId))) throw new ActionError("awaitingApproval");
    await db
      .update(restaurants)
      .set({ isActive: live === true, updatedAt: new Date() })
      .where(eq(restaurants.id, restaurantId));
    revalidatePublicRestaurant(restaurantId);
  });
}
