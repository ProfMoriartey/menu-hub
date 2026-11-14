// app/[locale]/(site)/pricing/page.tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlanSummary } from "~/components/plans/PlanSummary";
import { ContactBand } from "~/components/shared/ContactBand";
import { FaqList, faqStructuredData } from "~/components/shared/FaqList";
import { PageHero, PageSection } from "~/components/shared/MarketingBlocks";
import { StepPlates } from "~/components/shared/StepPlates";
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
  const [t, facts] = await Promise.all([getTranslations("pricingPage"), planFacts(locale)]);
  const questions = QUESTIONS.map((id) => ({
    question: t(`faq.items.${id}.q`),
    answer: t(`faq.items.${id}.a`, facts),
  }));

  return (
    <div className="text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqStructuredData(questions)) }} />
      <PageHero title={t("hero.title")} intro={t("hero.intro", facts)} className="pb-4" />

      <PageSection id="included" title={t("included.title")} intro={t("included.intro")}>
        <PlanSummary link={{ href: "/features", label: t("included.link") }} />
      </PageSection>

      <PageSection id="trial" title={t("trial.title")}>
        <StepPlates
          steps={TRIAL_STEPS.map((id) => ({ id, title: t(`trial.${id}.title`, facts), text: t(`trial.${id}.text`, facts) }))}
        />
      </PageSection>

      <PageSection id="pricing-faq" title={t("faq.title")} className="max-w-3xl">
        <FaqList items={questions} />
      </PageSection>

      <ContactBand />
    </div>
  );
}
