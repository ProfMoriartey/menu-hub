// app/[locale]/(site)/features/page.tsx
import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "~/components/ui/button";
import { MenuDemo } from "~/components/features/MenuDemo";
import { ContactClose } from "~/components/home/ContactClose";
import { ClothHero, PageSection, PlatterList } from "~/components/shared/MarketingBlocks";
import { Cloth } from "~/components/table/Cloth";
import { Platter } from "~/components/table/Plate";
import { getDemoMenus } from "~/server/demo-menu";
import { Link } from "~/i18n/navigation";
import { planFacts } from "~/server/plan-facts";
import { sitePageMetadata } from "~/server/public-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "featuresPage" });
  return sitePageMetadata({
    locale,
    path: "/features",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

// Each group's features, in the order they appear. Texts are in the
// featuresPage.features messages.
const GROUPS = [
  { id: "look", features: ["designs", "colors", "fast"] },
  { id: "guests", features: ["languages", "search", "friendly"] },
  { id: "current", features: ["instant", "hours", "qr", "stats"] },
  { id: "found", features: ["google", "sharing", "about"] },
] as const;

// Features with a page of their own, linked from their row.
const FEATURE_PAGES: Record<string, string> = { languages: "/multilingual-menu" };

/**
 * What restaurants get, with a working demo menu (a made-up restaurant) so
 * potential customers can try designs, colours and languages themselves.
 * Was /themes, which showed the old menu designs; /themes redirects here.
 * Getting started and teamwork are told on the About page ("How it works").
 * Prices are on /pricing: this page only points there.
 */
export default async function FeaturesPage({ params }: Props) {
  setRequestLocale((await params).locale);
  const locale = await getLocale();
  const [t, facts] = await Promise.all([
    getTranslations("featuresPage"),
    planFacts(locale),
  ]);

  return (
    <>
      <ClothHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} intro={t("hero.intro")}>
        <Button variant="tableOnCloth" size="pill" asChild>
          <a href="#demo">{t("hero.ctaDemo")}</a>
        </Button>
        <Button variant="tableOnCloth" size="pill" asChild>
          <a href="#contact">{t("hero.ctaContact")}</a>
        </Button>
      </ClothHero>

      <PageSection id="demo" tone="deep" title={t("demo.title")} intro={t("demo.intro")}>
        <MenuDemo menus={getDemoMenus()} initialLanguage={locale} />
      </PageSection>

      <Cloth as="div">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-2 lg:py-24">
          {GROUPS.map((group) => (
            <Platter key={group.id}>
              <h2 className="mb-5 text-2xl font-extrabold tracking-tight">
                {t(`groups.${group.id}`)}
              </h2>
              <PlatterList
                items={group.features.map((id) => ({
                  id,
                  title: t(`features.${id}.title`),
                  text: t(`features.${id}.text`),
                  link: FEATURE_PAGES[id] ? { href: FEATURE_PAGES[id], label: t(`featureLinks.${id}`) } : undefined,
                }))}
              />
            </Platter>
          ))}
        </div>
      </Cloth>

      {/* The price in a line; the plan, trial and questions are on /pricing. */}
      <PageSection id="pricing-band" tone="cloth" title={t("pricing.title", facts)} intro={t("pricing.text", facts)}>
        <div className="flex justify-center">
          <Button variant="tableOnCloth" size="pill" asChild>
            <Link href="/pricing">{t("pricing.link")}</Link>
          </Button>
        </div>
      </PageSection>

      <ContactClose />
    </>
  );
}
