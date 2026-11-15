// src/components/plans/PlanFeatures.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { LeaderRow } from "~/components/shared/LeaderRow";
import { TIER_FEATURES, periodPrice, type Tier } from "~/lib/plans";
import { planMoney, planRows } from "./plan-lines";

/** "$45" in the page's language. */
export function usePlanMoney() {
  const locale = useLocale();
  return (amount: number) => planMoney(amount, locale);
}

/** What a tier includes, as menu rows (sign-up form and the owner's plan page). */
export function PlanFeatureList({ tier, className }: { tier: Tier; className?: string }) {
  const t = useTranslations("Plans");
  const included = useTranslations("pricingPage")("included.yes");
  return (
    <ul className={className ?? "space-y-2 text-sm"}>
      {planRows(tier, t, included).map((row) => (
        <LeaderRow key={row.name} name={row.name} value={row.value} />
      ))}
    </ul>
  );
}

/**
 * A plan's price as a free trial: the price crossed out, the free months
 * large, and what's paid once they're over (pricing section and sign-up).
 */
export function TrialPrice({
  tier,
  cycle,
  freeMonths,
  className,
}: {
  tier: Tier;
  cycle: "monthly" | "yearly";
  freeMonths: number;
  className?: string;
}) {
  const t = useTranslations("Plans");
  const money = usePlanMoney();
  const f = TIER_FEATURES[tier];
  const price = cycle === "yearly" ? money(periodPrice(f.price, "yearly")) : money(f.price);
  return (
    <div className={className}>
      <span className="bg-primary text-primary-foreground inline-block rounded-full px-3 py-0.5 text-xs font-semibold">
        {t("trialBadge")}
      </span>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("freeMonthsShort", { count: freeMonths })}</span>
        <s className="text-muted-foreground text-lg tabular-nums" aria-label={t("regularPrice", { price })}>
          {price}
        </s>
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        {t(cycle === "yearly" ? "thenPerYear" : "thenPerMonth", { price })}
      </p>
    </div>
  );
}
