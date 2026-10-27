// src/lib/billing.ts
// Billing recorded by hand (schema.ts: restaurantBilling, payments): the
// dates a payment covers and whether a restaurant is paid up. Days are
// "YYYY-MM-DD" strings in the business's time zone.
import { zonedDay } from "~/lib/opening-hours";

// The business is run from Turkey: "today" and "this month" are Istanbul's.
export const BILLING_TIME_ZONE = "Europe/Istanbul";

export const BILLING_CURRENCIES = ["TRY", "USD", "EUR", "GBP"] as const;

export const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  PAYMENT_METHODS.some((m) => m.value === value);

export const methodLabel = (value: string) =>
  PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;

// "Due soon" this many days before the paid period ends.
export const DUE_SOON_DAYS = 7;

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** A real calendar day as "YYYY-MM-DD". */
export const isDay = (value: unknown): value is string =>
  typeof value === "string" &&
  DAY.test(value) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

export const billingToday = () => zonedDay(new Date(), BILLING_TIME_ZONE);

export function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The same day `months` later, or that month's last day (31 Jan → 28 Feb). */
export function addMonths(day: string, months: number): string {
  const [year, month, date] = day.split("-").map(Number) as [number, number, number];
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date, lastDay));
  return target.toISOString().slice(0, 10);
}

/** The last day paid for by `months` months starting on `from`. */
export const coversUntil = (from: string, months: number) => addDays(addMonths(from, months), -1);

/** Days from `from` to `to` (negative when `to` is earlier). */
export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

export interface PlanTerms {
  planName: string | null;
  monthlyPrice: string | null;
  startsOn: string | null;
}

/**
 * The last day covered: the latest paid day, or the day before the plan
 * starts when nothing was paid yet (null when neither is known).
 */
export const coveredUntil = (plan: PlanTerms | null, paidUntil: string | null) =>
  paidUntil ?? (plan?.startsOn ? addDays(plan.startsOn, -1) : null);

/**
 * Where a new payment's period starts: the day after the covered period
 * ends, so periods follow each other with no gap (a late payment still pays
 * for the days since), or the payment day when nothing is known.
 */
export const nextPeriodStart = (plan: PlanTerms | null, paidUntil: string | null, paidOn: string) => {
  const covered = coveredUntil(plan, paidUntil);
  return covered ? addDays(covered, 1) : paidOn;
};

/**
 * How many monthly periods have begun since the covered period ended, up
 * to `today`: what a late restaurant owes. One for a plan that was never
 * paid and has no start date (its first payment).
 */
export function unpaidPeriods(plan: PlanTerms | null, paidUntil: string | null, today: string): number {
  const covered = coveredUntil(plan, paidUntil);
  if (!covered) return 1;
  const start = addDays(covered, 1);
  let periods = 0;
  while (addMonths(start, periods) <= today) periods++;
  return periods;
}

/** What a restaurant owes on `today`, or null when it owes nothing. */
export function amountOwed(
  plan: (PlanTerms & { currency: string }) | null,
  paidUntil: string | null,
  status: BillingStatus,
  today: string,
): { amount: number; currency: string; periods: number } | null {
  if (!plan?.monthlyPrice || (status.kind !== "overdue" && status.kind !== "unpaid")) return null;
  const periods = unpaidPeriods(plan, paidUntil, today);
  const amount = Math.round(Number(plan.monthlyPrice) * periods * 100) / 100;
  return amount > 0 ? { amount, currency: plan.currency, periods } : null;
}

export type BillingStatus =
  | { kind: "notBilled" }
  | { kind: "free" }
  | { kind: "unpaid" }
  | { kind: "notStarted"; days: number }
  | { kind: "overdue"; days: number }
  | { kind: "dueSoon"; days: number }
  | { kind: "paid"; days: number };

/**
 * A restaurant's standing on `today`: not billed (no plan), free (price 0),
 * never paid (no start date), starting later, overdue by N days, due within
 * DUE_SOON_DAYS, or paid.
 */
export function billingStatus(
  plan: PlanTerms | null,
  paidUntil: string | null,
  today: string,
): BillingStatus {
  if (!plan?.planName) return paidUntil ? statusByDate(paidUntil, today) : { kind: "notBilled" };
  if (plan.monthlyPrice !== null && Number(plan.monthlyPrice) === 0) return { kind: "free" };
  const covered = coveredUntil(plan, paidUntil);
  if (!covered) return { kind: "unpaid" };
  const status = statusByDate(covered, today);
  // Nothing paid yet and the plan starts well ahead.
  if (!paidUntil && status.kind === "paid") return { kind: "notStarted", days: status.days };
  return status;
}

// Counted to the due day: the first day not paid for.
function statusByDate(paidUntil: string, today: string): BillingStatus {
  const days = daysBetween(today, addDays(paidUntil, 1));
  if (days < 0) return { kind: "overdue", days: -days };
  if (days <= DUE_SOON_DAYS) return { kind: "dueSoon", days };
  return { kind: "paid", days };
}

/** Lists first what needs a reminder: most overdue, then unpaid, due soon… */
export function statusRank(status: BillingStatus): number {
  switch (status.kind) {
    case "overdue":
      return -100_000 - status.days;
    case "unpaid":
      return -50_000;
    case "dueSoon":
      return status.days;
    case "paid":
      return 1_000 + status.days;
    case "notStarted":
      return 2_000 + status.days;
    case "free":
      return 100_000;
    case "notBilled":
      return 200_000;
  }
}

/** "1.250,00 ₺"-style, in the admin's language. */
export const formatMoney = (amount: string | number, currency: string, locale: string) => {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(Number(amount));
  } catch {
    return `${amount} ${currency}`;
  }
};

/** A day in words, "27 Oct 2026", in the admin's language. */
export const formatDay = (day: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
