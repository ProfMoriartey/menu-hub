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

/**
 * What a billed restaurant pays: a price each period (a month, or a year)
 * in a currency, from a start date. Null when it isn't billed.
 */
export interface PlanTerms {
  periodPrice: number;
  periodMonths: number;
  currency: string;
  startsOn: string | null;
}

/**
 * The last day covered: the latest paid day, or the day before the plan
 * starts when nothing was paid yet (null when neither is known).
 */
export const coveredUntil = (startsOn: string | null, paidUntil: string | null) =>
  paidUntil ?? (startsOn ? addDays(startsOn, -1) : null);

/**
 * Where a new payment's period starts: the day after the covered period
 * ends, so periods follow each other with no gap (a late payment still pays
 * for the days since), or the payment day when nothing is known.
 */
export const nextPeriodStart = (startsOn: string | null, paidUntil: string | null, paidOn: string) => {
  const covered = coveredUntil(startsOn, paidUntil);
  return covered ? addDays(covered, 1) : paidOn;
};

/** A period a restaurant should pay for and hasn't (worked out, not stored). */
export interface PendingDue {
  // The first day of the period, which is also the day it's due.
  from: string;
  until: string;
  amount: number;
  currency: string;
  // Days until it's due; negative when overdue.
  days: number;
}

// A plan left unpaid for years would otherwise list without end.
const MAX_PENDING = 36;

/**
 * The periods (months, or years) a billed restaurant hasn't paid for: each
 * from the end of what it has paid (or its "billed from" date), up to those
 * due within DUE_SOON_DAYS. A plan never paid and without a start date is
 * due today. None when it isn't billed or costs nothing.
 */
export function pendingDues(terms: PlanTerms | null, paidUntil: string | null, today: string): PendingDue[] {
  if (!terms || !(terms.periodPrice > 0)) return [];
  const start = nextPeriodStart(terms.startsOn, paidUntil, today);
  const horizon = addDays(today, DUE_SOON_DAYS);
  const dues: PendingDue[] = [];
  for (let n = 0; n < MAX_PENDING; n++) {
    const from = addMonths(start, n * terms.periodMonths);
    if (from > horizon) break;
    dues.push({
      from,
      until: addDays(addMonths(start, (n + 1) * terms.periodMonths), -1),
      amount: terms.periodPrice,
      currency: terms.currency,
      days: daysBetween(today, from),
    });
  }
  return dues;
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
