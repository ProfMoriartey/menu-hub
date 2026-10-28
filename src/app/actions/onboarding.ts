// src/app/actions/onboarding.ts
"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq, isNull, like } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import {
  planRequests,
  restaurantBilling,
  restaurants,
  users,
  usersToRestaurants,
} from "~/server/db/schema";
import { ActionError, type ActionResult } from "~/lib/action-result";
import { isCountryCode } from "~/lib/countries";
import { isPaymentMethod } from "~/lib/billing";
import { TIERS } from "~/lib/plans";
import { RESERVED_SLUGS } from "~/lib/schemas";
import { slugify, uniqueSlug } from "~/lib/slug";
import { isVenueType } from "~/lib/venue-types";
import { saveMainBranch } from "~/server/branches";
import { syncEntitlements } from "~/server/plans";
import { revalidatePublicRestaurant } from "~/server/public-menu";
import { runAction } from "~/server/run-action";

/*
 * Sign-up: someone creates their own restaurant, picking a plan and how
 * they'd like to pay. They own it and can build the menu straight away
 * with the plan's features; it goes live once an admin approves the
 * sign-up (actions/plan-requests). One waiting sign-up per account.
 */

const startSchema = z.object({
  name: z.string().trim().min(1).max(256),
  typeOfEstablishment: z.string().refine((v) => v === "" || isVenueType(v)),
  currency: z.string().regex(/^[A-Z]{3}$/),
  city: z.string().trim().max(128),
  country: z.string().refine(isCountryCode),
  phone: z.string().trim().min(5).max(50),
  tier: z.enum(TIERS),
  billingCycle: z.enum(["monthly", "yearly"]),
  paymentMethod: z.string().refine(isPaymentMethod),
  note: z.string().trim().max(1000),
});

export async function createOwnRestaurant(input: unknown): Promise<ActionResult<{ slug: string }>> {
  return runAction("createOwnRestaurantFailed", async () => {
    const { userId } = await auth();
    if (!userId) throw new ActionError("signInAgain");
    const parsed = startSchema.safeParse(input);
    if (!parsed.success) throw new ActionError("invalidInput");
    const data = parsed.data;

    // One at a time: another restaurant once the first is approved.
    const waiting = await db.query.planRequests.findFirst({
      where: and(
        eq(planRequests.requestedBy, userId),
        eq(planRequests.kind, "signup"),
        isNull(planRequests.resolution),
      ),
      columns: { id: true },
    });
    if (waiting) throw new ActionError("restaurantLimit");

    // The menu address comes from the name, with a number when it's
    // taken; owners don't choose it (an admin can change it later).
    const base = slugify(data.name) || "restaurant";
    const similar = await db
      .select({ slug: restaurants.slug })
      .from(restaurants)
      .where(like(restaurants.slug, `${base}%`));
    const slug = uniqueSlug(data.name, [...RESERVED_SLUGS, ...similar.map((r) => r.slug)], "restaurant");

    // The Clerk webhook normally adds the account; it may not have yet.
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? null;
    await db.insert(users).values({ id: userId, email }).onConflictDoNothing();

    const restaurantId = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(restaurants)
        .values({
          name: data.name,
          slug,
          typeOfEstablishment: data.typeOfEstablishment || null,
          currency: data.currency,
          isActive: false,
          isDisplayed: false,
        })
        .returning({ id: restaurants.id });
      const id = created!.id;
      await saveMainBranch(tx, id, {
        city: data.city || null,
        country: data.country,
        phoneNumber: data.phone,
      });
      await tx.insert(usersToRestaurants).values({ userId, restaurantId: id, accessLevel: "owner" });
      await tx.insert(restaurantBilling).values({
        restaurantId: id,
        tier: data.tier,
        billingCycle: data.billingCycle,
      });
      await tx.insert(planRequests).values({
        restaurantId: id,
        kind: "signup",
        tier: data.tier,
        billingCycle: data.billingCycle,
        paymentMethod: data.paymentMethod,
        contactPhone: data.phone,
        note: data.note || null,
        requestedBy: userId,
      });
      return id;
    });

    // The plan's features, so they can build with them right away.
    await syncEntitlements(restaurantId);
    revalidatePublicRestaurant(restaurantId);
    return { slug };
  });
}
