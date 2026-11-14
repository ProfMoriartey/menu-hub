// app/[locale]/(site)/multilingual-menu/page.tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowLeftRight,
  Clock,
  Coins,
  Languages,
  Leaf,
  ScanLine,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { MenuDemo } from "~/components/features/MenuDemo";
import { FaqList, faqStructuredData } from "~/components/shared/FaqList";
import { CtaCard, PageHero, PageSection } from "~/components/shared/MarketingBlocks";
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

const STEPS: { id: string; icon: LucideIcon }[] = [
  { id: "s1", icon: Languages },
  { id: "s2", icon: ArrowLeftRight },
  { id: "s3", icon: ScanLine },
];

// What guests get in their language. Texts in multilingualPage.details.items.
const DETAILS: { id: string; icon: LucideIcon }[] = [
  { id: "rtl", icon: ArrowLeftRight },
  { id: "prices", icon: Coins },
  { id: "search", icon: Search },
  { id: "labels", icon: Leaf },
  { id: "hours", icon: Clock },
  { id: "google", icon: Search },
];

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
    <div className="text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqStructuredData(questions)) }} />
      <PageHero title={t("hero.title")} intro={t("hero.intro")} />

      <PageSection id="steps" title={t("steps.title")} className="pt-0">
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ id, icon: Icon }, index) => (
            <li key={id} className="bg-card border-border relative rounded-xl border p-5 shadow-sm">
              <span
                className="text-muted-foreground absolute end-4 top-4 text-sm font-semibold tabular-nums"
                aria-hidden
              >
                {index + 1}
              </span>
              <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold">{t(`steps.${id}.title`)}</h3>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{t(`steps.${id}.text`)}</p>
            </li>
          ))}
        </ol>
      </PageSection>

      <section
        id="demo"
        aria-labelledby="demo-title"
        className="bg-muted/40 border-border my-12 scroll-mt-16 border-y py-16"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 id="demo-title" className="text-3xl font-bold tracking-tight">
              {t("demo.title")}
            </h2>
            <p className="text-muted-foreground mt-3">{t("demo.intro")}</p>
          </div>
          <MenuDemo menus={getDemoMenus()} initialLanguage={locale} />
        </div>
      </section>

      <PageSection id="details" title={t("details.title")}>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DETAILS.map(({ id, icon: Icon }) => (
            <li key={id} className="flex gap-4">
              <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold">{t(`details.items.${id}.title`)}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {t(`details.items.${id}.text`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection id="who" title={t("who.title")} className="max-w-3xl">
        <p className="text-muted-foreground text-center text-lg leading-relaxed">{t("who.text")}</p>
      </PageSection>

      <PageSection id="multilingual-faq" title={t("faq.title")} className="max-w-3xl">
        <FaqList items={questions} />
      </PageSection>

      <CtaCard title={t("cta.title")} text={t("cta.text")}>
        <Button size="lg" asChild>
          <Link href="/start">{t("cta.start")}</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/pricing">{t("cta.pricing")}</Link>
        </Button>
      </CtaCard>
    </div>
  );
}
