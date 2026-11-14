import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { planLines, planMoney } from "~/components/plans/plan-lines";
import { CourseTitle } from "~/components/shared/CourseTitle";
import { LeaderRow } from "~/components/shared/LeaderRow";
import { Platter } from "~/components/shared/Plate";
import { FREE_MONTHS, OFFERED_TIERS, TIER_FEATURES } from "~/lib/plans";
import { planFacts } from "~/server/plan-facts";

/**
 * The price card (pricing and home pages), one platter like the features
 * menu: the free months and the price (monthly and yearly) at the top,
 * what's included, anything the page adds (the trial, on pricing), then
 * the pricing note, the create button and a link (to /features or /pricing).
 */
export async function PlanSummary({
  link,
  children,
}: {
  link: { href: string; label: string };
  children?: ReactNode;
}) {
  const locale = await getLocale();
  const [t, tPlans, facts] = await Promise.all([
    getTranslations("pricingPage"),
    getTranslations("Plans"),
    planFacts(locale),
  ]);
  const tier = OFFERED_TIERS[0]!;
  const money = (n: number) => planMoney(n, locale);
  const included = planLines(tier, (key, values) => tPlans(key, values), money);

  return (
    <Platter className="mx-auto max-w-3xl">
      <header className="text-center">
        <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {tPlans("freeMonthsShort", { count: FREE_MONTHS })}
        </p>
        <p className="text-muted-foreground mt-3 text-lg">
          {tPlans("thenPerMonth", { price: money(TIER_FEATURES[tier].price) })}
        </p>
        <p className="text-muted-foreground mt-1">{t("price.yearly", facts)}</p>
      </header>

      <section aria-labelledby="plan-included" className="mt-10">
        <CourseTitle id="plan-included">{t("included.course")}</CourseTitle>
        <ul className="mt-5 space-y-4">
          {included.map((line) => (
            <LeaderRow key={line} name={line} value={t("included.yes")} />
          ))}
        </ul>
      </section>

      {children}

      <footer className="border-border mt-10 border-t-4 border-double pt-6 text-center">
        <p className="text-muted-foreground mx-auto max-w-xl text-sm">{tPlans("pricingNote")}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/start">{t("cta.start")}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={link.href}>
              {link.label} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </footer>
    </Platter>
  );
}
