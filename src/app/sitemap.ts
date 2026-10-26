// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "~/server/db";
import { menuItems, restaurants } from "~/server/db/schema";
import { routing } from "~/i18n/routing";
import { getPublicOrigin } from "~/server/public-origin";

// Marketing pages, by path without the locale.
const SITE_PAGES = ["", "/restaurants", "/about", "/themes"];

// Live restaurants and their visible items. Crawlers can wait an hour for a
// new dish, so this isn't cleared on every save like the menu pages are.
const getLivePaths = unstable_cache(
  async () => {
    const live = await db
      .select({ slug: restaurants.slug })
      .from(restaurants)
      .where(eq(restaurants.isActive, true));
    const items = await db
      .select({ restaurant: restaurants.slug, item: menuItems.slug })
      .from(menuItems)
      .innerJoin(restaurants, eq(menuItems.restaurantId, restaurants.id))
      .where(
        and(
          eq(restaurants.isActive, true),
          ne(menuItems.availability, "hidden"),
        ),
      );
    return [
      ...live.flatMap(({ slug }) => [`/${slug}`, `/${slug}/about`]),
      ...items.map(({ restaurant, item }) => `/${restaurant}/item/${item}`),
    ];
  },
  ["sitemap-live-paths"],
  { revalidate: 3600 },
);

/**
 * Every public page in every language, each listing its other languages, so
 * search engines find all live menus and show guests the right language.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await getPublicOrigin();
  const paths = [...SITE_PAGES, ...(await getLivePaths())];

  return paths.flatMap((path) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${origin}/${locale}${path}`]),
    );
    return routing.locales.map((locale) => ({
      url: `${origin}/${locale}${path}`,
      alternates: { languages },
    }));
  });
}
