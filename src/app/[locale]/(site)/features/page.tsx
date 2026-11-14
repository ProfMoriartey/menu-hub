// app/[locale]/(site)/features/page.tsx
import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  BarChart3,
  ChefHat,
  Clock,
  Globe,
  Languages,
  LayoutTemplate,
  Mail,
  MapPin,
  MessageCircle,
  Palette,
  QrCode,
  Search,
  Share2,
  Smartphone,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { MenuDemo } from "~/components/features/MenuDemo";
import { getDemoMenus } from "~/server/demo-menu";
import { CONTACT_EMAIL, whatsappLink } from "~/lib/site-contact";
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
const GROUPS: { id: string; features: { id: string; icon: LucideIcon }[] }[] = [
  {
    id: "look",
    features: [
      { id: "designs", icon: LayoutTemplate },
      { id: "colors", icon: Palette },
      { id: "fast", icon: Smartphone },
    ],
  },
  {
    id: "guests",
    features: [
      { id: "languages", icon: Languages },
      { id: "search", icon: Search },
      { id: "friendly", icon: ChefHat },
    ],
  },
  {
    id: "current",
    features: [
      { id: "instant", icon: Zap },
      { id: "hours", icon: Clock },
      { id: "qr", icon: QrCode },
      { id: "stats", icon: BarChart3 },
    ],
  },
  {
    id: "found",
    features: [
      { id: "google", icon: Globe },
      { id: "sharing", icon: Share2 },
      { id: "about", icon: MapPin },
    ],
  },
];

// Features with a page of their own, linked from their card.
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
    <div className="text-foreground">
      <section className="container mx-auto max-w-3xl px-4 pt-16 pb-12 text-center sm:pt-24">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t("hero.title")}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">{t("hero.intro")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <a href="#demo">{t("hero.ctaDemo")}</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#contact">{t("hero.ctaContact")}</a>
          </Button>
        </div>
      </section>

      <section
        id="demo"
        aria-labelledby="demo-title"
        className="bg-muted/40 border-border scroll-mt-16 border-y py-16"
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

      <div className="container mx-auto space-y-16 px-4 py-16">
        {GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <h2
              id={`group-${group.id}`}
              className="mb-6 text-2xl font-bold tracking-tight"
            >
              {t(`groups.${group.id}`)}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.features.map(({ id, icon: Icon }) => (
                <li
                  key={id}
                  className="bg-card border-border rounded-xl border p-5 shadow-sm"
                >
                  <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-semibold">
                    {t(`features.${id}.title`)}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {t(`features.${id}.text`)}
                  </p>
                  {FEATURE_PAGES[id] && (
                    <Link
                      href={FEATURE_PAGES[id]}
                      className="text-primary mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                      {t(`featureLinks.${id}`)}
                      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* The price in a line; the plan, trial and questions are on /pricing. */}
      <section
        aria-labelledby="pricing-band-title"
        className="container mx-auto px-4 pb-16"
      >
        <div className="bg-card border-border mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border px-6 py-8 text-center shadow-sm sm:flex-row sm:text-start">
          <div className="flex-1">
            <h2 id="pricing-band-title" className="text-xl font-bold tracking-tight">
              {t("pricing.title", facts)}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">{t("pricing.text", facts)}</p>
          </div>
          <Button size="lg" variant="outline" className="shrink-0" asChild>
            <Link href="/pricing">{t("pricing.link")}</Link>
          </Button>
        </div>
      </section>

      <section
        id="contact"
        aria-labelledby="contact-title"
        className="container mx-auto scroll-mt-16 px-4 pb-24"
      >
        <div className="bg-primary text-primary-foreground mx-auto max-w-3xl rounded-2xl px-6 py-12 text-center shadow-lg sm:px-12">
          <h2 id="contact-title" className="text-3xl font-bold tracking-tight">
            {t("contact.title")}
          </h2>
          <p className="mt-3 opacity-90">{t("contact.text")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Mail className="h-4 w-4" aria-hidden /> {t("contact.email")}
              </a>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <a
                href={whatsappLink(t("contact.whatsappMessage"))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />{" "}
                {t("contact.whatsapp")}
              </a>
            </Button>
          </div>
          <p className="mt-4 text-sm opacity-80" dir="ltr">
            {CONTACT_EMAIL}
          </p>
        </div>
      </section>
    </div>
  );
}
