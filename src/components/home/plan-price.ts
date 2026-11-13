import { formatMoney } from "~/lib/billing";
import { FREE_MONTHS, OFFERED_TIERS, PLAN_CURRENCY, TIER_FEATURES } from "~/lib/plans";

/** What the plan costs a month, "$25" in the page's language. */
export function monthlyPrice(locale: string) {
  const amount = TIER_FEATURES[OFFERED_TIERS[0]!].price;
  return formatMoney(amount, PLAN_CURRENCY, locale).replace(/[.,]00(?=\D*$)/, "");
}

export const freeMonths = FREE_MONTHS;
