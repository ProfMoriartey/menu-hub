// src/server/plans.ts
// Keeps what each restaurant may use (lib/plans entitlements) saved on its
// row, so the public pages read it with everything else.
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { restaurantBilling, restaurants } from "~/server/db/schema";
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
 * Works out what the restaurant may use from its plan and overrides, and
 * saves it on the restaurant. Call after either changes.
 */
export async function syncEntitlements(restaurantId: string) {
  const row = await db.query.restaurantBilling.findFirst({
    where: eq(restaurantBilling.restaurantId, restaurantId),
    columns: { tier: true, colorsOverride: true, languagesOverride: true, branchesOverride: true },
  });
  const limits = limitsOf(row);
  await db
    .update(restaurants)
    .set({
      brandColorEnabled: limits.customColors,
      multilingualEnabled: limits.extraLanguages === null || limits.extraLanguages > 0,
      maxExtraLanguages: limits.extraLanguages,
      maxBranches: limits.maxBranches,
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, restaurantId));
  revalidatePublicRestaurant(restaurantId);
}
