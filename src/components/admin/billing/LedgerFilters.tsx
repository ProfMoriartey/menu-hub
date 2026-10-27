// src/components/admin/billing/LedgerFilters.tsx
"use client";

import { useRouter } from "~/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

// Radix Select items can't have an empty value.
const ALL = "all";

/** The payments list's restaurant and period filters, kept in the address. */
export function LedgerFilters({
  restaurants,
  restaurantId,
  periods,
  period,
}: {
  restaurants: { id: string; name: string }[];
  restaurantId: string | null;
  periods: readonly { id: string; label: string }[];
  period: string;
}) {
  const router = useRouter();
  const go = (next: { restaurant?: string | null; period?: string }) => {
    const params = new URLSearchParams();
    const r = next.restaurant !== undefined ? next.restaurant : restaurantId;
    const p = next.period ?? period;
    if (r) params.set("restaurant", r);
    if (p !== "all") params.set("period", p);
    const query = params.toString();
    router.push(`/admin/payments${query ? `?${query}` : ""}#ledger`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={restaurantId ?? ALL} onValueChange={(v) => go({ restaurant: v === ALL ? null : v })}>
        <SelectTrigger className="w-full sm:w-64" aria-label="Restaurant">
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
      <div role="group" aria-label="Period" className="flex flex-wrap gap-1.5">
        {periods.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={period === p.id}
            onClick={() => go({ period: p.id })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium",
              period === p.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
