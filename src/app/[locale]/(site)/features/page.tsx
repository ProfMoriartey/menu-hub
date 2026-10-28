// app/[locale]/(site)/features/page.tsx
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import {
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
import { PricingSection } from "~/components/plans/PricingSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("featuresPage");
  return { title: t("metaTitle"), description: t("metaDescription") };
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

/**
 * What restaurants get, with a working demo menu (a made-up restaurant) so
 * potential customers can try designs, colours and languages themselves.
 * Was /themes, which showed the old menu designs; /themes redirects here.
 * Getting started and teamwork are told on the About page ("How it works").
 */
export default async function FeaturesPage() {
  const [t, locale] = await Promise.all([
    getTranslations("featuresPage"),
    getLocale(),
  ]);

  return (
    <div className="text-foreground">
      <section className="container mx-auto max-w-3xl px-4 pt-16 pb-12 text-center sm:pt-24">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          {t("hero.eyebrow")}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
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
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <PricingSection className="container mx-auto px-4 pb-24" />

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
