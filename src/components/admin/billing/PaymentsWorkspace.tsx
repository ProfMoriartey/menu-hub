// src/components/admin/billing/PaymentsWorkspace.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DeletePaymentButton } from "~/components/admin/billing/billing-fields";
import { RecordPaymentForm, type PaymentPrefill } from "~/components/admin/billing/RecordPaymentForm";
import { addMonths, formatDay, formatMoney, methodLabel } from "~/lib/billing";
import { cn } from "~/lib/utils";
import type { BillingRestaurant, PaymentEntry } from "~/server/billing";
import { PERIOD_FILTERS, STATUS_FILTERS, type PaymentFilters } from "~/lib/payment-filters";

// Overdue first, then due, then paid.
const KIND_ORDER = { overdue: 0, due: 1, paid: 2 } as const;
// A ledger without a restaurant (it was deleted) has no Select value.
const ALL = "all";

/**
 * Every payment received and every month still unpaid, in one list with
 * status, restaurant and period filters and sortable columns. "+ Add
 * payment" and each pending month's "Mark paid" open the payment form.
 */
export function PaymentsWorkspace({
  entries,
  restaurants,
  today,
  initialFilters,
}: {
  entries: PaymentEntry[];
  restaurants: BillingRestaurant[];
  today: string;
  initialFilters: PaymentFilters;
}) {
  const locale = useLocale();
  const [filters, setFilters] = useState(initialFilters);
  const update = (patch: Partial<PaymentFilters>) => setFilters((f) => ({ ...f, ...patch }));
  // Open with what to fill in, or closed (null).
  const [adding, setAdding] = useState<{ prefill: PaymentPrefill | null } | null>(null);

  // Keep the address in step, so a reload or shared link keeps the view.
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.restaurant) params.set("restaurant", filters.restaurant);
    if (filters.period !== "all") params.set("period", filters.period);
    if (filters.sort !== "status") params.set("sort", filters.sort);
    if (filters.desc) params.set("desc", "1");
    const query = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [filters]);

  const range = useMemo((): [string, string] | null => {
    const monthStart = `${today.slice(0, 7)}-01`;
    switch (filters.period) {
      case "month":
        return [monthStart, addMonths(monthStart, 1)];
      case "lastMonth":
        return [addMonths(monthStart, -1), monthStart];
      case "year":
        return [`${today.slice(0, 4)}-01-01`, `${Number(today.slice(0, 4)) + 1}-01-01`];
      case "all":
        return null;
    }
  }, [filters.period, today]);

  const shown = useMemo(() => {
    const kept = entries.filter(
      (e) =>
        (filters.status === "all" ||
          (filters.status === "pending" ? e.kind !== "paid" : e.kind === filters.status)) &&
        (!filters.restaurant || e.restaurantId === filters.restaurant) &&
        (!range || (e.date >= range[0] && e.date < range[1])),
    );
    const collator = new Intl.Collator(locale);
    const compare = (a: PaymentEntry, b: PaymentEntry): number => {
      switch (filters.sort) {
        case "date":
          return a.date.localeCompare(b.date);
        case "restaurant":
          return collator.compare(a.restaurantName, b.restaurantName) || a.date.localeCompare(b.date);
        case "amount":
          return a.amount - b.amount;
        case "status":
          // Within a status: oldest unpaid month first, newest payment first.
          return (
            KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
            (a.kind === "paid" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date))
          );
      }
    };
    return kept.sort((a, b) => (filters.desc ? -compare(a, b) : compare(a, b)));
  }, [entries, filters, range, locale]);

  const total = (kinds: PaymentEntry["kind"][]) => {
    const sums = new Map<string, number>();
    for (const e of shown) if (kinds.includes(e.kind)) sums.set(e.currency, (sums.get(e.currency) ?? 0) + e.amount);
    return [...sums].map(([currency, sum]) => formatMoney(sum, currency, locale)).join(" + ");
  };
  const receivedTotal = total(["paid"]);
  const pendingTotal = total(["overdue", "due"]);

  const sortBy = (sort: PaymentFilters["sort"]) =>
    update(filters.sort === sort ? { desc: !filters.desc } : { sort, desc: sort === "date" || sort === "amount" });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">All payments</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Payments received, and months not paid yet (overdue, or due within a week).
          </p>
        </div>
        <Button onClick={() => setAdding({ prefill: null })}>
          <Plus className="h-4 w-4" /> Add payment
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Status" className="bg-muted inline-flex rounded-full p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filters.status === f.id}
              onClick={() => update({ status: f.id })}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium",
                filters.status === f.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Select
          value={filters.restaurant ?? ALL}
          onValueChange={(v) => update({ restaurant: v === ALL ? null : v })}
        >
          <SelectTrigger className="w-full sm:w-56" aria-label="Restaurant">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All restaurants</SelectItem>
            {restaurants.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.period} onValueChange={(v) => update({ period: v as PaymentFilters["period"] })}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_FILTERS.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-muted-foreground text-sm" role="status">
        {shown.length === 1 ? "1 row" : `${shown.length} rows`}
        {receivedTotal && ` · received ${receivedTotal}`}
        {pendingTotal && ` · pending ${pendingTotal}`}
      </p>

      <div className="bg-card border-border overflow-x-auto rounded-xl border shadow-sm">
        {shown.length === 0 ? (
          <p className="text-muted-foreground px-6 py-10 text-center text-sm">Nothing matches these filters.</p>
        ) : (
          <table className="w-full min-w-[860px] text-sm">
            <thead className="text-muted-foreground text-xs uppercase">
              <tr className="border-border border-b">
                <SortHeader label="Status" sort="status" filters={filters} onSort={sortBy} className="ps-5" />
                <SortHeader label="Restaurant" sort="restaurant" filters={filters} onSort={sortBy} />
                <SortHeader label="Date" sort="date" filters={filters} onSort={sortBy} />
                <th className="px-3 py-3 text-start font-medium">For</th>
                <SortHeader label="Amount" sort="amount" filters={filters} onSort={sortBy} end />
                <th className="px-3 py-3 text-start font-medium">Method · note</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {shown.map((e) => (
                <tr key={e.id} className="border-border border-b last:border-0">
                  <td className="px-3 py-2.5 ps-5">
                    <KindBadge entry={e} />
                  </td>
                  <td className="px-3 py-2.5">
                    {e.restaurantSlug ? (
                      <Link href={`/admin/restaurants/${e.restaurantSlug}/plan`} className="font-medium hover:underline">
                        {e.restaurantName}
                      </Link>
                    ) : (
                      <span className="font-medium">
                        {e.restaurantName} <span className="text-muted-foreground font-normal">(deleted)</span>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {e.kind === "paid" ? "Paid " : "Due "}
                    {formatDay(e.date, locale)}
                  </td>
                  <td className="text-muted-foreground px-3 py-2.5 whitespace-nowrap">
                    {formatDay(e.from, locale)} – {formatDay(e.until, locale)}
                  </td>
                  <td className="px-3 py-2.5 text-end font-medium whitespace-nowrap tabular-nums">
                    {formatMoney(e.amount, e.currency, locale)}
                  </td>
                  <td className="text-muted-foreground max-w-[14rem] truncate px-3 py-2.5">
                    {e.kind === "paid" ? [methodLabel(e.method), e.note].filter(Boolean).join(" · ") : null}
                  </td>
                  <td className="px-5 py-2.5 text-end whitespace-nowrap">
                    {e.kind === "paid" ? (
                      <DeletePaymentButton
                        payment={{
                          id: e.id,
                          amount: String(e.amount),
                          currency: e.currency,
                          paidOn: e.date,
                          restaurantName: e.restaurantName,
                        }}
                      />
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAdding({ prefill: { restaurantId: e.restaurantId!, coversFrom: e.from } })}
                      >
                        Mark paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={adding !== null} onOpenChange={(open) => !open && setAdding(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add a payment</DialogTitle>
            <DialogDescription>When a restaurant pays you, by bank transfer, cash or otherwise.</DialogDescription>
          </DialogHeader>
          {adding && (
            <RecordPaymentForm
              restaurants={restaurants}
              prefill={adding.prefill}
              today={today}
              onSaved={() => setAdding(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function SortHeader({
  label,
  sort,
  filters,
  onSort,
  end,
  className,
}: {
  label: string;
  sort: PaymentFilters["sort"];
  filters: PaymentFilters;
  onSort: (sort: PaymentFilters["sort"]) => void;
  end?: boolean;
  className?: string;
}) {
  const active = filters.sort === sort;
  const Arrow = filters.desc ? ArrowDown : ArrowUp;
  return (
    <th
      className={cn("px-3 py-3 font-medium", end ? "text-end" : "text-start", className)}
      aria-sort={active ? (filters.desc ? "descending" : "ascending") : undefined}
    >
      <button
        type="button"
        onClick={() => onSort(sort)}
        className={cn("inline-flex items-center gap-1 uppercase", active ? "text-foreground" : "hover:text-foreground")}
      >
        {label}
        {active && <Arrow className="h-3.5 w-3.5" aria-hidden />}
      </button>
    </th>
  );
}

function KindBadge({ entry }: { entry: PaymentEntry }) {
  const plural = (n: number) => `${n} day${n === 1 ? "" : "s"}`;
  const [label, tone] =
    entry.kind === "paid"
      ? ["Paid", "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"]
      : entry.kind === "overdue"
        ? [`Overdue ${plural(-entry.days)}`, "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"]
        : [
            entry.days === 0 ? "Due today" : entry.days === 1 ? "Due tomorrow" : `Due in ${plural(entry.days)}`,
            "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/40",
          ];
  return (
    <span
      className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", tone)}
    >
      {label}
    </span>
  );
}
