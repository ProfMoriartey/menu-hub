// src/app/actions/branches.ts
"use server";

import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "~/server/db";
import { branches } from "~/server/db/schema";
import { checkOwnerAuthorization } from "~/app/actions/auth";
import { ActionError, type ActionResult } from "~/lib/action-result";
import { isCountryCode } from "~/lib/countries";
import { isValidTimeZone, parseOpeningHours } from "~/lib/opening-hours";
import { RESERVED_BRANCH_SLUGS, branchSchema } from "~/lib/schemas";
import { isUuid, uniqueSlug } from "~/lib/slug";
import { revalidatePublicRestaurant } from "~/server/public-menu";
import { runAction } from "~/server/run-action";

/*
 * A restaurant's branches (server/branches). Owners and admins add, edit,
 * reorder and remove them; the country stays admin-only, as it was on the
 * restaurant. A restaurant always keeps at least one branch.
 */

// The branch and the caller's role for its restaurant, or an error.
async function editableBranch(branchId: string) {
  const branch = isUuid(branchId)
    ? await db.query.branches.findFirst({
        where: eq(branches.id, branchId),
        columns: { id: true, restaurantId: true, name: true, slug: true, country: true },
      })
    : undefined;
  if (!branch) throw new ActionError("branchNotFound");
  const role = await checkOwnerAuthorization(branch.restaurantId);
  return { branch, role };
}

// Slugs a branch can't take: its restaurant's other branches' and the
// restaurant pages' own (about, item).
async function takenBranchSlugs(restaurantId: string, exceptId?: string) {
  const rows = await db
    .select({ id: branches.id, slug: branches.slug })
    .from(branches)
    .where(eq(branches.restaurantId, restaurantId));
  return [
    ...RESERVED_BRANCH_SLUGS,
    ...rows.filter((row) => row.id !== exceptId).map((row) => row.slug),
  ];
}

const restaurantBranches = (restaurantId: string) =>
  db.query.branches.findMany({
    where: eq(branches.restaurantId, restaurantId),
    orderBy: [asc(branches.order), asc(branches.createdAt)],
    columns: { id: true, order: true, country: true, timeZone: true },
  });

/**
 * A new branch, last in the list. It starts in the main branch's country
 * and time zone, which most branches share.
 */
export async function addBranch(
  restaurantId: string,
  name: string,
): Promise<ActionResult<{ id: string }>> {
  return runAction("addBranchFailed", async () => {
    await checkOwnerAuthorization(restaurantId);
    const trimmed = typeof name === "string" ? name.trim().slice(0, 128) : "";
    if (!trimmed) throw new ActionError("branchNameRequired");

    const existing = await restaurantBranches(restaurantId);
    const main = existing[0];
    const [created] = await db
      .insert(branches)
      .values({
        restaurantId,
        name: trimmed,
        slug: uniqueSlug(trimmed, await takenBranchSlugs(restaurantId), "branch"),
        order: Math.max(-1, ...existing.map((b) => b.order)) + 1,
        country: main?.country ?? null,
        timeZone: main?.timeZone ?? null,
      })
      .returning({ id: branches.id });

    revalidatePublicRestaurant(restaurantId);
    return { id: created!.id };
  });
}

/** Name, address, contact and delivery links. */
export async function updateBranch(branchId: string, input: unknown): Promise<ActionResult> {
  return runAction("saveBranchFailed", async () => {
    const { branch, role } = await editableBranch(branchId);
    const parsed = branchSchema.safeParse(input);
    if (!parsed.success) throw new ActionError("invalidInput");
    // Empty text is stored as none.
    const blank = (value: string | null) => {
      const trimmed = value?.trim();
      if (!trimmed) return null;
      return trimmed;
    };
    const fields = parsed.data;
    const name = blank(fields.name);

    // Guests tell branches apart by name once there are several.
    const others = await db.$count(
      branches,
      and(eq(branches.restaurantId, branch.restaurantId), ne(branches.id, branch.id)),
    );
    if (!name && others > 0) throw new ActionError("branchNameRequired");

    const country = role === "admin" ? blank(fields.country) : branch.country;
    if (role === "admin" && country && !isCountryCode(country) && country !== branch.country)
      throw new ActionError("invalidInput");

    // The slug follows the name, so only a rename changes it.
    const slug =
      name && name !== branch.name
        ? uniqueSlug(name, await takenBranchSlugs(branch.restaurantId, branch.id), "branch")
        : branch.slug;

    await db
      .update(branches)
      .set({
        name,
        slug,
        address: blank(fields.address),
        city: blank(fields.city),
        country,
        phoneNumber: blank(fields.phoneNumber),
        mapUrl: blank(fields.mapUrl),
        deliveryApps: fields.deliveryApps,
        updatedAt: new Date(),
      })
      .where(eq(branches.id, branch.id));
    revalidatePublicRestaurant(branch.restaurantId);
  });
}

/**
 * The time zone (needed for "open now" and for which day a QR scan counts
 * on) and the weekly hours. `hours: null` removes them from the public pages.
 */
export async function updateBranchHours(
  branchId: string,
  input: { timeZone: string; hours: unknown },
): Promise<ActionResult> {
  return runAction("saveHoursFailed", async () => {
    const { branch } = await editableBranch(branchId);
    if (!isValidTimeZone(input.timeZone)) throw new ActionError("invalidTimeZone");
    const hours = input.hours === null ? null : parseOpeningHours(input.hours);
    if (input.hours !== null && !hours) throw new ActionError("invalidHours");

    await db
      .update(branches)
      .set({ timeZone: input.timeZone, openingHours: hours, updatedAt: new Date() })
      .where(eq(branches.id, branch.id));
    revalidatePublicRestaurant(branch.restaurantId);
  });
}

/** Removes a branch; the restaurant's last one stays. */
export async function deleteBranch(branchId: string): Promise<ActionResult> {
  return runAction("deleteBranchFailed", async () => {
    const { branch } = await editableBranch(branchId);
    const count = await db.$count(branches, eq(branches.restaurantId, branch.restaurantId));
    if (count <= 1) throw new ActionError("lastBranch");

    await db.delete(branches).where(eq(branches.id, branch.id));
    revalidatePublicRestaurant(branch.restaurantId);
  });
}

/** The branches in a new order; the first becomes the main branch. */
export async function reorderBranches(
  restaurantId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  return runAction("reorderFailed", async () => {
    await checkOwnerAuthorization(restaurantId);
    const existing = await restaurantBranches(restaurantId);
    const ids = new Set(existing.map((b) => b.id));
    if (
      !Array.isArray(orderedIds) ||
      orderedIds.length !== ids.size ||
      new Set(orderedIds).size !== ids.size ||
      !orderedIds.every((id) => ids.has(id))
    )
      throw new ActionError("invalidOrder");

    await db.transaction(async (tx) => {
      for (const [order, id] of orderedIds.entries()) {
        await tx.update(branches).set({ order }).where(eq(branches.id, id));
      }
    });
    revalidatePublicRestaurant(restaurantId);
  });
}
