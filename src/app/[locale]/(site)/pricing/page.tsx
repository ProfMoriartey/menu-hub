// app/[locale]/(site)/pricing/page.tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlanSummary } from "~/components/plans/PlanSummary";
import { ContactBand } from "~/components/shared/ContactBand";
import { FaqList, faqStructuredData } from "~/components/shared/FaqList";
import { CourseTitle, NumberedLines } from "~/components/shared/CourseTitle";
import { PageSection } from "~/components/shared/MarketingBlocks";
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
 * menus ("QR menü fiyatları"): one price card with the free months and
 * the price, what is included and how the free trial works, then the
 * questions people ask about paying. Monthly or yearly is chosen on /start; every feature in
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
      <section className="container mx-auto px-4 pt-12 pb-12 sm:pt-16">
        <div className="napkin mx-auto mb-10 w-fit max-w-2xl px-6 py-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{t("hero.title")}</h1>
          <p className="text-muted-foreground mt-3">{t("included.intro")}</p>
        </div>
        <PlanSummary link={{ href: "/features", label: t("included.link") }}>
          <section aria-labelledby="plan-trial" className="mt-10">
            <CourseTitle id="plan-trial">{t("trial.title")}</CourseTitle>
            <NumberedLines
              items={TRIAL_STEPS.map((id) => ({ id, title: t(`trial.${id}.title`, facts), text: t(`trial.${id}.text`, facts) }))}
            />
          </section>
        </PlanSummary>
      </section>

      <PageSection id="pricing-faq" title={t("faq.title")} className="max-w-3xl">
        <FaqList items={questions} />
      </PageSection>

      <ContactBand />
    </div>
  );
}
