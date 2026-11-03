// src/server/payments.ts
// Saving a payment received, whoever took it: an admin recording one by
// hand (actions/billing) or, later, an online provider's webhook. Callers
// check who may do it; this keeps the books and what the restaurant may
// use in step.
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { payments, restaurants } from "~/server/db/schema";
import { ActionError } from "~/lib/action-result";
import type { PaymentMethod, PaymentProvider } from "~/lib/billing";
import { syncEntitlements } from "~/server/plans";

export interface PaymentInput {
  restaurantId: string;
  // "YYYY-MM-DD" days (lib/billing).
  paidOn: string;
  coversFrom: string;
  coversUntil: string;
  // Up to 12 digits with 2 decimals, e.g. "1250.50".
  amount: string;
  currency: string;
  method: PaymentMethod;
  provider: PaymentProvider;
  // The provider's id for the payment; null when recorded by hand.
  providerPaymentId: string | null;
  note: string | null;
  // The admin who recorded it; null for a provider's.
  recordedBy: string | null;
}

/**
 * Saves a payment and brings the restaurant's live-until date up to date
 * (a menu offline unpaid can be live again). A provider reporting the same
 * payment again (same provider and id) changes nothing. Returns whether it
 * was saved.
 */
export async function applyPayment(input: PaymentInput): Promise<boolean> {
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, input.restaurantId),
    columns: { id: true, name: true },
  });
  if (!restaurant) throw new ActionError("restaurantNotFound");

  const saved = await db
    .insert(payments)
    .values({ ...input, restaurantName: restaurant.name })
    .onConflictDoNothing({ target: [payments.provider, payments.providerPaymentId] })
    .returning({ id: payments.id });
  await syncEntitlements(input.restaurantId);
  return saved.length > 0;
}
