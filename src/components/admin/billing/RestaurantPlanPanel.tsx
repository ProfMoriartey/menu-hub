// src/components/admin/billing/RestaurantPlanPanel.tsx
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useLocale } from "next-intl";
import { Check, Receipt } from "lucide-react";
import { Link, useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { Field, FormSection } from "~/components/forms/fields";
import { CurrencySelect, SaveState } from "~/components/admin/billing/billing-fields";
import { saveBillingPlan } from "~/app/actions/billing";
import { formatMoney } from "~/lib/billing";
import {
  BILLING_CYCLES,
  MONTHS_PAID_PER_YEAR,
  PLAN_CURRENCY,
  TIERS,
  TIER_FEATURES,
  entitlements,
  isTier,
  planPricing,
  type Tier,
} from "~/lib/plans";
import { cn } from "~/lib/utils";
import type { BillingPlan } from "~/server/billing";

const NOT_BILLED = "";

// What each tier includes, in a line each.
function tierLines(tier: Tier): string[] {
  const f = TIER_FEATURES[tier];
  return [
    f.maxBranches === 1
      ? "1 branch"
      : `${f.includedBranches} branches included, then $${f.extraBranchPrice} each${f.maxBranches ? ` (up to ${f.maxBranches})` : ""}`,
    f.customColors ? "Custom colours" : "Default colours",
    f.extraLanguages === null
      ? "Every menu language"
      : f.extraLanguages === 0
        ? "One menu language"
        : `Up to ${f.extraLanguages} extra languages`,
  ];
}

/**
 * A restaurant's Plan tab: its tier (or not billed), monthly or yearly, a
 * special price when one was agreed, when billing starts and notes, with
 * what it comes to. Feature overrides are on the Details tab; payments on
 * the Payments page (the link opens it for this restaurant).
 */
export function RestaurantPlanPanel({
  restaurantId,
  plan,
  branchCount,
  detailsHref,
}: {
  restaurantId: string;
  plan: BillingPlan | null;
  branchCount: number;
  detailsHref: string;
}) {
  const router = useRouter();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    tier: plan?.tier && isTier(plan.tier) ? plan.tier : NOT_BILLED,
    billingCycle: plan?.billingCycle === "yearly" ? "yearly" : "monthly",
    special: plan?.monthlyPrice != null,
    monthlyPrice: plan?.monthlyPrice ?? "",
    currency: plan?.currency ?? PLAN_CURRENCY,
    startsOn: plan?.startsOn ?? "",
    notes: plan?.notes ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const set = (patch: Partial<typeof values>) => {
    setSaved(false);
    setValues((v) => ({ ...v, ...patch }));
  };

  // The price as it would be once saved: the chosen tier with this
  // restaurant's overrides and branches.
  const overrides = {
    customColors: plan?.colorsOverride ?? null,
    extraLanguages: plan?.languagesOverride ?? null,
    maxBranches: plan?.branchesOverride ?? null,
  };
  const tier = isTier(values.tier) ? values.tier : null;
  const limits = entitlements(tier, overrides);
  const pricing = tier
    ? planPricing(
        {
          tier,
          billingCycle: values.billingCycle,
          monthlyPrice: values.special && values.monthlyPrice.trim() ? values.monthlyPrice.replace(",", ".") : null,
          currency: values.currency,
          startsOn: null,
        },
        limits,
        branchCount,
      )
    : null;
  const usd = (n: number) => formatMoney(n, PLAN_CURRENCY, locale);
  const hasOverrides = Object.values(overrides).some((v) => v !== null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const { special, ...rest } = values;
    startTransition(async () => {
      const result = await saveBillingPlan(restaurantId, { ...rest, monthlyPrice: special ? rest.monthlyPrice : "" });
      if (!result.ok) return setError(result.error);
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <FormSection id="tier" title="Plan" description="What the restaurant pays for. Its features follow the plan.">
        <div role="radiogroup" aria-label="Plan" className="grid gap-3 sm:grid-cols-2">
          {[NOT_BILLED, ...TIERS].map((id) => {
            const selected = values.tier === id;
            return (
              <button
                key={id || "none"}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set({ tier: id })}
                className={cn(
                  "rounded-lg border p-4 text-start transition-colors",
                  "focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
                  selected ? "border-primary bg-primary/5 ring-primary/30 ring-1" : "border-border hover:bg-accent/40",
                )}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold">{isTier(id) ? TIER_FEATURES[id].label : "Not billed"}</span>
                  {isTier(id) && (
                    <span className="text-sm font-medium tabular-nums">{usd(TIER_FEATURES[id].price)} / month</span>
                  )}
                </span>
                <ul className="text-muted-foreground mt-2 space-y-0.5 text-sm">
                  {isTier(id) ? (
                    tierLines(id).map((line) => (
                      <li key={line} className="flex items-start gap-1.5">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {line}
                      </li>
                    ))
                  ) : (
                    <li>No payments are due. Features are Standard&apos;s unless overridden.</li>
                  )}
                </ul>
              </button>
            );
          })}
        </div>

        {tier && (
          <>
            <fieldset className="space-y-1.5">
              <legend className="text-sm font-medium">Billed</legend>
              <div role="radiogroup" aria-label="Billed" className="bg-muted inline-flex rounded-full p-1">
                {BILLING_CYCLES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={values.billingCycle === c.value}
                    onClick={() => set({ billingCycle: c.value })}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium",
                      values.billingCycle === c.value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground",
                    )}
                  >
                    {c.label}
                    {c.value === "yearly" && ` (${12 - MONTHS_PAID_PER_YEAR} months free)`}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <label htmlFor="plan-special" className="text-sm font-medium">
                  Special price
                </label>
                <p className="text-muted-foreground text-sm">
                  Instead of the plan&apos;s, e.g. a discount or a price in lira.
                </p>
              </div>
              <Switch id="plan-special" checked={values.special} onCheckedChange={(special) => set({ special })} />
            </div>
            {values.special && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Price a month" htmlFor="plan-price" hint="0 for free. 1.250,50 or 1250.5.">
                  <Input
                    id="plan-price"
                    inputMode="decimal"
                    value={values.monthlyPrice}
                    onChange={(e) => set({ monthlyPrice: e.target.value })}
                    placeholder="e.g. 30"
                    dir="ltr"
                  />
                </Field>
                <Field label="Currency" htmlFor="plan-currency">
                  <CurrencySelect id="plan-currency" value={values.currency} onChange={(currency) => set({ currency })} />
                </Field>
              </div>
            )}

            {pricing && (
              <div className="bg-muted/50 space-y-1 rounded-lg px-4 py-3 text-sm">
                <p>
                  {branchCount === 1 ? "1 branch" : `${branchCount} branches`}
                  {limits.maxBranches !== null && branchCount > limits.maxBranches && (
                    <span className="text-attention">
                      {" "}
                      ({branchCount - limits.maxBranches} hidden: over the limit of {limits.maxBranches})
                    </span>
                  )}
                </p>
                {pricing.custom ? (
                  <p>
                    Special price: <strong>{formatMoney(pricing.monthly, pricing.currency, locale)} a month</strong>
                  </p>
                ) : (
                  <p>
                    {TIER_FEATURES[pricing.tier].label} {usd(pricing.base)}
                    {pricing.extraBranches > 0 &&
                      ` + ${pricing.extraBranches} extra ${pricing.extraBranches === 1 ? "branch" : "branches"} × ${usd(TIER_FEATURES[pricing.tier].extraBranchPrice)}`}
                    {" = "}
                    <strong>{usd(pricing.monthly)} a month</strong>
                  </p>
                )}
                {pricing.periodMonths === 12 && (
                  <p>
                    Paid yearly: <strong>{formatMoney(pricing.period, pricing.currency, locale)} a year</strong> (
                    {MONTHS_PAID_PER_YEAR} months&apos; price)
                  </p>
                )}
              </div>
            )}

            <Field
              label="Billed from"
              htmlFor="plan-start"
              hint="The first day the restaurant pays for. Each period from then on is due until a payment covers it."
            >
              <Input
                id="plan-start"
                type="date"
                value={values.startsOn}
                onChange={(e) => set({ startsOn: e.target.value })}
                className="sm:max-w-xs"
              />
            </Field>
          </>
        )}

        <Field label="Notes" htmlFor="plan-notes" hint="Only admins see these, e.g. the agreement or who to contact.">
          <Textarea
            id="plan-notes"
            rows={3}
            value={values.notes}
            onChange={(e) => set({ notes: e.target.value })}
            maxLength={2000}
          />
        </Field>

        {hasOverrides && (
          <p className="text-muted-foreground text-sm">
            This restaurant has special features on top of its plan.{" "}
            <Link href={`${detailsHref}#features`} className="text-primary underline underline-offset-2">
              See them in Details
            </Link>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save plan"}
          </Button>
          <SaveState error={error} saved={saved} />
          <Button variant="ghost" className="ms-auto" asChild>
            <Link href={`/admin/payments?restaurant=${restaurantId}`}>
              <Receipt className="h-4 w-4" /> This restaurant&apos;s payments
            </Link>
          </Button>
        </div>
      </FormSection>
    </form>
  );
}
