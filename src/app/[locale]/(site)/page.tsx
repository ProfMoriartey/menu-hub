// app/[locale]/(site)/page.tsx
import type { Metadata } from "next";
import { connection } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Check,
  Clock,
  Languages,
  LayoutTemplate,
  Mail,
  MessageCircle,
  Palette,
  QrCode,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { MenuDemo } from "~/components/features/MenuDemo";
import { MenuCard } from "~/components/menus/MenuCard";
import { DoodleReveal } from "~/components/shared/Reveal";
import CoffeeDoodle from "~/components/svg/CoffeeDoodle";
import GroovySittingDoodle from "~/components/svg/GroovySittingDoodle";
import SittingDoodle from "~/components/svg/SittingDoodle";
import ZombieingDoodle from "~/components/svg/ZombieingDoodle";
import { getDemoMenus } from "~/server/demo-menu";
import { getDirectoryVenues } from "~/server/directory-venues";
import { CONTACT_EMAIL, whatsappLink } from "~/lib/site-contact";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HomePage");
  return { title: { absolute: t("metaTitle") }, description: t("metaDescription") };
}

const STEPS = ["s1", "s2", "s3"] as const;

// A few highlights; texts are the Features page's (featuresPage.features).
const FEATURES: { id: string; icon: LucideIcon }[] = [
  { id: "designs", icon: LayoutTemplate },
  { id: "colors", icon: Palette },
  { id: "languages", icon: Languages },
  { id: "instant", icon: Zap },
  { id: "hours", icon: Clock },
  { id: "qr", icon: QrCode },
];

// Cards in "menus near you".
const MENUS_SHOWN = 6;

/**
 * The home page, for restaurant owners: what Menupedia does (with the
 * working demo menu), how it works, the main features, menus already on
 * it (from the visitor's country when it has any) and how to get in touch.
 */
export default async function HomePage() {
  // Menus near you show open/closed now.
  await connection();
  const [t, tFeature, tContact, locale, { venues, local }] = await Promise.all([
    getTranslations("HomePage"),
    getTranslations("featuresPage.features"),
    getTranslations("featuresPage.contact"),
    getLocale(),
    getDirectoryVenues(),
  ]);

  const isLocal = local !== null && local.count > 0;
  const nearby = isLocal ? venues.filter((v) => v.countryCode === local.code) : venues;
  // Featured first; the sort keeps name order otherwise.
  const shown = [...nearby]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, MENUS_SHOWN);

  return (
    <div className="text-foreground overflow-x-clip">
      {/* Hero */}
      <section>
        <div className="container mx-auto grid items-center gap-12 px-4 pt-8 pb-16 sm:pt-12 lg:grid-cols-2 lg:pb-24">
          <div className="text-center lg:text-start">
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">
              {t("hero.eyebrow")}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg leading-relaxed lg:mx-0">
              {t("hero.intro")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button size="lg" className="rounded-full px-6" asChild>
                <a href="#contact">{t("hero.ctaContact")}</a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-6" asChild>
                <Link href="/menus">{t("hero.ctaMenus")}</Link>
              </Button>
            </div>
            <ul className="text-muted-foreground mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm lg:justify-start">
              {(["point1", "point2", "point3"] as const).map((point) => (
                <li key={point} className="flex items-center gap-1.5">
                  <Check className="text-primary h-4 w-4" aria-hidden /> {t(`hero.${point}`)}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex flex-col items-center gap-4">
            <MenuDemo menus={getDemoMenus()} initialLanguage={locale} controls={false} />
            <p className="text-muted-foreground text-sm">{t("hero.demoCaption")}</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="steps-title">
        <div className="container mx-auto grid items-center gap-10 px-4 py-16 lg:grid-cols-[1fr_auto] lg:py-20">
          <div>
            <h2 id="steps-title" className="text-3xl font-bold tracking-tight">
              {t("steps.title")}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl">{t("steps.intro")}</p>
            <ol className="mt-10 grid gap-8 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step}>
                  <span className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{t(`steps.${step}.title`)}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {t(`steps.${step}.text`)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <DoodleReveal from="end" className="mx-auto w-64 lg:w-80">
            <CoffeeDoodle />
          </DoodleReveal>
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="features-title" className="container mx-auto px-4 py-16 lg:py-20">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-start">
          <DoodleReveal from="start" className="w-44 shrink-0 sm:w-52">
            <SittingDoodle />
          </DoodleReveal>
          <div>
            <h2 id="features-title" className="text-3xl font-bold tracking-tight">
              {t("features.title")}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl">{t("features.intro")}</p>
          </div>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ id, icon: Icon }) => (
            <li key={id} className="bg-card border-border rounded-2xl border p-5 shadow-sm">
              <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold">{tFeature(`${id}.title`)}</h3>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {tFeature(`${id}.text`)}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/features">
              {t("features.cta")} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      {/* Menus near you */}
      {shown.length > 0 && (
        <section aria-labelledby="menus-title">
          <div className="container mx-auto px-4 py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-5">
                <DoodleReveal from="start" className="hidden w-40 shrink-0 sm:block">
                  <GroovySittingDoodle />
                </DoodleReveal>
                <div>
                  <h2 id="menus-title" className="text-3xl font-bold tracking-tight">
                    {isLocal ? t("menus.titleLocal", { country: local.name }) : t("menus.title")}
                  </h2>
                  <p className="text-muted-foreground mt-3">{t("menus.intro")}</p>
                </div>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/menus">
                  {t("menus.cta")} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((venue) => (
                <MenuCard key={venue.id} venue={venue} hideCountry={isLocal} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Get in touch */}
      <section
        id="contact"
        aria-labelledby="contact-title"
        className="container mx-auto scroll-mt-20 px-4 py-16 lg:py-24"
      >
        <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-3xl px-6 py-12 sm:px-12">
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="text-center lg:text-start">
              <h2 id="contact-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t("contact.title")}
              </h2>
              <p className="mt-3 max-w-xl text-lg opacity-90 lg:mx-0">{t("contact.text")}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Button
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90 rounded-full"
                  asChild
                >
                  <a href={whatsappLink(tContact("whatsappMessage"))} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" aria-hidden /> {tContact("whatsapp")}
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground rounded-full bg-transparent"
                  asChild
                >
                  <a href={`mailto:${CONTACT_EMAIL}`}>
                    <Mail className="h-4 w-4" aria-hidden /> {tContact("email")}
                  </a>
                </Button>
              </div>
            </div>
            {/* The band is amber in both themes: dark ink on a cream blob, no tile. */}
            <DoodleReveal
              from="bottom"
              className="mx-auto w-56 sm:w-72 [--doodle-backdrop:transparent] [--doodle-fill:oklch(97%_0.02_85)] [--doodle-ink:oklch(25.99%_0.026_82.52)]"
            >
              <ZombieingDoodle />
            </DoodleReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
