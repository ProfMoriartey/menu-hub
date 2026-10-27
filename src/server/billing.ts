// src/server/billing.ts
// Reads for the admin Plan tab and Payments page (lib/billing has the
// rules). Admin pages only: nothing here is cached or shown publicly.
import { and, desc, eq, gte, lte, max, sql, type SQL } from "drizzle-orm";
import { db } from "~/server/db";
import { payments, restaurantBilling } from "~/server/db/schema";
import {
  addDays,
  addMonths,
  amountOwed,
  billingStatus,
  billingToday,
  nextPeriodStart,
  type BillingStatus,
} from "~/lib/billing";

export type PaymentRow = typeof payments.$inferSelect;

export interface BillingPlan {
  planName: string | null;
  monthlyPrice: string | null;
  currency: string;
  startsOn: string | null;
  notes: string | null;
}

export type MoneyByCurrency = { currency: string; total: number }[];

const PLAN_COLUMNS = {
  planName: true,
  monthlyPrice: true,
  currency: true,
  startsOn: true,
  notes: true,
} as const;

// Totals per currency (amounts in different currencies never add up).
function byCurrency(rows: { currency: string; amount: string | number }[]): MoneyByCurrency {
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(row.currency, (totals.get(row.currency) ?? 0) + Number(row.amount));
  return [...totals].map(([currency, total]) => ({ currency, total: Math.round(total * 100) / 100 }));
}

/** One restaurant's plan, standing and latest payments, for its Plan tab. */
export async function getRestaurantPlan(restaurantId: string) {
  const [plan, recent, [latest]] = await Promise.all([
    db.query.restaurantBilling.findFirst({
      where: eq(restaurantBilling.restaurantId, restaurantId),
      columns: PLAN_COLUMNS,
    }),
    db.query.payments.findMany({
      where: eq(payments.restaurantId, restaurantId),
      orderBy: [desc(payments.paidOn), desc(payments.createdAt)],
      limit: 5,
    }),
    db
      .select({ paidUntil: max(payments.coversUntil), count: sql<number>`count(*)::int` })
      .from(payments)
      .where(eq(payments.restaurantId, restaurantId)),
  ]);
  const today = billingToday();
  const paidUntil = latest?.paidUntil ?? null;
  const status = billingStatus(plan ?? null, paidUntil, today);
  return {
    plan: plan ?? null,
    recent,
    paymentCount: latest?.count ?? 0,
    paidUntil,
    status,
    owed: amountOwed(plan ?? null, paidUntil, status, today),
  };
}

/** A restaurant as the Payments page lists it and the payment form fills in. */
export interface BillingRestaurant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
  plan: BillingPlan | null;
  paidUntil: string | null;
  status: BillingStatus;
  owed: { amount: number; currency: string; periods: number } | null;
  // Where the next payment's period starts (lib/billing nextPeriodStart).
  nextStart: string;
}

export const PAYMENT_PERIODS = [
  { id: "month", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "year", label: "This year" },
  { id: "all", label: "All time" },
] as const;
export type PaymentPeriod = (typeof PAYMENT_PERIODS)[number]["id"];

/** First and last day of a period, around `today` (null = no limit). */
function periodRange(period: PaymentPeriod, today: string): [string | null, string | null] {
  const monthStart = `${today.slice(0, 7)}-01`;
  switch (period) {
    case "month":
      return [monthStart, null];
    case "lastMonth":
      return [addMonths(monthStart, -1), addDays(monthStart, -1)];
    case "year":
      return [`${today.slice(0, 4)}-01-01`, null];
    case "all":
      return [null, null];
  }
}

/**
 * Everything on the Payments page: every restaurant's standing (most
 * urgent first is up to the page), the payments matching the filters with
 * their total, and the money reports.
 */
export async function getPaymentsPage(filters: { restaurantId: string | null; period: PaymentPeriod }) {
  const today = billingToday();
  const monthStart = `${today.slice(0, 7)}-01`;
  const lastMonthStart = addMonths(monthStart, -1);
  const yearStart = `${today.slice(0, 4)}-01-01`;
  const twelveMonthsAgo = addMonths(monthStart, -11);

  const [from, to] = periodRange(filters.period, today);
  const where: SQL[] = [];
  if (filters.restaurantId) where.push(eq(payments.restaurantId, filters.restaurantId));
  if (from) where.push(gte(payments.paidOn, from));
  if (to) where.push(lte(payments.paidOn, to));

  const [list, plans, paidUntilRows, ledger, lastTwelveMonths] = await Promise.all([
    db.query.restaurants.findMany({
      columns: { id: true, name: true, slug: true, logoUrl: true, isActive: true },
      orderBy: (r, { asc }) => [asc(r.name)],
    }),
    db.query.restaurantBilling.findMany(),
    db
      .select({ restaurantId: payments.restaurantId, paidUntil: max(payments.coversUntil) })
      .from(payments)
      .groupBy(payments.restaurantId),
    db.query.payments.findMany({
      where: where.length ? and(...where) : undefined,
      orderBy: [desc(payments.paidOn), desc(payments.createdAt)],
      with: { restaurant: { columns: { slug: true } } },
    }),
    // Enough for this month, last month, this year and the monthly table.
    db.query.payments.findMany({
      // Twelve months back always reaches this year's start.
      where: gte(payments.paidOn, twelveMonthsAgo),
      columns: { paidOn: true, amount: true, currency: true },
    }),
  ]);

  const planBy = new Map(plans.map((p) => [p.restaurantId, p]));
  const paidUntilBy = new Map(paidUntilRows.map((r) => [r.restaurantId, r.paidUntil]));

  const restaurants: BillingRestaurant[] = list.map((r) => {
    const row = planBy.get(r.id);
    const plan: BillingPlan | null = row
      ? {
          planName: row.planName,
          monthlyPrice: row.monthlyPrice,
          currency: row.currency,
          startsOn: row.startsOn,
          notes: row.notes,
        }
      : null;
    const paidUntil = paidUntilBy.get(r.id) ?? null;
    const status = billingStatus(plan, paidUntil, today);
    return {
      ...r,
      plan,
      paidUntil,
      status,
      owed: amountOwed(plan, paidUntil, status, today),
      nextStart: nextPeriodStart(plan, paidUntil, today),
    };
  });

  const inRange = (start: string, end?: string) =>
    lastTwelveMonths.filter((p) => p.paidOn >= start && (!end || p.paidOn < end));

  // Received per month, newest first, for the last 12 months.
  const months = Array.from({ length: 12 }, (_, i) => addMonths(monthStart, -i));
  const byMonth = months.map((start, i) => ({
    month: start,
    received: byCurrency(inRange(start, i === 0 ? undefined : months[i - 1])),
  }));

  const monthly = restaurants.flatMap((r) =>
    r.plan?.planName && r.plan.monthlyPrice && Number(r.plan.monthlyPrice) > 0
      ? [{ currency: r.plan.currency, amount: r.plan.monthlyPrice }]
      : [],
  );

  return {
    today,
    restaurants,
    ledger,
    ledgerTotal: byCurrency(ledger),
    report: {
      thisMonth: byCurrency(inRange(monthStart)),
      lastMonth: byCurrency(inRange(lastMonthStart, monthStart)),
      thisYear: byCurrency(inRange(yearStart)),
      outstanding: byCurrency(
        restaurants.flatMap((r) => (r.owed ? [{ currency: r.owed.currency, amount: r.owed.amount }] : [])),
      ),
      owingCount: restaurants.filter((r) => r.owed).length,
      expectedMonthly: byCurrency(monthly),
      byMonth,
    },
  };
}
