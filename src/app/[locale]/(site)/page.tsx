// app/[locale]/(site)/page.tsx
import type { Metadata } from "next";
import { connection } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";
import { ContactClose } from "~/components/home/ContactClose";
import { ExampleMenus } from "~/components/home/ExampleMenus";
import { Features } from "~/components/home/Features";
import { GuestsSee } from "~/components/home/GuestsSee";
import { Hero } from "~/components/home/Hero";
import { HowItWorks } from "~/components/home/HowItWorks";
import { Pricing } from "~/components/home/Pricing";
import { getDirectoryVenues } from "~/server/directory-venues";
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

/**
 * The home page, on The Table: the first viewport, how it works, what
 * guests see, features, example menus, pricing and the close. Each section
 * is a small component in components/home (see "Home pattern" in DESIGN.md).
 */
export default async function HomePage() {
  // The directory computes "open now" from the clock.
  await connection();
  const [t, locale, { venues }] = await Promise.all([
    getTranslations("HomePage"),
    getLocale(),
    getDirectoryVenues(),
  ]);

  return (
    <>
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
      <Hero />
      <HowItWorks />
      <GuestsSee />
      <Features />
      <ExampleMenus venues={venues} />
      <Pricing />
      <ContactClose />
    </>
  );
}
