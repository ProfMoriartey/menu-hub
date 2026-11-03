// src/server/plans.ts
// Keeps what each restaurant may use (lib/plans entitlements) and until
// when its menu may be live saved on its row, so the public pages read it
// with everything else.
import { eq, max } from "drizzle-orm";
import { db } from "~/server/db";
import { payments, restaurantBilling, restaurants } from "~/server/db/schema";
import { addDays } from "~/lib/billing";
import { entitlements, isTier, type FeatureOverrides } from "~/lib/plans";
import { revalidatePublicRestaurant } from "~/server/public-menu";

type BillingRow = Pick<
  typeof restaurantBilling.$inferSelect,
  "tier" | "colorsOverride" | "languagesOverride" | "branchesOverride"
>;

export const overridesOf = (row: BillingRow | null | undefined): FeatureOverrides => ({
  customColors: row?.colorsOverride ?? null,
  extraLanguages: row?.languagesOverride ?? null,
  maxBranches: row?.branchesOverride ?? null,
});

export const limitsOf = (row: BillingRow | null | undefined) =>
  entitlements(isTier(row?.tier) ? row.tier : null, overridesOf(row));

/**
 * The last day the menu may be live: the latest day paid for, or the last
 * free day before billing starts, whichever is later. Null (no limit)
 * unless the restaurant goes offline when unpaid, or nothing is known.
 */
function liveUntilOf(
  row: { offlineWhenUnpaid: boolean; startsOn: string | null } | undefined,
  paidUntil: string | null,
): string | null {
  if (!row?.offlineWhenUnpaid) return null;
  const free = row.startsOn ? addDays(row.startsOn, -1) : null;
  if (!free || !paidUntil) return free ?? paidUntil;
  return free > paidUntil ? free : paidUntil;
}

/**
 * Works out what the restaurant may use from its plan and overrides, and
 * until when its menu may be live from its plan and payments, and saves
 * both on the restaurant. Call after any of them changes.
 */
export async function syncEntitlements(restaurantId: string) {
  const [row, [paid]] = await Promise.all([
    db.query.restaurantBilling.findFirst({
      where: eq(restaurantBilling.restaurantId, restaurantId),
      columns: {
        tier: true,
        colorsOverride: true,
        languagesOverride: true,
        branchesOverride: true,
        offlineWhenUnpaid: true,
        startsOn: true,
      },
    }),
    db
      .select({ paidUntil: max(payments.coversUntil) })
      .from(payments)
      .where(eq(payments.restaurantId, restaurantId)),
  ]);
  const limits = limitsOf(row);
  await db
    .update(restaurants)
    .set({
      brandColorEnabled: limits.customColors,
      multilingualEnabled: limits.extraLanguages === null || limits.extraLanguages > 0,
      maxExtraLanguages: limits.extraLanguages,
      maxBranches: limits.maxBranches,
      liveUntil: liveUntilOf(row, paid?.paidUntil ?? null),
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, restaurantId));
  revalidatePublicRestaurant(restaurantId);
}
