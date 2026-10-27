// src/components/admin/billing/BillingStatusBadge.tsx
import { cn } from "~/lib/utils";
import type { BillingStatus } from "~/lib/billing";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function billingStatusText(status: BillingStatus): string {
  switch (status.kind) {
    case "notBilled":
      return "Not billed";
    case "free":
      return "Free";
    case "unpaid":
      return "Never paid";
    case "overdue":
      return `Overdue ${plural(status.days, "day")}`;
    case "dueSoon":
      return status.days === 0 ? "Due today" : `Due in ${plural(status.days, "day")}`;
    case "paid":
      return "Paid";
  }
}

const TONE: Record<BillingStatus["kind"], string> = {
  overdue: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
  unpaid: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
  dueSoon: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/40",
  paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  free: "bg-muted text-muted-foreground border-border",
  notBilled: "bg-muted text-muted-foreground border-border",
};

/** A restaurant's billing standing, as a coloured pill with its words. */
export function BillingStatusBadge({ status, className }: { status: BillingStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE[status.kind],
        className,
      )}
    >
      {billingStatusText(status)}
    </span>
  );
}
