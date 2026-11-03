// src/components/plans/PlanFeatures.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { formatMoney } from "~/lib/billing";
import { PLAN_CURRENCY, TIER_FEATURES, periodPrice, type Tier } from "~/lib/plans";

/** "$45" in the page's language. */
export function usePlanMoney() {
  const locale = useLocale();
  return (amount: number) =>
    formatMoney(amount, PLAN_CURRENCY, locale).replace(/[.,]00(?=\D*$)/, "");
}

/** What a tier includes, a line each (sign-up form and pricing section). */
export function PlanFeatureList({ tier, className }: { tier: Tier; className?: string }) {
  const t = useTranslations("Plans");
  const money = usePlanMoney();
  const f = TIER_FEATURES[tier];
  const lines = [
    t("everything"),
    f.maxBranches === 1
      ? t("oneBranch")
      : f.maxBranches === null && f.extraBranchPrice === 0
        ? t("branchesNoLimit")
        : t("branchesIncluded", { count: f.includedBranches }),
    ...(f.extraBranchPrice > 0
      ? [
          f.maxBranches === null
            ? t("extraBranchesNoLimit", { price: money(f.extraBranchPrice) })
            : t("extraBranches", { price: money(f.extraBranchPrice), max: f.maxBranches }),
        ]
      : []),
    f.customColors ? t("customColors") : t("defaultColors"),
    f.extraLanguages === null
      ? t("allLanguages")
      : f.extraLanguages === 0
        ? t("oneLanguage")
        : t("extraLanguages", { count: f.extraLanguages }),
  ];
  return (
    <ul className={className ?? "space-y-1.5 text-sm"}>
      {lines.map((line) => (
        <li key={line} className="flex items-start gap-2">
          <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {line}
        </li>
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
