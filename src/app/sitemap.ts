// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "~/server/db";
import { branches, menuItems, restaurants } from "~/server/db/schema";
import { routing } from "~/i18n/routing";
import { allMenuLanguages, menuLanguagesOf } from "~/lib/menu-languages";
import { getPublicOrigin } from "~/server/public-origin";
import { visibleBranches } from "~/server/branches";

// Built when requested, never at build time: a build-time sitemap would stay
// frozen until the next deploy, and the build would need the database. The
// query below is cached for an hour, so crawlers don't load it.
export const dynamic = "force-dynamic";

// Marketing pages, by path without the locale.
const SITE_PAGES = ["", "/menus", "/about", "/features"];

interface LivePath {
  path: string;
  // The menu's languages when it's translated; else every site language.
  languages: readonly string[];
}

// Live restaurants and their visible items. Crawlers can wait an hour for a
// new dish, so this isn't cleared on every save like the menu pages are.
const getLivePaths = unstable_cache(
  async (): Promise<LivePath[]> => {
    const live = await db
      .select({
        id: restaurants.id,
        slug: restaurants.slug,
        multilingualEnabled: restaurants.multilingualEnabled,
        maxExtraLanguages: restaurants.maxExtraLanguages,
        maxBranches: restaurants.maxBranches,
        mainLanguage: restaurants.mainLanguage,
        extraLanguages: restaurants.extraLanguages,
      })
      .from(restaurants)
      .where(eq(restaurants.isActive, true));
    const branchRows = await db
      .select({ restaurantId: branches.restaurantId, slug: branches.slug })
      .from(branches)
      .innerJoin(restaurants, eq(branches.restaurantId, restaurants.id))
      .where(eq(restaurants.isActive, true))
      .orderBy(branches.restaurantId, branches.order, branches.createdAt);
    const items = await db
      .select({ restaurantId: menuItems.restaurantId, item: menuItems.slug })
      .from(menuItems)
      .innerJoin(restaurants, eq(menuItems.restaurantId, restaurants.id))
      .where(
        and(
          eq(restaurants.isActive, true),
          ne(menuItems.availability, "hidden"),
        ),
      );

    // A translated menu is only listed in its own languages: the other
    // language versions point to the main one (see publicPageMetadata).
    const byId = new Map(
      live.map((r) => {
        const languages = menuLanguagesOf(r);
        return [
          r.id,
          {
            slug: r.slug,
            languages: languages
              ? allMenuLanguages(languages)
              : routing.locales,
          },
        ];
      }),
    );
    // Branches have pages of their own once a restaurant has several, up
    // to its plan's limit.
    const limitBy = new Map(live.map((r) => [r.id, r.maxBranches]));
    const slugsBy = new Map<string, string[]>();
    for (const { restaurantId, slug } of branchRows) {
      slugsBy.set(restaurantId, [...(slugsBy.get(restaurantId) ?? []), slug]);
    }
    return [
      ...[...byId.values()].flatMap(({ slug, languages }) => [
        { path: `/${slug}`, languages },
        { path: `/${slug}/about`, languages },
      ]),
      ...[...slugsBy].flatMap(([restaurantId, slugs]) => {
        const restaurant = byId.get(restaurantId);
        const shown = visibleBranches(slugs, limitBy.get(restaurantId) ?? null);
        if (!restaurant || shown.length < 2) return [];
        const { languages } = restaurant;
        return shown.flatMap((slug) => [
          { path: `/${restaurant.slug}/${slug}`, languages },
          { path: `/${restaurant.slug}/${slug}/about`, languages },
        ]);
      }),
      ...items.flatMap(({ restaurantId, item }) => {
        const restaurant = byId.get(restaurantId);
        return restaurant
          ? [
              {
                path: `/${restaurant.slug}/item/${item}`,
                languages: restaurant.languages,
              },
            ]
          : [];
      }),
    ];
  },
  ["sitemap-live-paths"],
  { revalidate: 3600 },
);

/**
 * Every public page in each of its languages, each listing the others, so
 * search engines find all live menus and show guests the right language.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await getPublicOrigin();
  const pages: LivePath[] = [
    ...SITE_PAGES.map((path) => ({ path, languages: routing.locales })),
    ...(await getLivePaths()),
  ];

  return pages.flatMap(({ path, languages }) => {
    const alternates = Object.fromEntries(
      languages.map((locale) => [locale, `${origin}/${locale}${path}`]),
    );
    return languages.map((locale) => ({
      url: `${origin}/${locale}${path}`,
      alternates: { languages: alternates },
    }));
  });
}
