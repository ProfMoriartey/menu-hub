// src/app/actions/billing.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import { payments, restaurantBilling, restaurants } from "~/server/db/schema";
import { isSystemAdmin } from "~/app/actions/auth";
import { ActionError, type ActionResult } from "~/lib/action-result";
import { BILLING_CURRENCIES, coversUntil, isDay, isPaymentMethod } from "~/lib/billing";
import { isUuid } from "~/lib/slug";
import { runAction } from "~/server/run-action";

/*
 * Billing recorded by hand: the plan agreed with a restaurant and the
 * payments received. System admins only.
 */

async function requireAdmin() {
  if (!(await isSystemAdmin())) throw new ActionError("adminOnly");
}

// Up to 12 digits with 2 decimals, as the columns store; "1.250,50" or
// "1250.5" both work.
const money = z
  .string()
  .trim()
  .transform((value) => value.replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."))
  .refine((value) => /^\d{1,10}(\.\d{1,2})?$/.test(value));

const currency = z.enum(BILLING_CURRENCIES);

const planSchema = z.object({
  planName: z.string().trim().max(64),
  monthlyPrice: z.union([z.literal(""), money]),
  currency,
  notes: z.string().trim().max(2000),
});

/** The plan agreed with the restaurant. An empty name means not billed. */
export async function saveBillingPlan(restaurantId: string, input: unknown): Promise<ActionResult> {
  return runAction("saveBillingFailed", async () => {
    await requireAdmin();
    const parsed = planSchema.safeParse(input);
    if (!isUuid(restaurantId) || !parsed.success) throw new ActionError("invalidInput");
    const exists = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, restaurantId),
      columns: { id: true },
    });
    if (!exists) throw new ActionError("restaurantNotFound");

    const values = {
      planName: parsed.data.planName || null,
      monthlyPrice: parsed.data.monthlyPrice || null,
      currency: parsed.data.currency,
      notes: parsed.data.notes || null,
      updatedAt: new Date(),
    };
    await db
      .insert(restaurantBilling)
      .values({ restaurantId, ...values })
      .onConflictDoUpdate({ target: restaurantBilling.restaurantId, set: values });
  });
}

const paymentSchema = z.object({
  paidOn: z.string().refine(isDay),
  amount: money,
  currency,
  coversFrom: z.string().refine(isDay),
  months: z.number().int().min(1).max(36),
  method: z.string().refine(isPaymentMethod),
  note: z.string().trim().max(500),
});

/** A payment received, paying `months` months from `coversFrom`. */
export async function recordPayment(restaurantId: string, input: unknown): Promise<ActionResult> {
  return runAction("saveBillingFailed", async () => {
    await requireAdmin();
    const parsed = paymentSchema.safeParse(input);
    if (!isUuid(restaurantId) || !parsed.success) throw new ActionError("invalidInput");
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, restaurantId),
      columns: { id: true, name: true },
    });
    if (!restaurant) throw new ActionError("restaurantNotFound");

    const { months, note, ...payment } = parsed.data;
    const { userId } = await auth();
    await db.insert(payments).values({
      ...payment,
      restaurantId,
      restaurantName: restaurant.name,
      coversUntil: coversUntil(payment.coversFrom, months),
      note: note || null,
      recordedBy: userId,
    });
  });
}

/** Removes a payment recorded by mistake; the paid-up date follows. */
export async function deletePayment(paymentId: string): Promise<ActionResult> {
  return runAction("saveBillingFailed", async () => {
    await requireAdmin();
    if (!isUuid(paymentId)) throw new ActionError("invalidInput");
    await db.delete(payments).where(eq(payments.id, paymentId));
  });
}
