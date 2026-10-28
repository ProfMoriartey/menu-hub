// src/server/billing.ts
// Reads for the admin Plan tab and Payments page (lib/billing has the
// rules). Admin pages only: nothing here is cached or shown publicly.
import { count, desc, eq, max } from "drizzle-orm";
import { db } from "~/server/db";
import { branches, payments, restaurantBilling } from "~/server/db/schema";
import { addMonths, billingToday, pendingDues, type PlanTerms } from "~/lib/billing";
import { TIER_FEATURES, planPricing, type Entitlements, type PlanPricing } from "~/lib/plans";
import { limitsOf } from "~/server/plans";

/** A restaurant's plan as saved, with any feature overrides. */
export interface BillingPlan {
  tier: string | null;
  billingCycle: string;
  monthlyPrice: string | null;
  currency: string;
  startsOn: string | null;
  notes: string | null;
  colorsOverride: boolean | null;
  languagesOverride: number | null;
  branchesOverride: number | null;
}

export type MoneyByCurrency = { currency: string; total: number }[];

const PLAN_COLUMNS = {
  tier: true,
  billingCycle: true,
  monthlyPrice: true,
  currency: true,
  startsOn: true,
  notes: true,
  colorsOverride: true,
  languagesOverride: true,
  branchesOverride: true,
} as const;

const termsOf = (pricing: PlanPricing | null, plan: BillingPlan | null): PlanTerms | null =>
  pricing && {
    periodPrice: pricing.period,
    periodMonths: pricing.periodMonths,
    currency: pricing.currency,
    startsOn: plan?.startsOn ?? null,
  };

// Totals per currency (amounts in different currencies never add up).
function byCurrency(rows: { currency: string; amount: string | number }[]): MoneyByCurrency {
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(row.currency, (totals.get(row.currency) ?? 0) + Number(row.amount));
  return [...totals].map(([currency, total]) => ({ currency, total: Math.round(total * 100) / 100 }));
}

/**
 * One restaurant's plan, how many branches it has and what it may use, for
 * its Plan tab and the admin features card.
 */
export async function getRestaurantPlan(restaurantId: string): Promise<{
  plan: BillingPlan | null;
  branchCount: number;
  limits: Entitlements;
}> {
  const [plan, [branchRow]] = await Promise.all([
    db.query.restaurantBilling.findFirst({
      where: eq(restaurantBilling.restaurantId, restaurantId),
      columns: PLAN_COLUMNS,
    }),
    db.select({ n: count() }).from(branches).where(eq(branches.restaurantId, restaurantId)),
  ]);
  return { plan: plan ?? null, branchCount: branchRow?.n ?? 0, limits: limitsOf(plan) };
}

/** A restaurant as the Payments page's form and filters know it. */
export interface BillingRestaurant {
  id: string;
  name: string;
  slug: string;
  // "Pro", or null when not billed.
  tierLabel: string | null;
  // What a billing period costs; null when not billed.
  terms: PlanTerms | null;
  paidUntil: string | null;
}

/**
 * One row of the Payments list: a payment received, or a month a restaurant
 * hasn't paid for yet (overdue, or due within a week).
 */
export type PaymentEntry = {
  id: string;
  restaurantId: string | null;
  restaurantName: string;
  restaurantSlug: string | null;
  // The day it was paid, or the day it's due.
  date: string;
  // The month (or months) paid for.
  from: string;
  until: string;
  amount: number;
  currency: string;
} & (
  | { kind: "paid"; method: string; note: string | null }
  // `days` until it's due; negative when overdue.
  | { kind: "overdue" | "due"; days: number }
);

/**
 * Everything on the Payments page: every restaurant's plan and standing,
 * every payment received with every month still unpaid, and the reports.
 */
export async function getPaymentsPage() {
  const today = billingToday();
  const monthStart = `${today.slice(0, 7)}-01`;
  const yearStart = `${today.slice(0, 4)}-01-01`;

  const [list, plans, paidUntilRows, received, branchCounts] = await Promise.all([
    db.query.restaurants.findMany({
      columns: { id: true, name: true, slug: true },
      orderBy: (r, { asc }) => [asc(r.name)],
    }),
    db.query.restaurantBilling.findMany(),
    db
      .select({ restaurantId: payments.restaurantId, paidUntil: max(payments.coversUntil) })
      .from(payments)
      .groupBy(payments.restaurantId),
    db.query.payments.findMany({
      orderBy: [desc(payments.paidOn), desc(payments.createdAt)],
      with: { restaurant: { columns: { slug: true } } },
    }),
    db.select({ restaurantId: branches.restaurantId, n: count() }).from(branches).groupBy(branches.restaurantId),
  ]);

  const planBy = new Map(plans.map((p) => [p.restaurantId, p]));
  const paidUntilBy = new Map(paidUntilRows.map((r) => [r.restaurantId, r.paidUntil]));
  const branchesBy = new Map(branchCounts.map((r) => [r.restaurantId, r.n]));

  const restaurants: BillingRestaurant[] = list.map((r) => {
    const plan = planBy.get(r.id) ?? null;
    const pricing = planPricing(plan, limitsOf(plan), branchesBy.get(r.id) ?? 1);
    return {
      ...r,
      tierLabel: pricing ? TIER_FEATURES[pricing.tier].label : null,
      terms: termsOf(pricing, plan),
      paidUntil: paidUntilBy.get(r.id) ?? null,
    };
  });

  const pending: PaymentEntry[] = restaurants.flatMap((r) =>
    pendingDues(r.terms, r.paidUntil, today).map((due) => ({
      kind: due.days < 0 ? ("overdue" as const) : ("due" as const),
      id: `${r.id}:${due.from}`,
      restaurantId: r.id,
      restaurantName: r.name,
      restaurantSlug: r.slug,
      date: due.from,
      from: due.from,
      until: due.until,
      amount: due.amount,
      currency: due.currency,
      days: due.days,
    })),
  );
  const paid: PaymentEntry[] = received.map((p) => ({
    kind: "paid" as const,
    id: p.id,
    restaurantId: p.restaurantId,
    restaurantName: p.restaurantName,
    restaurantSlug: p.restaurant?.slug ?? null,
    date: p.paidOn,
    from: p.coversFrom,
    until: p.coversUntil,
    amount: Number(p.amount),
    currency: p.currency,
    method: p.method,
    note: p.note,
  }));

  const receivedFrom = (start: string, end?: string) =>
    received.filter((p) => p.paidOn >= start && (!end || p.paidOn < end));
  // Received per month, newest first, for the last 12 months.
  const months = Array.from({ length: 12 }, (_, i) => addMonths(monthStart, -i));
  const byMonth = months.map((start, i) => ({
    month: start,
    received: byCurrency(receivedFrom(start, i === 0 ? undefined : months[i - 1])),
  }));

  // Due today counts as owed; later this week as coming up.
  const owed = pending.filter((e) => e.kind !== "paid" && e.days <= 0);
  const upcoming = pending.filter((e) => e.kind !== "paid" && e.days > 0);
  // A yearly plan counts as its year's price spread over 12 months.
  const monthly = restaurants.flatMap((r) =>
    r.terms && r.terms.periodPrice > 0
      ? [{ currency: r.terms.currency, amount: r.terms.periodPrice / r.terms.periodMonths }]
      : [],
  );

  return {
    today,
    restaurants,
    entries: [...pending, ...paid],
    report: {
      receivedThisMonth: byCurrency(receivedFrom(monthStart)),
      receivedThisYear: byCurrency(receivedFrom(yearStart)),
      owedNow: byCurrency(owed),
      owingRestaurants: new Set(owed.map((e) => e.restaurantId)).size,
      dueThisWeek: byCurrency(upcoming),
      expectedMonthly: byCurrency(monthly),
      byMonth,
    },
  };
}
