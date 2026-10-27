// src/server/public-menu.ts
import { cache } from "react";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { and, asc, count, eq, isNotNull, lte, ne, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { branches, categories, menuItems, restaurants } from "~/server/db/schema";
import { LOCATION_COLUMNS, MAIN_BRANCH, withMainBranch } from "~/server/branches";

/*
 * Reads for the public restaurant pages (menu, about, item), cached across
 * requests so a guest scanning a QR code doesn't wait on the database. Every
 * action that changes restaurant or menu data calls revalidatePublicMenu,
 * which clears these caches along with the rendered pages.
 *
 * Cached values go through JSON, so Date columns are left out of them: they
 * would come back as strings.
 */

// Every slug lookup shares one tag: a renamed or removed restaurant must
// stop resolving under its old slug, and its id isn't known before the lookup.
const RESTAURANTS_TAG = "public-restaurants";
const menuTag = (restaurantId: string) => `public-menu:${restaurantId}`;
// The Menus page shows every venue with a few of its dish photos, so any
// venue or menu change clears it.
const DIRECTORY_TAG = "public-directory";

// A backstop for changes made outside the app's actions (scripts, manual
// database edits). Saves through the app clear the cache straight away.
const MAX_AGE_SECONDS = 3600;

const ITEM_COLUMNS = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  ingredients: true,
  dietaryLabels: true,
  availability: true,
  imageUrl: true,
  translations: true,
} as const;

/**
 * Restaurant row by slug, with its main branch's location and without
 * timestamps. React cache() on top shares one lookup between the layout,
 * the page and its metadata.
 */
export const getRestaurantBySlug = cache((slug: string) =>
  unstable_cache(
    async () => {
      const row = await db.query.restaurants.findFirst({
        where: eq(restaurants.slug, slug),
        columns: { createdAt: false, updatedAt: false },
        with: MAIN_BRANCH,
      });
      return row ? withMainBranch(row) : null;
    },
    ["public-restaurant", slug],
    { tags: [RESTAURANTS_TAG], revalidate: MAX_AGE_SECONDS },
  )(),
);

/** The restaurant's branches, main branch first, with where each one is. */
export const getPublicBranches = cache((restaurantId: string) =>
  unstable_cache(
    () =>
      db.query.branches.findMany({
        where: eq(branches.restaurantId, restaurantId),
        orderBy: [asc(branches.order), asc(branches.createdAt)],
        columns: { id: true, name: true, slug: true, ...LOCATION_COLUMNS },
      }),
    ["public-branches", restaurantId],
    { tags: [menuTag(restaurantId)], revalidate: MAX_AGE_SECONDS },
  )(),
);

/** Categories in order with their visible (not hidden) items. */
export const getPublicMenu = cache((restaurantId: string) =>
  unstable_cache(
    () =>
      db.query.categories.findMany({
        where: eq(categories.restaurantId, restaurantId),
        orderBy: (categories, { asc }) => [asc(categories.order)],
        columns: { id: true, name: true, slug: true, translations: true },
        with: {
          menuItems: {
            // Hidden items aren't on the public menu; sold-out ones are, marked.
            where: and(
              eq(menuItems.restaurantId, restaurantId),
              ne(menuItems.availability, "hidden"),
            ),
            orderBy: (menuItems, { asc }) => [asc(menuItems.order)],
            columns: ITEM_COLUMNS,
          },
        },
      }),
    ["public-menu", restaurantId],
    { tags: [menuTag(restaurantId)], revalidate: MAX_AGE_SECONDS },
  )(),
);

/** One visible item by slug, with its category's name and slug. */
export const getPublicMenuItem = cache(
  (restaurantId: string, itemSlug: string) =>
    unstable_cache(
      async () =>
        (await db.query.menuItems.findFirst({
          where: and(
            eq(menuItems.restaurantId, restaurantId),
            eq(menuItems.slug, itemSlug),
            ne(menuItems.availability, "hidden"),
          ),
          columns: ITEM_COLUMNS,
          with: {
            category: {
              columns: { name: true, slug: true, translations: true },
            },
          },
        })) ?? null,
      ["public-menu-item", restaurantId, itemSlug],
      { tags: [menuTag(restaurantId)], revalidate: MAX_AGE_SECONDS },
    )(),
);

// Dish photos on each card of the Menus page.
const PHOTOS_PER_CARD = 3;

/**
 * Every live venue for the Menus page: its card details, its first few dish
 * photos (in menu order) and how many dishes guests can see.
 */
export const getMenusDirectory = cache(
  unstable_cache(
    async () => {
      const venues = await db.query.restaurants.findMany({
        where: eq(restaurants.isActive, true),
        columns: {
          id: true,
          slug: true,
          name: true,
          logoUrl: true,
          typeOfEstablishment: true,
          foodType: true,
          isDisplayed: true,
          multilingualEnabled: true,
          mainLanguage: true,
          extraLanguages: true,
        },
        with: MAIN_BRANCH,
      });

      const ranked = db
        .select({
          restaurantId: menuItems.restaurantId,
          imageUrl: menuItems.imageUrl,
          // Each photo once (dishes can share one), placed where it first
          // appears in the menu.
          rank: sql<number>`row_number() over (partition by ${menuItems.restaurantId} order by min(${categories.order}), min(${menuItems.order}))`.as(
            "rank",
          ),
        })
        .from(menuItems)
        .innerJoin(categories, eq(categories.id, menuItems.categoryId))
        .where(
          and(isNotNull(menuItems.imageUrl), ne(menuItems.availability, "hidden")),
        )
        .groupBy(menuItems.restaurantId, menuItems.imageUrl)
        .as("ranked");
      const [photos, dishCounts] = await Promise.all([
        db
          .select({ restaurantId: ranked.restaurantId, imageUrl: ranked.imageUrl })
          .from(ranked)
          .where(lte(ranked.rank, PHOTOS_PER_CARD))
          .orderBy(ranked.restaurantId, ranked.rank),
        db
          .select({ restaurantId: menuItems.restaurantId, dishes: count() })
          .from(menuItems)
          .where(ne(menuItems.availability, "hidden"))
          .groupBy(menuItems.restaurantId),
      ]);

      return venues.map(withMainBranch).map((venue) => ({
        ...venue,
        photos: photos
          .filter((p) => p.restaurantId === venue.id && p.imageUrl)
          .map((p) => p.imageUrl!),
        dishCount: dishCounts.find((c) => c.restaurantId === venue.id)?.dishes ?? 0,
      }));
    },
    ["public-directory"],
    { tags: [DIRECTORY_TAG], revalidate: MAX_AGE_SECONDS },
  ),
);

// Public pages, the dashboard and the admin panel all show this data, so
// every page under the locale segment is re-rendered too.
const revalidateLocalePages = () => revalidatePath("/[locale]", "layout");

/** After a change to a restaurant's categories or items. */
export function revalidatePublicMenu(restaurantId: string) {
  revalidateTag(menuTag(restaurantId));
  revalidateTag(DIRECTORY_TAG);
  revalidateLocalePages();
}

/**
 * After a restaurant is added, changed or deleted. Pass the id when there is
 * one, so its cached menu goes too.
 */
export function revalidatePublicRestaurant(restaurantId?: string) {
  revalidateTag(RESTAURANTS_TAG);
  revalidateTag(DIRECTORY_TAG);
  if (restaurantId) revalidateTag(menuTag(restaurantId));
  revalidateLocalePages();
}
