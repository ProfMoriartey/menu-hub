// app/[locale]/(site)/multilingual-menu/page.tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MenuDemo } from "~/components/features/MenuDemo";
import { ContactClose } from "~/components/home/ContactClose";
import { FaqList, faqStructuredData } from "~/components/shared/FaqList";
import { ClothHero, PageSection, PlatterList } from "~/components/shared/MarketingBlocks";
import { StepPlates } from "~/components/shared/StepPlates";
import { Platter } from "~/components/table/Plate";
import { getDemoMenus } from "~/server/demo-menu";
import { jsonLd } from "~/server/menu-structured-data";
import { sitePageMetadata } from "~/server/public-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "multilingualPage" });
  return sitePageMetadata({
    locale,
    path: "/multilingual-menu",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

const STEPS = ["s1", "s2", "s3"] as const;

// What guests get in their language. Texts in multilingualPage.details.items.
const DETAILS = ["rtl", "prices", "search", "labels", "hours", "google"] as const;

const QUESTIONS = ["auto", "languages", "qr", "switch", "price"] as const;

/**
 * Menus in several languages, for places with guests from abroad
 * ("çok dilli QR menü"): how it works for the restaurant and the guest,
 * the working demo with its language switch, and the usual questions.
 * Keep it in step with lib/menu-languages and server/localize-menu.
 */
export default async function MultilingualMenuPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("multilingualPage");
  const questions = QUESTIONS.map((id) => ({
    question: t(`faq.items.${id}.q`),
    answer: t(`faq.items.${id}.a`),
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqStructuredData(questions)) }} />
      <ClothHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} intro={t("hero.intro")} />

      <PageSection id="steps" tone="deep" title={t("steps.title")}>
        <StepPlates steps={STEPS.map((id) => ({ id, title: t(`steps.${id}.title`), text: t(`steps.${id}.text`) }))} />
      </PageSection>

      <PageSection id="demo" tone="cloth" title={t("demo.title")} intro={t("demo.intro")}>
        <MenuDemo menus={getDemoMenus()} initialLanguage={locale} />
      </PageSection>

      <PageSection id="details" tone="deep" title={t("details.title")} className="max-w-3xl">
        <Platter>
          <PlatterList items={DETAILS.map((id) => ({ id, title: t(`details.items.${id}.title`), text: t(`details.items.${id}.text`) }))} />
        </Platter>
      </PageSection>

      <PageSection id="who" tone="cloth" title={t("who.title")} className="max-w-3xl">
        <p className="text-on-cloth-muted text-center text-lg leading-relaxed text-pretty">{t("who.text")}</p>
      </PageSection>

      <PageSection id="multilingual-faq" tone="deep" title={t("faq.title")} className="max-w-3xl">
        <Platter>
          <FaqList items={questions} />
        </Platter>
      </PageSection>

      <ContactClose />
    </>
  );
}
