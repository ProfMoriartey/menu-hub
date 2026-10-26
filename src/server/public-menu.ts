// src/server/public-menu.ts
import { cache } from "react";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "~/server/db";
import { categories, menuItems, restaurants } from "~/server/db/schema";

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
 * Restaurant row by slug, without relations or timestamps. React cache()
 * on top shares one lookup between the layout, the page and its metadata.
 */
export const getRestaurantBySlug = cache((slug: string) =>
  unstable_cache(
    async () =>
      (await db.query.restaurants.findFirst({
        where: eq(restaurants.slug, slug),
        columns: { createdAt: false, updatedAt: false },
      })) ?? null,
    ["public-restaurant", slug],
    { tags: [RESTAURANTS_TAG], revalidate: MAX_AGE_SECONDS },
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

// Public pages, the dashboard and the admin panel all show this data, so
// every page under the locale segment is re-rendered too.
const revalidateLocalePages = () => revalidatePath("/[locale]", "layout");

/** After a change to a restaurant's categories or items. */
export function revalidatePublicMenu(restaurantId: string) {
  revalidateTag(menuTag(restaurantId));
  revalidateLocalePages();
}

/**
 * After a restaurant is added, changed or deleted. Pass the id when there is
 * one, so its cached menu goes too.
 */
export function revalidatePublicRestaurant(restaurantId?: string) {
  revalidateTag(RESTAURANTS_TAG);
  if (restaurantId) revalidateTag(menuTag(restaurantId));
  revalidateLocalePages();
}
