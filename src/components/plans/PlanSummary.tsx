import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { planLines, planMoney } from "~/components/plans/plan-lines";
import { LeaderRow } from "~/components/shared/LeaderRow";
import { Plate } from "~/components/shared/Plate";
import { FREE_MONTHS, OFFERED_TIERS, TIER_FEATURES } from "~/lib/plans";

/**
 * The plan at a glance (pricing and home pages): the free months and the
 * price on a plate beside what's included, the pricing note, the create
 * button and a link (to /features or /pricing).
 */
export async function PlanSummary({ link }: { link: { href: string; label: string } }) {
  const [t, tPlans, locale] = await Promise.all([
    getTranslations("pricingPage"),
    getTranslations("Plans"),
    getLocale(),
  ]);
  const tier = OFFERED_TIERS[0]!;
  const money = (n: number) => planMoney(n, locale);
  const included = planLines(tier, (key, values) => tPlans(key, values), money);

  return (
    <>
      <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Plate size="fluid" className="mx-auto max-w-[22rem]">
          <div className="w-[68%] text-center">
            <p className="text-[clamp(1.75rem,12cqw,2.75rem)] leading-[1.05] font-extrabold tracking-tight text-balance rtl:leading-snug">
              {tPlans("freeMonthsShort", { count: FREE_MONTHS })}
            </p>
            <p className="text-muted-foreground mt-2 text-[clamp(0.875rem,4.8cqw,1rem)] leading-snug">
              {tPlans("thenPerMonth", { price: money(TIER_FEATURES[tier].price) })}
            </p>
          </div>
        </Plate>
        <ul className="bg-card border-border space-y-4 rounded-2xl border p-6 shadow-sm sm:p-8">
          {included.map((line) => (
            <LeaderRow key={line} name={line} value={t("included.yes")} />
          ))}
        </ul>
      </div>
      <p className="napkin text-muted-foreground mx-auto mt-8 w-fit max-w-xl px-4 py-2 text-center text-sm">{tPlans("pricingNote")}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" asChild>
          <Link href="/start">{t("cta.start")}</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href={link.href}>
            {link.label} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </Button>
      </div>
    </>
  );
}
