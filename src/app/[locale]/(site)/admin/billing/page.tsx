// app/admin/billing/page.tsx
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { cn } from "~/lib/utils";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import { BillingStatusBadge } from "~/components/admin/billing/BillingStatusBadge";
import { getBillingOverview, type BillingOverviewRow } from "~/server/billing";
import { formatDay, formatMoney, methodLabel, statusRank } from "~/lib/billing";

export const metadata: Metadata = { title: "Billing | Menupedia admin" };

const FILTERS = [
  { id: "attention", label: "Needs attention" },
  { id: "billed", label: "Billed" },
  { id: "all", label: "All restaurants" },
] as const;
type FilterId = (typeof FILTERS)[number]["id"];

const needsAttention = (row: BillingOverviewRow) =>
  row.status.kind === "overdue" || row.status.kind === "unpaid" || row.status.kind === "dueSoon";
const isBilled = (row: BillingOverviewRow) => Boolean(row.plan?.planName);

/**
 * Who has paid and who hasn't: every restaurant's plan and paid-until date,
 * most urgent first, what's expected each month and what came in.
 */
export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const [{ show }, locale, overview] = await Promise.all([searchParams, getLocale(), getBillingOverview()]);
  const filter: FilterId = FILTERS.find((f) => f.id === show)?.id ?? "billed";

  const rows = [...overview.rows].sort((a, b) => statusRank(a.status) - statusRank(b.status));
  const counts: Record<FilterId, number> = {
    attention: rows.filter(needsAttention).length,
    billed: rows.filter(isBilled).length,
    all: rows.length,
  };
  const shown = rows.filter(filter === "attention" ? needsAttention : filter === "billed" ? isBilled : () => true);
  const overdue = rows.filter((r) => r.status.kind === "overdue" || r.status.kind === "unpaid").length;
  const dueSoon = rows.filter((r) => r.status.kind === "dueSoon").length;
  const money = (list: { currency: string; total: string | number }[]) =>
    list.length ? list.map((x) => formatMoney(x.total, x.currency, locale)).join(" + ") : "—";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Plans and payments you record by hand. Today is {formatDay(overview.today, locale)}.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Overdue or never paid" value={String(overdue)} tone={overdue > 0 ? "bad" : undefined} />
        <Tile label="Due in the next 7 days" value={String(dueSoon)} tone={dueSoon > 0 ? "warn" : undefined} />
        <Tile label="Expected each month" value={money(overview.expectedMonthly)} />
        <Tile label="Received this month" value={money(overview.collectedThisMonth)} />
      </dl>

      <section className="space-y-4">
        <nav aria-label="Filter" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={`/admin/billing?show=${f.id}`}
              aria-current={filter === f.id ? "page" : undefined}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium",
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label} <span className="opacity-70 tabular-nums">{counts[f.id]}</span>
            </Link>
          ))}
        </nav>

        <div className="bg-card border-border overflow-x-auto rounded-xl border shadow-sm">
          {shown.length === 0 ? (
            <p className="text-muted-foreground px-6 py-10 text-center text-sm">
              {filter === "attention"
                ? "Nothing needs attention: everyone billed is paid up."
                : filter === "billed"
                  ? "No restaurant has a plan yet. Set one on a restaurant's Billing tab."
                  : "No restaurants yet."}
            </p>
          ) : (
            <table className="w-full min-w-[760px] text-sm">
              <thead className="text-muted-foreground text-xs uppercase">
                <tr className="border-border border-b">
                  <th className="px-5 py-3 text-start font-medium">Restaurant</th>
                  <th className="px-3 py-3 text-start font-medium">Plan</th>
                  <th className="px-3 py-3 text-end font-medium">Monthly</th>
                  <th className="px-3 py-3 text-start font-medium">Paid until</th>
                  <th className="px-3 py-3 text-start font-medium">Status</th>
                  <th className="px-5 py-3 text-start font-medium">Last payment</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((row) => (
                  <tr key={row.id} className="border-border hover:bg-muted/40 border-b last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/restaurants/${row.slug}/billing`}
                        className="flex items-center gap-3 font-medium hover:underline"
                      >
                        <RestaurantLogo restaurant={row} className="h-8 w-8 rounded-lg text-xs" imageSizes="32px" />
                        <span className="truncate">{row.name}</span>
                        {!row.isActive && (
                          <span className="text-muted-foreground text-xs font-normal">(not live)</span>
                        )}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      {row.plan?.planName ?? <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-3 py-3 text-end whitespace-nowrap tabular-nums">
                      {row.plan?.monthlyPrice ? formatMoney(row.plan.monthlyPrice, row.plan.currency, locale) : "—"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {row.paidUntil ? formatDay(row.paidUntil, locale) : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <BillingStatusBadge status={row.status} />
                    </td>
                    <td className="text-muted-foreground px-5 py-3 whitespace-nowrap">
                      {row.lastPayment
                        ? `${formatMoney(row.lastPayment.amount, row.lastPayment.currency, locale)} · ${formatDay(row.lastPayment.paidOn, locale)}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Latest payments</h2>
        {overview.recent.length === 0 ? (
          <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
        ) : (
          <ul className="bg-card border-border divide-border divide-y rounded-xl border shadow-sm">
            {overview.recent.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3 text-sm"
              >
                <span className="min-w-0">
                  {p.restaurant ? (
                    <Link
                      href={`/admin/restaurants/${p.restaurant.slug}/billing`}
                      className="font-medium hover:underline"
                    >
                      {p.restaurantName}
                    </Link>
                  ) : (
                    <span className="font-medium">
                      {p.restaurantName} <span className="text-muted-foreground font-normal">(deleted)</span>
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    {" "}
                    · {formatDay(p.paidOn, locale)} · {methodLabel(p.method)}
                  </span>
                </span>
                <span className="font-medium tabular-nums">{formatMoney(p.amount, p.currency, locale)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: "bad" | "warn" }) {
  return (
    <div className="bg-card border-border rounded-xl border px-5 py-4 shadow-sm">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          tone === "bad" && "text-red-600 dark:text-red-400",
          tone === "warn" && "text-amber-600 dark:text-amber-400",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
