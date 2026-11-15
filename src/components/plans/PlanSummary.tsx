import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { planMoney, planRows } from "~/components/plans/plan-lines";
import { CourseTitle } from "~/components/shared/CourseTitle";
import { LeaderRow } from "~/components/shared/LeaderRow";
import { Platter } from "~/components/shared/Plate";
import { FREE_MONTHS, OFFERED_TIERS, TIER_FEATURES, periodPrice } from "~/lib/plans";
import { planFacts } from "~/server/plan-facts";

/**
 * The price card (pricing and home pages), one platter like the features
 * menu: the free months at the top, then each plan on offer side by side
 * (its yearly price, the monthly one, what's included and a button to sign
 * up with it), anything the page adds (the trial, on pricing), then the
 * pricing note, the create button and a link (to /features or /pricing).
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
  const money = (n: number) => planMoney(n, locale);

  return (
    <Platter className="mx-auto max-w-4xl">
      <header className="text-center">
        <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {tPlans("freeMonthsShort", { count: FREE_MONTHS })}
        </p>
        <p className="text-muted-foreground mt-3 text-lg">{t("price.then")}</p>
      </header>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        {OFFERED_TIERS.map((tier) => {
          const { label, price } = TIER_FEATURES[tier];
          return (
            <section key={tier} aria-labelledby={`plan-${tier}`} className="flex flex-col">
              <CourseTitle id={`plan-${tier}`}>{label}</CourseTitle>
              <p className="mt-4 text-center text-3xl font-extrabold tracking-tight tabular-nums">
                {tPlans("perYear", { price: money(periodPrice(price, "yearly")) })}
              </p>
              <p className="text-muted-foreground mt-1 text-center text-sm">
                {t("price.monthly", { saving: facts.saving, price: money(price) })}
              </p>
              <ul className="mt-6 mb-6 space-y-4">
                {planRows(tier, (key, values) => tPlans(key, values), t("included.yes")).map((row) => (
                  <LeaderRow key={row.name} name={row.name} value={row.value} />
                ))}
              </ul>
              <Button className="mt-auto self-center" variant="outline" asChild>
                <Link href={`/start?plan=${tier}`}>{t("cta.choose", { plan: label })}</Link>
              </Button>
            </section>
          );
        })}
      </div>

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
