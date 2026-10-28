// src/components/plans/PlanFeatures.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { formatMoney } from "~/lib/billing";
import { PLAN_CURRENCY, TIER_FEATURES, type Tier } from "~/lib/plans";

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
    f.maxBranches === 1 ? t("oneBranch") : t("branchesIncluded", { count: f.includedBranches }),
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
