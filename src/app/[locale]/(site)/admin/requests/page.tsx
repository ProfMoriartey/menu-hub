// app/admin/requests/page.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { MessageCircle, Phone } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import { RequestActions } from "~/components/admin/RequestActions";
import { getPlanRequests, type PlanRequestRow } from "~/server/plan-requests";
import { formatMoney, methodLabel } from "~/lib/billing";
import { PLAN_CURRENCY, TIER_FEATURES, isTier, periodPrice } from "~/lib/plans";
import { cn } from "~/lib/utils";

export const metadata: Metadata = { title: "Requests | Menupedia admin" };

/**
 * What owners are waiting for: new restaurants to approve (signed up with
 * a plan and how they'd like to pay) and plan changes. Approving a sign-up
 * lets the owner put the menu live; approving a change moves the
 * restaurant to that plan.
 */
export default async function AdminRequestsPage() {
  const [locale, open, handled] = await Promise.all([
    getLocale(),
    getPlanRequests({ open: true }),
    getPlanRequests({ open: false }),
  ]);
  const when = (date: Date) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Requests</h1>
        <p className="text-muted-foreground mt-1">
          New restaurants waiting for approval, and plan changes owners asked for. Get in touch, agree on payment,
          then approve.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">
          Waiting <span className="text-muted-foreground text-base font-normal tabular-nums">{open.length}</span>
        </h2>
        {open.length === 0 ? (
          <p className="border-border text-muted-foreground rounded-xl border border-dashed px-6 py-8 text-center text-sm">
            Nothing is waiting.
          </p>
        ) : (
          <ul className="space-y-3">
            {open.map((r) => (
              <li key={r.id} className="bg-card border-border space-y-3 rounded-xl border p-5 shadow-sm">
                <RequestSummary request={r} when={when(r.createdAt)} locale={locale}>
                  <RequestActions
                    requestId={r.id}
                    approveLabel={r.kind === "signup" ? "Approve, can go live" : "Approve, change plan"}
                  />
                </RequestSummary>
              </li>
            ))}
          </ul>
        )}
      </section>

      {handled.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Dealt with</h2>
          <ul className="bg-card border-border divide-border divide-y rounded-xl border shadow-sm">
            {handled.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-sm">
                <KindBadge kind={r.kind} />
                <Link href={`/admin/restaurants/${r.restaurant.slug}/plan`} className="font-medium hover:underline">
                  {r.restaurant.name}
                </Link>
                <span className="text-muted-foreground">
                  {isTier(r.tier) ? TIER_FEATURES[r.tier].label : r.tier}
                </span>
                <span
                  className={cn(
                    "ms-auto text-xs font-medium",
                    r.resolution === "approved" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                  )}
                >
                  {r.resolution === "approved" ? "Approved" : "Dismissed"}
                  {r.resolvedAt && ` · ${when(r.resolvedAt)}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function RequestSummary({
  request: r,
  when,
  locale,
  children,
}: {
  request: PlanRequestRow & {
    restaurant: { name: string; slug: string; logoUrl: string | null };
    requester: { email: string | null } | null;
  };
  when: string;
  locale: string;
  children: ReactNode;
}) {
  const tier = isTier(r.tier) ? TIER_FEATURES[r.tier] : null;
  const phone = r.contactPhone?.replace(/[^\d+]/g, "");
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <RestaurantLogo restaurant={r.restaurant} className="h-10 w-10 rounded-lg" imageSizes="40px" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <KindBadge kind={r.kind} />
              <Link href={`/admin/restaurants/${r.restaurant.slug}/plan`} className="font-semibold hover:underline">
                {r.restaurant.name}
              </Link>
            </div>
            <p className="text-muted-foreground text-sm">
              {r.requester?.email ?? "Unknown account"} · {when}
            </p>
          </div>
        </div>
        <Link
          href={`/${r.restaurant.slug}`}
          target="_blank"
          className="text-primary text-sm font-medium hover:underline"
        >
          Preview menu
        </Link>
      </div>
      <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="font-medium">
            {tier ? tier.label : r.tier} · {r.billingCycle === "yearly" ? "yearly" : "monthly"}
            {tier && ` · ${formatMoney(periodPrice(tier.price, r.billingCycle), PLAN_CURRENCY, locale)}`}
          </dd>
        </div>
        {r.paymentMethod && (
          <div>
            <dt className="text-muted-foreground">Would like to pay by</dt>
            <dd className="font-medium">{methodLabel(r.paymentMethod)}</dd>
          </div>
        )}
        {r.contactPhone && (
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="flex flex-wrap items-center gap-3 font-medium">
              <a href={`tel:${phone}`} className="inline-flex items-center gap-1 hover:underline" dir="ltr">
                <Phone className="h-3.5 w-3.5" aria-hidden /> {r.contactPhone}
              </a>
              <a
                href={`https://wa.me/${phone?.replace(/^\+/, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary inline-flex items-center gap-1 hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden /> WhatsApp
              </a>
            </dd>
          </div>
        )}
      </dl>
      {r.note && <p className="bg-muted/50 rounded-lg px-3 py-2 text-sm whitespace-pre-line">{r.note}</p>}
      {children}
    </>
  );
}

function KindBadge({ kind }: { kind: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        kind === "signup" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
      )}
    >
      {kind === "signup" ? "New sign-up" : "Plan change"}
    </span>
  );
}
