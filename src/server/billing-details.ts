// src/server/billing-details.ts
// Reads a restaurant's billing details (lib/billing-details), for its
// owner's Plan tab and the admin's.
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { billingDetails } from "~/server/db/schema";

export type BillingDetailsRow = typeof billingDetails.$inferSelect;

export async function getBillingDetails(restaurantId: string): Promise<BillingDetailsRow | null> {
  const row = await db.query.billingDetails.findFirst({
    where: eq(billingDetails.restaurantId, restaurantId),
  });
  return row ?? null;
}
