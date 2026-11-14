// app/[locale]/(site)/page.tsx
import type { Metadata } from "next";
import { connection } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { MenuDemo } from "~/components/features/MenuDemo";
import { MenuCard } from "~/components/menus/MenuCard";
import { PlanSummary } from "~/components/plans/PlanSummary";
import { ContactBand } from "~/components/shared/ContactBand";
import { LeaderRow } from "~/components/shared/LeaderRow";
import { PageSection } from "~/components/shared/MarketingBlocks";
import { Plate, PlatePhoto, Platter } from "~/components/shared/Plate";
import { DoodleReveal } from "~/components/shared/Reveal";
import { StepPlates } from "~/components/shared/StepPlates";
import CoffeeDoodle from "~/components/svg/CoffeeDoodle";
import GroovySittingDoodle from "~/components/svg/GroovySittingDoodle";
import SittingDoodle from "~/components/svg/SittingDoodle";
import { getDemoMenus } from "~/server/demo-menu";
import { getDirectoryVenues } from "~/server/directory-venues";
import { venueWithBranches } from "~/lib/menus-directory";
import { isMenuLanguage } from "~/lib/menu-languages";
import { jsonLd } from "~/server/menu-structured-data";
import { sitePageMetadata } from "~/server/public-metadata";
import { cachedPageOrigin } from "~/server/public-origin";
import { siteStructuredData } from "~/server/site-structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("HomePage"), getLocale()]);
  return sitePageMetadata({
    locale,
    path: "",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

const STEPS = ["s1", "s2", "s3"] as const;

const GUEST_POINTS = ["p1", "p2", "p3", "p4"] as const;

// The features as menu rows (HomePage.features.items).
const FEATURES = ["designs", "languages", "colors", "instant", "hours", "qr"] as const;

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
  const [t, tPricing, locale, { venues, local }] = await Promise.all([
    getTranslations("HomePage"),
    getTranslations("pricingPage"),
    getLocale(),
    getDirectoryVenues(),
  ]);

  const demoMenus = getDemoMenus();
  // Four dishes with photos, in the page's language.
  const dishes = demoMenus[isMenuLanguage(locale) ? locale : "en"].categories
    .flatMap((c) => c.menuItems)
    .filter((d) => d.imageUrl?.startsWith("/demo/"))
    .slice(0, 4);

  const isLocal = local !== null && local.count > 0;
  // A chain shows its branches in the visitor's country.
  const nearby = isLocal
    ? venues.flatMap((v) => venueWithBranches(v, (b) => b.countryCode === local.code) ?? [])
    : venues;
  // Featured first; the sort keeps name order otherwise.
  const shown = [...nearby]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, MENUS_SHOWN);

  return (
    <div className="text-foreground overflow-x-clip">
      {/* Search engines read this: the site's name, its other spellings and logo. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            siteStructuredData({
              origin: cachedPageOrigin(),
              locale,
              description: t("metaDescription"),
            }),
          ),
        }}
      />
      {/* Hero: the headline on a big plate (on phones wider than the screen,
          as if seen up close), the working demo menu beside it. */}
      <section>
        <div className="container mx-auto grid grid-cols-[minmax(0,1fr)] items-center gap-12 px-4 pt-6 pb-16 sm:pt-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:pb-24">
          <div className="flex flex-col items-center">
            <Plate size="fluid" className="@container w-[min(40rem,130vw)] lg:w-full lg:max-w-[40rem]">
              <div className="flex w-[min(68%,calc(100vw-3.5rem))] flex-col items-center text-center">
                <h1 className="text-[clamp(1.75rem,8.2vw,2.75rem)] leading-[1.05] font-extrabold tracking-tight text-balance lg:text-[clamp(1.9rem,7cqw,3.1rem)] rtl:leading-[1.3]">
                  {t("hero.title")}
                </h1>
                <p className="text-muted-foreground mt-4 text-[clamp(0.9375rem,3.6vw,1.0625rem)] leading-snug text-pretty lg:text-[clamp(0.9375rem,2.7cqw,1.125rem)]">
                  {t("hero.intro")}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button className="sm:h-10 sm:px-6" asChild>
                    <Link href="/start">{t("hero.ctaStart")}</Link>
                  </Button>
                  <Button variant="outline" className="sm:h-10 sm:px-6" asChild>
                    <Link href="/menus">{t("hero.ctaMenus")}</Link>
                  </Button>
                </div>
              </div>
            </Plate>
            <ul className="text-muted-foreground mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {(["point1", "point2", "point3"] as const).map((point) => (
                <li key={point} className="flex items-center gap-1.5">
                  <Check className="text-primary h-4 w-4" aria-hidden /> {t(`hero.${point}`)}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex flex-col items-center gap-4">
            <MenuDemo menus={demoMenus} initialLanguage={locale} controls={false} />
          </div>
        </div>
      </section>

      {/* How it works: the heading and the doodle side by side, near the middle. */}
      <section aria-labelledby="steps-title" className="container mx-auto px-4 py-16 lg:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 text-center sm:flex-row sm:gap-12 sm:text-start">
          <div>
            <h2 id="steps-title" className="text-3xl font-bold tracking-tight">
              {t("steps.title")}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">{t("steps.intro")}</p>
          </div>
          <DoodleReveal from="end" className="w-44 shrink-0 sm:w-56">
            <CoffeeDoodle />
          </DoodleReveal>
        </div>
        <div className="mt-10">
          <StepPlates steps={STEPS.map((id) => ({ id, title: t(`steps.${id}.title`), text: t(`steps.${id}.text`) }))} />
        </div>
      </section>

      {/* What your guests see: what the menu page does for them, and dishes from the demo menu on plates. */}
      <PageSection id="guests" title={t("guests.title")} intro={t("guests.intro")}>
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
          <ul className="text-lg font-semibold">
            {GUEST_POINTS.map((p) => (
              <li key={p} className="border-border border-b-2 border-dotted py-4 first:pt-0 last:border-b-0">
                {t(`guests.${p}`)}
              </li>
            ))}
          </ul>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-8">
            {dishes.map((dish) => (
              <li key={dish.id} className="flex flex-col items-center gap-3 text-center">
                <PlatePhoto src={dish.imageUrl!} alt="" sizes="10rem" className="size-32 sm:size-40" />
                <span className="text-sm leading-snug font-semibold">{dish.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </PageSection>

      {/* Features, set like a short menu on a platter. */}
      <section aria-labelledby="features-title" className="container mx-auto px-4 py-16 lg:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 text-center sm:flex-row sm:gap-12 sm:text-start">
          <DoodleReveal from="start" className="w-44 shrink-0 sm:w-52">
            <SittingDoodle />
          </DoodleReveal>
          <div>
            <h2 id="features-title" className="text-3xl font-bold tracking-tight">
              {t("features.title")}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">{t("features.intro")}</p>
          </div>
        </div>
        <Platter className="mx-auto mt-10 max-w-3xl">
          <ul className="space-y-5">
            {FEATURES.map((id) => (
              <LeaderRow
                key={id}
                nameAs="h3"
                name={t(`features.items.${id}.name`)}
                value={t(`features.items.${id}.value`)}
                note={t(`features.items.${id}.note`)}
                nameClassName="text-lg font-semibold"
              />
            ))}
          </ul>
        </Platter>
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/features">
              {t("features.cta")} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      {/* Menus near you: the heading and its link close together, near the middle. */}
      {shown.length > 0 && (
        <section aria-labelledby="menus-title">
          <div className="container mx-auto px-4 py-16 lg:py-20">
            <div className="mx-auto flex max-w-4xl flex-wrap items-end justify-center gap-x-12 gap-y-4">
              <div className="flex items-center gap-5">
                <DoodleReveal from="start" className="hidden w-40 shrink-0 sm:block">
                  <GroovySittingDoodle />
                </DoodleReveal>
                <div className="text-center sm:text-start">
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

      {/* The plan, as on the pricing page. */}
      <PageSection id="pricing" title={tPricing("included.title")} intro={tPricing("included.intro")} className="scroll-mt-20">
        <PlanSummary link={{ href: "/pricing", label: t("pricing.cta") }} />
      </PageSection>

      <ContactBand />
    </div>
  );
}
