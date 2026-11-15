import { PLAN_CURRENCY, TIER_FEATURES, type Tier } from "~/lib/plans";

/** "₺399" in the given language (no ".00"; "₺", not "TRY"). */
export const planMoney = (amount: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: PLAN_CURRENCY, currencyDisplay: "narrowSymbol" })
    .format(amount)
    .replace(/[.,]00(?=\D*$)/, "");

type T = (key: string, values?: Record<string, string | number>) => string;

/**
 * What a tier includes as menu rows, a name and its amount ("Branches …
 * Up to 3", "Extra languages … Unlimited"): what's simply included first,
 * then what's counted. Price card, sign-up form and the owner's plan page.
 * `t` is the "Plans" namespace; `included` is the value of an included row.
 */
export function planRows(tier: Tier, t: T, included: string) {
  const f = TIER_FEATURES[tier];
  const amount = (n: number | null) => (n === null ? t("unlimited") : n === 0 ? "—" : t("upTo", { count: n }));
  return [
    { name: t("everything"), value: included },
    { name: t("customColors"), value: f.customColors ? included : "—" },
    { name: t("rowBranches"), value: amount(f.maxBranches) },
    { name: t("rowLanguages"), value: amount(f.extraLanguages) },
  ];
}
