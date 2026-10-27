// src/components/admin/billing/RestaurantPlanPanel.tsx
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useLocale } from "next-intl";
import { Plus, Receipt } from "lucide-react";
import { Link, useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Field, FormSection } from "~/components/forms/fields";
import { BillingStatusBadge } from "~/components/admin/billing/BillingStatusBadge";
import { CurrencySelect, SaveState } from "~/components/admin/billing/billing-fields";
import { saveBillingPlan } from "~/app/actions/billing";
import { formatDay, formatMoney, methodLabel, type BillingStatus } from "~/lib/billing";
import type { BillingPlan, PaymentRow } from "~/server/billing";

interface RestaurantPlanPanelProps {
  restaurantId: string;
  plan: BillingPlan | null;
  recent: PaymentRow[];
  paymentCount: number;
  paidUntil: string | null;
  status: BillingStatus;
  owed: { amount: number; currency: string; periods: number } | null;
}

/**
 * A restaurant's Plan tab: whether it's paid up (and what it owes when
 * late), the plan agreed with it, and its latest payments. Payments are
 * recorded on the Payments page, where all of them are.
 */
export function RestaurantPlanPanel(props: RestaurantPlanPanelProps) {
  const { restaurantId, plan, recent, paymentCount, paidUntil, status, owed } = props;
  const locale = useLocale();
  const paymentsHref = `/admin/payments?restaurant=${restaurantId}`;

  return (
    <div className="space-y-6">
      <section className="bg-card border-border space-y-3 rounded-xl border px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <BillingStatusBadge status={status} className="text-sm" />
          <p className="text-sm">
            {paidUntil ? (
              <>
                Paid until <strong>{formatDay(paidUntil, locale)}</strong>
              </>
            ) : plan?.startsOn ? (
              <>
                Billed from <strong>{formatDay(plan.startsOn, locale)}</strong>, nothing paid yet
              </>
            ) : (
              <span className="text-muted-foreground">No payments recorded yet</span>
            )}
          </p>
          {owed && (
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Owes {formatMoney(owed.amount, owed.currency, locale)} (
              {owed.periods === 1 ? "1 month" : `${owed.periods} months`})
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/admin/payments?record=${restaurantId}#record`}>
              <Plus className="h-4 w-4" /> Record a payment
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={paymentsHref}>
              <Receipt className="h-4 w-4" /> All payments
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlanForm restaurantId={restaurantId} plan={plan} />

        <FormSection id="recent" title="Latest payments" description="Recorded on the Payments page.">
          {recent.length === 0 ? (
            <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
          ) : (
            <ul className="divide-border -my-2 divide-y">
              {recent.map((p) => (
                <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-sm">
                  <span>
                    <span className="font-medium">{formatDay(p.paidOn, locale)}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {methodLabel(p.method)} · for {formatDay(p.coversFrom, locale)} –{" "}
                      {formatDay(p.coversUntil, locale)}
                    </span>
                  </span>
                  <span className="font-medium tabular-nums">{formatMoney(p.amount, p.currency, locale)}</span>
                </li>
              ))}
            </ul>
          )}
          {paymentCount > recent.length && (
            <Link href={paymentsHref} className="text-primary text-sm font-medium hover:underline">
              See all {paymentCount} payments
            </Link>
          )}
        </FormSection>
      </div>
    </div>
  );
}

function PlanForm({ restaurantId, plan }: { restaurantId: string; plan: BillingPlan | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    planName: plan?.planName ?? "",
    monthlyPrice: plan?.monthlyPrice ?? "",
    currency: plan?.currency ?? "TRY",
    startsOn: plan?.startsOn ?? "",
    notes: plan?.notes ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const set = (patch: Partial<typeof values>) => {
    setSaved(false);
    setValues((v) => ({ ...v, ...patch }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveBillingPlan(restaurantId, values);
      if (!result.ok) return setError(result.error);
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit}>
      <FormSection
        id="plan"
        title="Plan"
        description="What was agreed with the restaurant. Leave the name empty if it isn't billed."
      >
        <Field label="Plan name" htmlFor="plan-name">
          <Input
            id="plan-name"
            value={values.planName}
            onChange={(e) => set({ planName: e.target.value })}
            placeholder="e.g. Standard"
            maxLength={64}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Monthly price" htmlFor="plan-price" hint="0 for a free plan. 1.250,50 or 1250.5.">
            <Input
              id="plan-price"
              inputMode="decimal"
              value={values.monthlyPrice}
              onChange={(e) => set({ monthlyPrice: e.target.value })}
              placeholder="e.g. 750"
              dir="ltr"
            />
          </Field>
          <Field label="Currency" htmlFor="plan-currency">
            <CurrencySelect id="plan-currency" value={values.currency} onChange={(currency) => set({ currency })} />
          </Field>
        </div>
        <Field
          label="Billed from"
          htmlFor="plan-start"
          hint="The first day the restaurant pays for. Until a payment covers it, the days after count as unpaid."
        >
          <Input
            id="plan-start"
            type="date"
            value={values.startsOn}
            onChange={(e) => set({ startsOn: e.target.value })}
            className="sm:max-w-xs"
          />
        </Field>
        <Field label="Notes" htmlFor="plan-notes" hint="Only admins see these, e.g. the agreement or who to contact.">
          <Textarea
            id="plan-notes"
            rows={3}
            value={values.notes}
            onChange={(e) => set({ notes: e.target.value })}
            maxLength={2000}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save plan"}
          </Button>
          <SaveState error={error} saved={saved} />
        </div>
      </FormSection>
    </form>
  );
}
