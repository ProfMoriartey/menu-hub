// app/[locale]/(site)/multilingual-menu/page.tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { ContactBand } from "~/components/shared/ContactBand";
import { CourseTitle, NumberedLines } from "~/components/shared/CourseTitle";
import { FaqList, faqStructuredData } from "~/components/shared/FaqList";
import { PageSection } from "~/components/shared/MarketingBlocks";
import { Platter } from "~/components/shared/Plate";
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
 * ("çok dilli QR menü"). A page for search engines more than for the
 * navigation (linked from the footer, the features languages line and the
 * FAQ): a small heading, one platter with how it works, what guests get
 * and who it's for, the usual questions, and the contact band. The demo
 * lives on /features. Keep it in step with lib/menu-languages and
 * server/localize-menu.
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
    <div className="text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqStructuredData(questions)) }} />

      <section className="container mx-auto px-4 pt-12 sm:pt-16">
        <div className="napkin mx-auto mb-10 w-fit max-w-2xl px-6 py-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{t("hero.title")}</h1>
          <p className="text-muted-foreground mt-3">{t("hero.intro")}</p>
        </div>

        <Platter className="mx-auto max-w-3xl">
          <section aria-labelledby="steps-title">
            <CourseTitle id="steps-title">{t("steps.title")}</CourseTitle>
            <NumberedLines
              items={STEPS.map((id) => ({ id, title: t(`steps.${id}.title`), text: t(`steps.${id}.text`) }))}
            />
          </section>

          <section aria-labelledby="details-title" className="mt-10">
            <CourseTitle id="details-title">{t("details.title")}</CourseTitle>
            <ul className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {DETAILS.map((id) => (
                <li key={id}>
                  <h3 className="font-semibold">{t(`details.items.${id}.title`)}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {t(`details.items.${id}.text`)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="who-title" className="mt-10">
            <CourseTitle id="who-title">{t("who.title")}</CourseTitle>
            <p className="text-muted-foreground mt-5 text-center text-lg leading-relaxed">{t("who.text")}</p>
          </section>

          <div className="border-border mt-10 border-t pt-6 text-center">
            <Link
              href="/features#demo"
              className="text-primary inline-flex items-center gap-1 font-semibold hover:underline"
            >
              {t("demo.title")} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </Platter>
      </section>

      <PageSection id="multilingual-faq" title={t("faq.title")} className="max-w-3xl">
        <FaqList items={questions} />
      </PageSection>

      <ContactBand />
    </div>
  );
}
