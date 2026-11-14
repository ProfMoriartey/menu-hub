// src/server/plan-facts.ts
import { getTranslations } from "next-intl/server";
import { formatMoney } from "~/lib/billing";
import {
  FREE_MONTHS,
  MONTHS_PAID_PER_YEAR,
  OFFERED_TIERS,
  PLAN_CURRENCY,
  TIER_FEATURES,
  periodPrice,
} from "~/lib/plans";

/**
 * The numbers the marketing pages quote, in the page's language: the free
 * trial ("6 months"), the plan's price a month and a year ("$25", "$250")
 * and what paying yearly saves ("2 months free"). They come from lib/plans,
 * so the Pricing and FAQ pages change with the plans.
 */
export async function planFacts(locale: string) {
  const t = await getTranslations({ locale, namespace: "Plans" });
  // As on the pricing cards: "$25", not "$25.00". Isolated, so "US$ 25"
  // keeps its order inside right-to-left text.
  const money = (amount: number) =>
    `\u2066${formatMoney(amount, PLAN_CURRENCY, locale).replace(/[.,]00(?=\D*$)/, "")}\u2069`;
  const monthly = TIER_FEATURES[OFFERED_TIERS[0] ?? "standard"].price;
  return {
    months: t("months", { count: FREE_MONTHS }),
    price: money(monthly),
    yearly: money(periodPrice(monthly, "yearly")),
    saving: t("yearlySave", { count: 12 - MONTHS_PAID_PER_YEAR }),
  };
}
