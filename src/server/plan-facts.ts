// src/server/plan-facts.ts
import { getTranslations } from "next-intl/server";
import { planMoney } from "~/components/plans/plan-lines";
import {
  FREE_MONTHS,
  MONTHS_PAID_PER_YEAR,
  OFFERED_TIERS,
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
  const money = (amount: number) => planMoney(amount, locale);
  const monthly = TIER_FEATURES[OFFERED_TIERS[0] ?? "standard"].price;
  return {
    months: t("months", { count: FREE_MONTHS }),
    price: money(monthly),
    yearly: money(periodPrice(monthly, "yearly")),
    saving: t("yearlySave", { count: 12 - MONTHS_PAID_PER_YEAR }),
  };
}
