// app/[locale]/(site)/faq/page.tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { FaqList, faqStructuredData, type FaqItem } from "~/components/shared/FaqList";
import { CtaCard, PageHero } from "~/components/shared/MarketingBlocks";
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
    <div className="text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqStructuredData(groups.flatMap((g) => g.items))) }}
      />
      <PageHero title={t("hero.title")} intro={t("hero.intro")} />

      <div className="container mx-auto max-w-3xl space-y-12 px-4 pb-12">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`faq-${group.id}`}>
            <h2 id={`faq-${group.id}`} className="mb-4 text-2xl font-bold tracking-tight">
              {group.title}
            </h2>
            <FaqList items={group.items} />
          </section>
        ))}
      </div>

      <CtaCard title={t("more.title")} text={t("more.text")}>
        <Button size="lg" asChild>
          {/* The home page's contact band (Navbar's CONTACT_HREF). */}
          <Link href="/#contact">{t("more.contact")}</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/pricing">{t("more.pricing")}</Link>
        </Button>
        <Button size="lg" variant="ghost" asChild>
          <Link href="/multilingual-menu">{t("more.multilingual")}</Link>
        </Button>
      </CtaCard>
    </div>
  );
}
