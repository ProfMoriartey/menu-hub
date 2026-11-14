import { formatMoney } from "~/lib/billing";
import { PLAN_CURRENCY, TIER_FEATURES, type Tier } from "~/lib/plans";

/** "$45" in the given language (no ".00"). */
export const planMoney = (amount: number, locale: string) =>
  formatMoney(amount, PLAN_CURRENCY, locale).replace(/[.,]00(?=\D*$)/, "");

type T = (key: string, values?: Record<string, string | number>) => string;

/** What a tier includes, a line each (the plan list, the sign-up form and the pricing page). `t` is the "Plans" namespace. */
export function planLines(tier: Tier, t: T, money: (amount: number) => string) {
  const f = TIER_FEATURES[tier];
  return [
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
}
