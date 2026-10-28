// src/lib/payment-filters.ts
// The admin Payments list's filters and sort, shared by the page (which
// reads them from the address) and the list.

export const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "overdue", label: "Overdue" },
  { id: "paid", label: "Paid" },
] as const;
export const PERIOD_FILTERS = [
  { id: "all", label: "Any time" },
  { id: "month", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "year", label: "This year" },
] as const;
const SORTS = ["status", "date", "restaurant", "amount"] as const;

export interface PaymentFilters {
  status: (typeof STATUS_FILTERS)[number]["id"];
  restaurant: string | null;
  period: (typeof PERIOD_FILTERS)[number]["id"];
  sort: (typeof SORTS)[number];
  desc: boolean;
}

/** Filters from the address (?status=&restaurant=&period=&sort=&desc=1). */
export function filtersFrom(params: Record<string, string | undefined>): PaymentFilters {
  const pick = <T extends string>(value: string | undefined, allowed: readonly T[], fallback: T) =>
    allowed.find((x) => x === value) ?? fallback;
  return {
    status: pick(params.status, STATUS_FILTERS.map((f) => f.id), "all"),
    restaurant: params.restaurant ?? null,
    period: pick(params.period, PERIOD_FILTERS.map((f) => f.id), "all"),
    sort: pick(params.sort, SORTS, "status"),
    desc: params.desc === "1",
  };
}
