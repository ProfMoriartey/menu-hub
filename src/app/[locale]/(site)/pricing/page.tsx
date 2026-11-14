// app/[locale]/(site)/pricing/page.tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { ContactClose } from "~/components/home/ContactClose";
import { PricingPlate } from "~/components/home/Pricing";
import { planLines } from "~/components/plans/plan-lines";
import { FaqList, faqStructuredData } from "~/components/shared/FaqList";
import { CLOTH_LINK, ClothHero, PageSection } from "~/components/shared/MarketingBlocks";
import { StepPlates } from "~/components/shared/StepPlates";
import { LeaderRow } from "~/components/table/LeaderRow";
import { Platter } from "~/components/table/Plate";
import { OFFERED_TIERS } from "~/lib/plans";
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
 * menus ("QR menü fiyatları"): one plate with the free months and the
 * price, a platter of what is included, how the free trial works and the
 * questions people ask about paying. Every feature in detail is on
 * /features, linked from here. Prices and the trial length come from
 * lib/plans (server/plan-facts).
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
  const included = planLines(OFFERED_TIERS[0]!, (key, values) => tPlans(key, values), () => "");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqStructuredData(questions)) }} />
      <ClothHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} intro={t("hero.intro", facts)} />

      <PageSection id="included" tone="deep" title={t("included.title")} intro={t("included.intro")}>
        <div className="grid items-center justify-items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <PricingPlate />
          <Platter className="w-full max-w-xl">
            <ul className="space-y-4">
              {included.map((line) => (
                <LeaderRow key={line} as="li" name={line} price={t("included.yes")} priceClassName="text-cloth-ink" />
              ))}
            </ul>
          </Platter>
        </div>
        <p className="text-on-cloth-muted mx-auto mt-8 max-w-xl text-center">{tPlans("pricingNote")}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Button variant="tableOnCloth" size="pill" asChild>
            <Link href="/start">{t("cta.start")}</Link>
          </Button>
          <Link href="/features" className={CLOTH_LINK}>
            {t("included.link")}
          </Link>
        </div>
      </PageSection>

      <PageSection id="trial" tone="cloth" title={t("trial.title")}>
        <StepPlates steps={TRIAL_STEPS.map((id) => ({ id, title: t(`trial.${id}.title`, facts), text: t(`trial.${id}.text`, facts) }))} />
      </PageSection>

      <PageSection id="pricing-faq" tone="deep" title={t("faq.title")} className="max-w-3xl">
        <Platter>
          <FaqList items={questions} />
        </Platter>
      </PageSection>

      <ContactClose />
    </>
  );
}
