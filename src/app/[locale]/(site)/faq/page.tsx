// app/[locale]/(site)/faq/page.tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactClose } from "~/components/home/ContactClose";
import { FaqList, faqStructuredData, type FaqItem } from "~/components/shared/FaqList";
import { ClothHero, PageSection } from "~/components/shared/MarketingBlocks";
import { Platter } from "~/components/table/Plate";
import { jsonLd } from "~/server/menu-structured-data";
import { planFacts } from "~/server/plan-facts";
import { sitePageMetadata } from "~/server/public-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faqPage" });
  return sitePageMetadata({
    locale,
    path: "/faq",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

// The questions, by group, in the order they appear. Texts in
// faqPage.groups.<group>.items.<id>.{q,a}.
const GROUPS = [
  { id: "start", questions: ["what", "app", "how", "skills"] },
  { id: "menu", questions: ["update", "qr", "photos", "team", "branches", "design"] },
  { id: "guests", questions: ["languages", "hours", "google", "stats", "data"] },
  { id: "pricing", questions: ["cost", "pay"] },
] as const;

/**
 * What restaurants ask before signing up, answered from what the app really
 * does: keep the answers in step with the features (and the prices, which
 * come from lib/plans). The same questions go to search engines as FAQPage
 * data.
 */
export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, facts] = await Promise.all([getTranslations("faqPage"), planFacts(locale)]);
  const groups = GROUPS.map(({ id, questions }) => ({
    id,
    title: t(`groups.${id}.title`),
    items: questions.map(
      (q): FaqItem => ({
        question: t(`groups.${id}.items.${q}.q`),
        answer: t(`groups.${id}.items.${q}.a`, facts),
      }),
    ),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqStructuredData(groups.flatMap((g) => g.items))) }}
      />
      <ClothHero title={t("hero.title")} intro={t("hero.intro")} />
      {groups.map((group, i) => (
        <PageSection
          key={group.id}
          id={`faq-${group.id}`}
          tone={i % 2 === 0 ? "deep" : "cloth"}
          title={group.title}
          className="max-w-3xl"
        >
          <Platter>
            <FaqList items={group.items} />
          </Platter>
        </PageSection>
      ))}
      <ContactClose />
    </>
  );
}
