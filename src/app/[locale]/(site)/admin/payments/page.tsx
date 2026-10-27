// app/admin/payments/page.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import { BillingStatusBadge } from "~/components/admin/billing/BillingStatusBadge";
import { DeletePaymentButton } from "~/components/admin/billing/billing-fields";
import { LedgerFilters } from "~/components/admin/billing/LedgerFilters";
import { RecordPaymentForm } from "~/components/admin/billing/RecordPaymentForm";
import {
  PAYMENT_PERIODS,
  getPaymentsPage,
  type BillingRestaurant,
  type MoneyByCurrency,
  type PaymentPeriod,
} from "~/server/billing";
import { formatDay, formatMoney, methodLabel, statusRank } from "~/lib/billing";
import { isUuid } from "~/lib/slug";
import { cn } from "~/lib/utils";

export const metadata: Metadata = { title: "Payments | Menupedia admin" };

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const isDue = (r: BillingRestaurant) =>
  r.status.kind === "overdue" || r.status.kind === "unpaid" || r.status.kind === "dueSoon";

/**
 * Money in one place: what came in and what's owed, who is due or late
 * (with a button to record their payment), recording a payment for any
 * restaurant, every payment (by restaurant and period), and every plan.
 */
export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const restaurantParam = one(params.restaurant);
  const restaurantId = restaurantParam && isUuid(restaurantParam) ? restaurantParam : null;
  const period: PaymentPeriod = PAYMENT_PERIODS.find((p) => p.id === one(params.period))?.id ?? "all";
  const record = one(params.record) ?? null;

  const [locale, data] = await Promise.all([getLocale(), getPaymentsPage({ restaurantId, period })]);
  const { report, restaurants, ledger, ledgerTotal, today } = data;

  const money = (list: MoneyByCurrency) =>
    list.length ? list.map((x) => formatMoney(x.total, x.currency, locale)).join(" + ") : "—";
  const byRank = (a: BillingRestaurant, b: BillingRestaurant) => statusRank(a.status) - statusRank(b.status);
  const due = restaurants.filter(isDue).sort(byRank);
  const billed = restaurants.filter((r) => r.plan?.planName).sort(byRank);
  const filteredName = restaurants.find((r) => r.id === restaurantId)?.name;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Payments you receive by hand, from every restaurant. Today is {formatDay(today, locale)}.
        </p>
      </div>

      {/* Report */}
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Tile label="Received this month" value={money(report.thisMonth)} />
        <Tile label="Received last month" value={money(report.lastMonth)} />
        <Tile label="Received this year" value={money(report.thisYear)} />
        <Tile
          label={report.owingCount === 1 ? "Owed now, by 1 restaurant" : `Owed now, by ${report.owingCount} restaurants`}
          value={money(report.outstanding)}
          tone={report.owingCount > 0 ? "bad" : undefined}
        />
        <Tile label="Expected each month" value={money(report.expectedMonthly)} />
      </dl>

      {/* Due and late */}
      <Section
        title="Due and late"
        description="Late, never paid, or due in the next 7 days. Most urgent first."
      >
        {due.length === 0 ? (
          <Empty>Nobody is due or late.</Empty>
        ) : (
          <ul className="bg-card border-border divide-border divide-y rounded-xl border shadow-sm">
            {due.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                <RestaurantCell restaurant={r} />
                <BillingStatusBadge status={r.status} />
                <span className="text-muted-foreground text-sm">
                  {r.paidUntil ? `Paid until ${formatDay(r.paidUntil, locale)}` : "Nothing paid yet"}
                </span>
                {r.owed && (
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    Owes {formatMoney(r.owed.amount, r.owed.currency, locale)}
                  </span>
                )}
                <Button size="sm" className="ms-auto" asChild>
                  <Link href={`/admin/payments?record=${r.id}#record`} scroll={false}>
                    Record payment
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Record */}
      <section id="record" className="bg-card border-border scroll-mt-24 rounded-xl border shadow-sm">
        <header className="border-border border-b px-6 py-4">
          <h2 className="text-base font-semibold">Record a payment</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            When a restaurant pays you, by bank transfer, cash or otherwise.
          </p>
        </header>
        <div className="px-6 py-5">
          <RecordPaymentForm
            // A "Record payment" button picks the restaurant afresh.
            key={record ?? "none"}
            restaurants={restaurants.map(({ id, name, plan, paidUntil }) => ({ id, name, plan, paidUntil }))}
            initialRestaurantId={record}
            today={today}
          />
        </div>
      </section>

      {/* Ledger */}
      <Section
        id="ledger"
        title={filteredName ? `Payments from ${filteredName}` : "All payments"}
        description={
          ledger.length === 0
            ? undefined
            : `${ledger.length === 1 ? "1 payment" : `${ledger.length} payments`}, ${money(ledgerTotal)} in total.`
        }
      >
        <LedgerFilters
          restaurants={restaurants.map(({ id, name }) => ({ id, name }))}
          restaurantId={restaurantId}
          periods={PAYMENT_PERIODS}
          period={period}
        />
        {ledger.length === 0 ? (
          <Empty>No payments match.</Empty>
        ) : (
          <div className="bg-card border-border overflow-x-auto rounded-xl border shadow-sm">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="text-muted-foreground text-xs uppercase">
                <tr className="border-border border-b">
                  <th className="px-5 py-3 text-start font-medium">Paid on</th>
                  <th className="px-3 py-3 text-start font-medium">Restaurant</th>
                  <th className="px-3 py-3 text-end font-medium">Amount</th>
                  <th className="px-3 py-3 text-start font-medium">Pays for</th>
                  <th className="px-3 py-3 text-start font-medium">Method</th>
                  <th className="px-3 py-3 text-start font-medium">Note</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {ledger.map((p) => (
                  <tr key={p.id} className="border-border border-b last:border-0">
                    <td className="px-5 py-2.5 whitespace-nowrap">{formatDay(p.paidOn, locale)}</td>
                    <td className="px-3 py-2.5">
                      {p.restaurant ? (
                        <Link
                          href={`/admin/restaurants/${p.restaurant.slug}/plan`}
                          className="font-medium hover:underline"
                        >
                          {p.restaurantName}
                        </Link>
                      ) : (
                        <span className="font-medium">
                          {p.restaurantName} <span className="text-muted-foreground font-normal">(deleted)</span>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-end font-medium whitespace-nowrap tabular-nums">
                      {formatMoney(p.amount, p.currency, locale)}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {formatDay(p.coversFrom, locale)} – {formatDay(p.coversUntil, locale)}
                    </td>
                    <td className="px-3 py-2.5">{methodLabel(p.method)}</td>
                    <td className="text-muted-foreground max-w-[14rem] truncate px-3 py-2.5">{p.note}</td>
                    <td className="px-5 py-2.5 text-end">
                      <DeletePaymentButton payment={p} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Plans */}
        <Section title="Plans" description="Every restaurant with a plan, most urgent first.">
          {billed.length === 0 ? (
            <Empty>No restaurant has a plan yet. Set one on a restaurant&apos;s Plan tab.</Empty>
          ) : (
            <div className="bg-card border-border overflow-x-auto rounded-xl border shadow-sm">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="text-muted-foreground text-xs uppercase">
                  <tr className="border-border border-b">
                    <th className="px-5 py-3 text-start font-medium">Restaurant</th>
                    <th className="px-3 py-3 text-start font-medium">Plan</th>
                    <th className="px-3 py-3 text-end font-medium">Monthly</th>
                    <th className="px-3 py-3 text-start font-medium">Paid until</th>
                    <th className="px-5 py-3 text-start font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {billed.map((r) => (
                    <tr key={r.id} className="border-border border-b last:border-0">
                      <td className="px-5 py-2.5">
                        <RestaurantCell restaurant={r} />
                      </td>
                      <td className="px-3 py-2.5">{r.plan?.planName}</td>
                      <td className="px-3 py-2.5 text-end whitespace-nowrap tabular-nums">
                        {r.plan?.monthlyPrice ? formatMoney(r.plan.monthlyPrice, r.plan.currency, locale) : "—"}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {r.paidUntil ? formatDay(r.paidUntil, locale) : "—"}
                      </td>
                      <td className="px-5 py-2.5">
                        <BillingStatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* By month */}
        <Section title="Received by month" description="The last 12 months.">
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
        </Section>
      </div>
    </div>
  );
}

function RestaurantCell({ restaurant }: { restaurant: BillingRestaurant }) {
  return (
    <Link
      href={`/admin/restaurants/${restaurant.slug}/plan`}
      className="flex min-w-0 items-center gap-3 font-medium hover:underline"
    >
      <RestaurantLogo restaurant={restaurant} className="h-8 w-8 rounded-lg text-xs" imageSizes="32px" />
      <span className="truncate">{restaurant.name}</span>
      {!restaurant.isActive && <span className="text-muted-foreground text-xs font-normal">(not live)</span>}
    </Link>
  );
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="border-border text-muted-foreground rounded-xl border border-dashed px-6 py-8 text-center text-sm">
      {children}
    </p>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: "bad" }) {
  return (
    <div className="bg-card border-border rounded-xl border px-5 py-4 shadow-sm">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-xl font-bold tabular-nums",
          tone === "bad" && "text-red-600 dark:text-red-400",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
