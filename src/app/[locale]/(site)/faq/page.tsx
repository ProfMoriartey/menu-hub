// app/[locale]/(site)/faq/page.tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { ContactBand } from "~/components/shared/ContactBand";
import { CourseTitle } from "~/components/shared/CourseTitle";
import { FaqList, faqStructuredData, type FaqItem } from "~/components/shared/FaqList";
import { Platter } from "~/components/shared/Plate";
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

// The questions, by group, in the order they appear, and the page a group
// links to for more. Texts in faqPage.groups.<group>.items.<id>.{q,a}.
const GROUPS = [
  { id: "start", questions: ["what", "app", "pdf", "website", "how", "skills"] },
  { id: "menu", questions: ["update", "qr", "photos", "team", "branches", "design"] },
  { id: "guests", questions: ["languages", "hours", "google", "stats", "data", "order"], more: "multilingual" },
  { id: "pricing", questions: ["cost", "pay", "contract"], more: "pricing" },
] as const;

const MORE_LINKS = { multilingual: "/multilingual-menu", pricing: "/pricing" } as const;

/**
 * What restaurants ask before signing up, answered from what the app really
 * does: keep the answers in step with the features (and the prices, which
 * come from lib/plans). A small heading with links to the topics, every
 * question on one platter by topic, then the contact band. The same
 * questions go to search engines as FAQPage data.
 */
export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, facts] = await Promise.all([getTranslations("faqPage"), planFacts(locale)]);
  const groups = GROUPS.map((group) => ({
    ...group,
    title: t(`groups.${group.id}.title`),
    items: group.questions.map(
      (q): FaqItem => ({
        question: t(`groups.${group.id}.items.${q}.q`),
        answer: t(`groups.${group.id}.items.${q}.a`, facts),
      }),
    ),
  }));

  return (
    <div className="text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqStructuredData(groups.flatMap((g) => g.items))) }}
      />

      <section className="container mx-auto px-4 pt-12 sm:pt-16">
        <div className="napkin mx-auto mb-10 w-fit max-w-2xl px-6 py-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{t("hero.title")}</h1>
          <p className="text-muted-foreground mt-3">{t("hero.intro")}</p>
          <nav aria-label={t("links.topics")} className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-semibold">
            {groups.map((group) => (
              <a key={group.id} href={`#topic-${group.id}`} className="text-primary hover:underline">
                {group.title}
              </a>
            ))}
          </nav>
        </div>

        <Platter className="mx-auto max-w-3xl">
          {groups.map((group, i) => (
            <section
              key={group.id}
              aria-labelledby={`faq-${group.id}`}
              className={i > 0 ? "mt-10 scroll-mt-20" : "scroll-mt-20"}
              id={`topic-${group.id}`}
            >
              <CourseTitle id={`faq-${group.id}`}>{group.title}</CourseTitle>
              <FaqList items={group.items} plain className="mt-2" />
              {"more" in group && (
                <Link
                  href={MORE_LINKS[group.more]}
                  className="text-primary mt-2 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                >
                  {t(`links.${group.more}`)} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                </Link>
              )}
            </section>
          ))}
        </Platter>
      </section>

      <ContactBand />
    </div>
  );
}
