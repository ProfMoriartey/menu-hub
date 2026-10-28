// app/[locale]/(client)/dashboard/[restaurantSlug]/plan/page.tsx
import { type Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Mail, MessageCircle } from "lucide-react";
import { redirect } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { DashboardRestaurantHeader } from "~/components/dashboard/DashboardRestaurantHeader";
import { PlanFeatureList } from "~/components/plans/PlanFeatures";
import { GoLiveCard, PlanChangeForm } from "~/components/plans/OwnerPlanControls";
import { getDashboardRestaurant } from "~/server/dashboard-restaurant";
import { getOwnerPlan } from "~/server/billing";
import { getOpenRequestsFor, isApprovedToPublish } from "~/server/plan-requests";
import { canEditDetails } from "~/lib/access";
import { daysBetween, formatDay, formatMoney } from "~/lib/billing";
import { TIER_FEATURES, billedBranches, isTier } from "~/lib/plans";
import { CONTACT_EMAIL, whatsappLink } from "~/lib/site-contact";

export const metadata: Metadata = {
  title: "Plan | Menupedia",
};

/**
 * The owner's Plan tab: the plan and what it costs, when the next payment
 * is due, what it includes and uses, putting the menu live, and asking for
 * another plan. Owners and admins only.
 */
export default async function OwnerPlanPage({ params }: { params: Promise<{ restaurantSlug: string }> }) {
  const { restaurantSlug } = await params;
  const { restaurant, role } = await getDashboardRestaurant(restaurantSlug);
  const locale = await getLocale();
  if (!canEditDetails(role)) {
    return redirect({ href: `/dashboard/${restaurant.slug}/menu`, locale });
  }

  const [t, tPlans, plan, approved, requests] = await Promise.all([
    getTranslations("OwnerPlan"),
    getTranslations("Plans"),
    getOwnerPlan(restaurant.id),
    isApprovedToPublish(restaurant.id),
    getOpenRequestsFor(restaurant.id),
  ]);
  const { pricing, limits, branchCount, paidUntil, nextDueOn, owed, today } = plan;
  const tier = pricing?.tier ?? null;
  const change = requests.find((r) => r.kind === "change") ?? null;
  const shownBranches = billedBranches(branchCount, limits.maxBranches);

  let status: string;
  if (!approved) status = t("statusWaiting");
  else if (!pricing) status = t("statusNotBilled");
  else if (pricing.period === 0) status = t("statusFree");
  else if (owed) status = t("statusOverdue", { amount: formatMoney(owed.amount, owed.currency, locale) });
  else if (nextDueOn)
    status = paidUntil
      ? t("statusPaid", { date: formatDay(paidUntil, locale), next: formatDay(nextDueOn, locale) })
      : t("statusFirstPayment", { date: formatDay(nextDueOn, locale), days: Math.max(0, daysBetween(today, nextDueOn)) });
  else status = t("statusNotBilled");

  return (
    <>
      <DashboardRestaurantHeader restaurant={restaurant} role={role} activeTab="plan" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <section className="bg-card border-border space-y-4 rounded-xl border p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-bold">
                {tier ? t("planName", { plan: TIER_FEATURES[tier].label }) : t("noPlan")}
              </h2>
              {pricing && pricing.period > 0 && (
                <p className="font-semibold tabular-nums">
                  {pricing.periodMonths === 12
                    ? tPlans("perYear", { price: formatMoney(pricing.period, pricing.currency, locale) })
                    : tPlans("perMonth", { price: formatMoney(pricing.monthly, pricing.currency, locale) })}
                </p>
              )}
            </div>
            <p className={owed ? "font-medium text-red-700 dark:text-red-400" : "text-muted-foreground"}>{status}</p>
            {isTier(tier) && <PlanFeatureList tier={tier} />}
            <dl className="border-border grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">{t("branchesUsed")}</dt>
                <dd className="font-medium">
                  {limits.maxBranches === null
                    ? t("countNoLimit", { used: branchCount })
                    : t("countOf", { used: shownBranches, max: limits.maxBranches })}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("languages")}</dt>
                <dd className="font-medium">
                  {limits.extraLanguages === null
                    ? tPlans("allLanguages")
                    : limits.extraLanguages === 0
                      ? tPlans("oneLanguage")
                      : tPlans("extraLanguages", { count: limits.extraLanguages })}
                </dd>
              </div>
            </dl>
          </section>
          <PlanChangeForm
            restaurantId={restaurant.id}
            current={tier}
            currentCycle={plan.cycle}
            openRequest={change}
          />
        </div>
        <div className="space-y-6">
          <GoLiveCard restaurantId={restaurant.id} isActive={restaurant.isActive} approved={approved} />
          <section className="bg-card border-border space-y-3 rounded-xl border p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold">{t("contactTitle")}</h2>
            <p className="text-muted-foreground text-sm">{t("contactText")}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <a href={whatsappLink(t("whatsappMessage", { name: restaurant.name }))} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={`mailto:${CONTACT_EMAIL}`}>
                  <Mail className="h-4 w-4" /> {t("email")}
                </a>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
