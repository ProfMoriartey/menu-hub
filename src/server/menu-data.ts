// src/server/menu-data.ts
// Data for the menu editor pages, shared by the admin panel and the dashboard.
import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { categories, menuItems } from "~/server/db/schema";
import type { CategorySummary } from "~/components/menu-editor/CategoryList";

/** Categories in menu order, with item counts and a few photo thumbnails. */
export async function getCategorySummaries(
  restaurantId: string,
): Promise<CategorySummary[]> {
  const rows = await db.query.categories.findMany({
    where: eq(categories.restaurantId, restaurantId),
    orderBy: (categories, { asc }) => [asc(categories.order)],
    with: {
      menuItems: {
        columns: { id: true, imageUrl: true },
        orderBy: (menuItems, { asc }) => [asc(menuItems.order)],
      },
    },
  });

  return rows.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    order: category.order,
    translations: category.translations,
    itemCount: category.menuItems.length,
    thumbnails: category.menuItems
      .map((item) => item.imageUrl)
      .filter((url): url is string => Boolean(url))
      .slice(0, 3),
  }));
}

/**
 * One category's items, plus every category of the restaurant for the
 * switcher. Returns null when the slug doesn't belong to this restaurant.
 */
export async function getCategoryWithItems(
  restaurantId: string,
  categorySlug: string,
) {
  const allCategories = await db.query.categories.findMany({
    where: eq(categories.restaurantId, restaurantId),
    orderBy: (categories, { asc }) => [asc(categories.order)],
    columns: { id: true, slug: true, name: true },
  });

  const category = allCategories.find((c) => c.slug === categorySlug);
  if (!category) return null;

  const items = await db.query.menuItems.findMany({
    where: and(
      eq(menuItems.categoryId, category.id),
      eq(menuItems.restaurantId, restaurantId),
    ),
    orderBy: (menuItems, { asc }) => [asc(menuItems.order)],
  });

  return { category, allCategories, items };
}
