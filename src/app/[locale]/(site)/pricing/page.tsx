// app/[locale]/(site)/pricing/page.tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { planLines, planMoney } from "~/components/plans/plan-lines";
import { ContactBand } from "~/components/shared/ContactBand";
import { FaqList, faqStructuredData } from "~/components/shared/FaqList";
import { PageHero, PageSection } from "~/components/shared/MarketingBlocks";
import { FREE_MONTHS, OFFERED_TIERS } from "~/lib/plans";
import { jsonLd } from "~/server/menu-structured-data";
import { planFacts } from "~/server/plan-facts";
import { sitePageMetadata } from "~/server/public-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, facts] = await Promise.all([
    getTranslations({ locale, namespace: "pricingPage" }),
    planFacts(locale),
  ]);
  return sitePageMetadata({
    locale,
    path: "/pricing",
    title: t("metaTitle", facts),
    description: t("metaDescription", facts),
  });
}

const TRIAL_STEPS = ["s1", "s2", "s3"] as const;

const QUESTIONS = ["free", "after", "pay", "yearly", "extras", "guests", "chains"] as const;

/**
 * The plan and what it costs, for restaurant owners comparing digital
 * menus ("QR menü fiyatları"): the free months and the price beside what
 * is included, how the free trial works and the questions people ask
 * about paying. Monthly or yearly is chosen on /start; every feature in
 * detail is on /features. Prices and the trial length come from lib/plans
 * (server/plan-facts).
 */
export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tPlans, facts] = await Promise.all([
    getTranslations("pricingPage"),
    getTranslations("Plans"),
    planFacts(locale),
  ]);
  const questions = QUESTIONS.map((id) => ({
    question: t(`faq.items.${id}.q`),
    answer: t(`faq.items.${id}.a`, facts),
  }));
  const included = planLines(OFFERED_TIERS[0]!, (key, values) => tPlans(key, values), (n) => planMoney(n, locale));

  return (
    <div className="text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqStructuredData(questions)) }} />
      <PageHero title={t("hero.title")} intro={t("hero.intro", facts)} className="pb-4" />

      <PageSection id="included" title={t("included.title")} intro={t("included.intro")}>
        <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="bg-card border-border rounded-2xl border p-8 text-center shadow-sm">
            <p className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              {tPlans("freeMonthsShort", { count: FREE_MONTHS })}
            </p>
            <p className="text-muted-foreground mt-3">{tPlans("thenPerMonth", { price: facts.price })}</p>
          </div>
          <ul className="bg-card border-border space-y-4 rounded-2xl border p-6 shadow-sm sm:p-8">
            {included.map((line) => (
              <li key={line} className="flex items-baseline gap-3">
                <span className="min-w-0">{line}</span>
                {/* A menu's dotted leader between the line and "Included". */}
                <span className="border-border min-w-6 flex-1 border-b-2 border-dotted" aria-hidden />
                <span className="text-primary shrink-0 font-semibold">{t("included.yes")}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-muted-foreground mx-auto mt-8 max-w-xl text-center text-sm">{tPlans("pricingNote")}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/start">{t("cta.start")}</Link>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <Link href="/features">
              {t("included.link")} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </PageSection>

      <PageSection id="trial" title={t("trial.title")}>
        <ol className="grid gap-4 md:grid-cols-3">
          {TRIAL_STEPS.map((id, index) => (
            <li key={id} className="bg-card border-border relative rounded-xl border p-5 shadow-sm">
              <span className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold tabular-nums">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold">{t(`trial.${id}.title`, facts)}</h3>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{t(`trial.${id}.text`, facts)}</p>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection id="pricing-faq" title={t("faq.title")} className="max-w-3xl">
        <FaqList items={questions} />
      </PageSection>

      <ContactBand />
    </div>
  );
}
