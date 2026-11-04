// app/[locale]/(site)/pricing/page.tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { PricingSection } from "~/components/plans/PricingSection";
import { FaqList, faqStructuredData } from "~/components/shared/FaqList";
import { CtaCard, PageHero, PageSection } from "~/components/shared/MarketingBlocks";
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
 * The plans and what they cost, for restaurant owners comparing digital
 * menus ("QR menü fiyatları"): the plan card (with what it includes), how
 * the free trial works and the questions people ask about paying. Every
 * feature in detail is on /features, linked from here. Prices and the
 * trial length come from lib/plans (server/plan-facts).
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
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} intro={t("hero.intro", facts)} className="pb-4" />

      <PricingSection className="container mx-auto px-4 py-12" />

      {/* The plan card lists what's included; every feature is on /features. */}
      <PageSection id="included" title={t("included.title")} intro={t("included.intro")}>
        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/features">{t("included.link")}</Link>
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

      <CtaCard title={t("cta.title")} text={t("cta.text", facts)}>
        <Button size="lg" asChild>
          <Link href="/start">{t("cta.start")}</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/faq">{t("cta.faq")}</Link>
        </Button>
        <Button size="lg" variant="ghost" asChild>
          {/* The home page's contact band (Navbar's CONTACT_HREF). */}
          <Link href="/#contact">{t("cta.contact")}</Link>
        </Button>
      </CtaCard>
    </div>
  );
}
