// src/server/billing.ts
// Reads for the admin billing pages (lib/billing has the rules). Admin
// pages only: nothing here is cached or shown publicly.
import { desc, eq, gte, max, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { payments, restaurantBilling } from "~/server/db/schema";
import { billingStatus, billingToday, type BillingStatus } from "~/lib/billing";

export type PaymentRow = typeof payments.$inferSelect;

export interface BillingPlan {
  planName: string | null;
  monthlyPrice: string | null;
  currency: string;
  notes: string | null;
}

/** One restaurant's plan, payments (newest first) and standing. */
export async function getRestaurantBilling(restaurantId: string) {
  const [plan, rows] = await Promise.all([
    db.query.restaurantBilling.findFirst({
      where: eq(restaurantBilling.restaurantId, restaurantId),
      columns: { planName: true, monthlyPrice: true, currency: true, notes: true },
    }),
    db.query.payments.findMany({
      where: eq(payments.restaurantId, restaurantId),
      orderBy: [desc(payments.paidOn), desc(payments.createdAt)],
    }),
  ]);
  const paidUntil = rows.reduce<string | null>(
    (latest, row) => (!latest || row.coversUntil > latest ? row.coversUntil : latest),
    null,
  );
  const today = billingToday();
  return {
    plan: plan ?? null,
    payments: rows,
    paidUntil,
    today,
    status: billingStatus(plan ?? null, paidUntil, today),
  };
}

export interface BillingOverviewRow {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
  plan: BillingPlan | null;
  paidUntil: string | null;
  status: BillingStatus;
  lastPayment: { paidOn: string; amount: string; currency: string } | null;
}

/**
 * Every restaurant with its plan and standing, the latest payments, and
 * what came in this month (per currency).
 */
export async function getBillingOverview() {
  const today = billingToday();
  const monthStart = `${today.slice(0, 7)}-01`;

  const [list, plans, paidUntilRows, lastRows, recent, thisMonth] = await Promise.all([
    db.query.restaurants.findMany({
      columns: { id: true, name: true, slug: true, logoUrl: true, isActive: true },
      orderBy: (r, { asc }) => [asc(r.name)],
    }),
    db.query.restaurantBilling.findMany(),
    db
      .select({ restaurantId: payments.restaurantId, paidUntil: max(payments.coversUntil) })
      .from(payments)
      .groupBy(payments.restaurantId),
    // Each restaurant's latest payment.
    db
      .selectDistinctOn([payments.restaurantId], {
        restaurantId: payments.restaurantId,
        paidOn: payments.paidOn,
        amount: payments.amount,
        currency: payments.currency,
      })
      .from(payments)
      .orderBy(payments.restaurantId, desc(payments.paidOn), desc(payments.createdAt)),
    db.query.payments.findMany({
      orderBy: [desc(payments.paidOn), desc(payments.createdAt)],
      limit: 15,
      with: { restaurant: { columns: { slug: true } } },
    }),
    db
      .select({
        currency: payments.currency,
        total: sql<string>`sum(${payments.amount})`,
      })
      .from(payments)
      .where(gte(payments.paidOn, monthStart))
      .groupBy(payments.currency),
  ]);

  const planBy = new Map(plans.map((p) => [p.restaurantId, p]));
  const paidUntilBy = new Map(paidUntilRows.map((r) => [r.restaurantId, r.paidUntil]));
  const lastBy = new Map(lastRows.map((r) => [r.restaurantId, r]));

  const rows: BillingOverviewRow[] = list.map((r) => {
    const plan = planBy.get(r.id) ?? null;
    const paidUntil = paidUntilBy.get(r.id) ?? null;
    const last = lastBy.get(r.id);
    return {
      ...r,
      plan: plan && {
        planName: plan.planName,
        monthlyPrice: plan.monthlyPrice,
        currency: plan.currency,
        notes: plan.notes,
      },
      paidUntil,
      status: billingStatus(plan, paidUntil, today),
      lastPayment: last ? { paidOn: last.paidOn, amount: last.amount, currency: last.currency } : null,
    };
  });

  // What billed restaurants pay a month, per currency.
  const monthly = new Map<string, number>();
  for (const row of rows) {
    if (!row.plan?.planName || !row.plan.monthlyPrice) continue;
    const price = Number(row.plan.monthlyPrice);
    if (price > 0) monthly.set(row.plan.currency, (monthly.get(row.plan.currency) ?? 0) + price);
  }

  return {
    today,
    rows,
    recent,
    collectedThisMonth: thisMonth.map((r) => ({ currency: r.currency, total: r.total })),
    expectedMonthly: [...monthly].map(([currency, total]) => ({ currency, total })),
  };
}
