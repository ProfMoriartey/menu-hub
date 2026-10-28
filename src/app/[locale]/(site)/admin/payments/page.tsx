// app/admin/payments/page.tsx
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { PaymentsWorkspace } from "~/components/admin/billing/PaymentsWorkspace";
import { getPaymentsPage, type MoneyByCurrency } from "~/server/billing";
import { formatDay, formatMoney } from "~/lib/billing";
import { filtersFrom } from "~/lib/payment-filters";
import { cn } from "~/lib/utils";

export const metadata: Metadata = { title: "Payments | Menupedia admin" };

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * All the money in one place: what came in and what's owed, every payment
 * received and every month still unpaid (to filter, sort, add or mark
 * paid), and income per month. Plans are set on each restaurant's Plan tab.
 */
export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [locale, { today, restaurants, entries, report }] = await Promise.all([getLocale(), getPaymentsPage()]);
  const initialFilters = filtersFrom(
    Object.fromEntries(Object.entries(params).map(([key, value]) => [key, one(value)])),
  );
  // An unknown restaurant in the address would hide everything.
  if (initialFilters.restaurant && !restaurants.some((r) => r.id === initialFilters.restaurant)) {
    initialFilters.restaurant = null;
  }

  const money = (list: MoneyByCurrency) =>
    list.length ? list.map((x) => formatMoney(x.total, x.currency, locale)).join(" + ") : "—";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Every restaurant&apos;s payments, received and due. Today is {formatDay(today, locale)}.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Tile label="Received this month" value={money(report.receivedThisMonth)} />
        <Tile label="Received this year" value={money(report.receivedThisYear)} />
        <Tile
          label={
            report.owingRestaurants === 1
              ? "Owed now, by 1 restaurant"
              : `Owed now, by ${report.owingRestaurants} restaurants`
          }
          value={money(report.owedNow)}
          tone={report.owingRestaurants > 0 ? "bad" : undefined}
        />
        <Tile label="Due in the next 7 days" value={money(report.dueThisWeek)} />
        <Tile label="Expected each month" value={money(report.expectedMonthly)} />
      </dl>

      <PaymentsWorkspace
        entries={entries}
        restaurants={restaurants}
        today={today}
        initialFilters={initialFilters}
      />

      <section className="max-w-xl space-y-4">
        <div>
          <h2 className="text-xl font-bold">Received by month</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">The last 12 months.</p>
        </div>
        <ul className="bg-card border-border divide-border divide-y rounded-xl border text-sm shadow-sm">
          {report.byMonth.map((m) => (
            <li key={m.month} className="flex items-center justify-between gap-4 px-5 py-2.5">
              <span>
                {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(
                  new Date(`${m.month}T00:00:00Z`),
                )}
              </span>
              <span className={cn("tabular-nums", m.received.length ? "font-medium" : "text-muted-foreground")}>
                {money(m.received)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: "bad" }) {
  return (
    <div className="bg-card border-border rounded-xl border px-5 py-4 shadow-sm">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className={cn("mt-1 text-xl font-bold tabular-nums", tone === "bad" && "text-red-600 dark:text-red-400")}>
        {value}
      </dd>
    </div>
  );
}
