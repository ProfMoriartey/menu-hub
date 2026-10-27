// src/app/actions/search.ts
"use server";

import { getLocale } from "next-intl/server";
import { and, asc, eq, ne, or, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { menuItems, restaurants } from "~/server/db/schema";
import { localizeItem } from "~/server/localize-menu";
import { formatPrice } from "~/lib/format-price";
import { menuLanguagesOf } from "~/lib/menu-languages";
import { MIN_DISH_QUERY } from "~/lib/menus-directory";

export interface DishResult {
  id: string;
  slug: string;
  name: string;
  // Set when the name is in another language than the page.
  lang?: string;
  price: string;
  imageUrl: string | null;
  soldOut: boolean;
  restaurantId: string;
}

const MAX_RESULTS = 60;

// ILIKE treats % and _ as wildcards; a guest typing them means the character.
const likePattern = (text: string) =>
  `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

/**
 * Dishes on any live menu whose name or description contains `query`, in
 * the main language or a translation. Names come back in the page's
 * language where the menu has it, prices formatted for it. Dishes whose
 * name matches come first.
 */
export async function searchDishes(query: string): Promise<DishResult[]> {
  const text = query.trim().slice(0, 100);
  if (text.length < MIN_DISH_QUERY) return [];
  const pattern = likePattern(text);
  const locale = await getLocale();

  // Only the translated texts, not the field names stored beside them.
  const inTranslations = sql`exists (
    select 1 from jsonb_each(coalesce(${menuItems.translations}, '{}'::jsonb)) as l(lang, fields),
      jsonb_each_text(l.fields) as f(field, value)
    where f.value ilike ${pattern}
  )`;
  const nameMatches = sql`${menuItems.name} ilike ${pattern}`;

  const rows = await db
    .select({
      id: menuItems.id,
      slug: menuItems.slug,
      name: menuItems.name,
      description: menuItems.description,
      ingredients: menuItems.ingredients,
      translations: menuItems.translations,
      price: menuItems.price,
      imageUrl: menuItems.imageUrl,
      availability: menuItems.availability,
      restaurantId: menuItems.restaurantId,
      currency: restaurants.currency,
      multilingualEnabled: restaurants.multilingualEnabled,
      mainLanguage: restaurants.mainLanguage,
      extraLanguages: restaurants.extraLanguages,
    })
    .from(menuItems)
    .innerJoin(restaurants, eq(restaurants.id, menuItems.restaurantId))
    .where(
      and(
        eq(restaurants.isActive, true),
        ne(menuItems.availability, "hidden"),
        or(
          nameMatches,
          sql`${menuItems.description} ilike ${pattern}`,
          inTranslations,
        ),
      ),
    )
    .orderBy(sql`(${nameMatches}) desc`, asc(menuItems.name))
    .limit(MAX_RESULTS);

  return rows.map((row) => {
    const item = localizeItem(row, menuLanguagesOf(row), locale);
    return {
      id: row.id,
      slug: row.slug,
      name: item.name,
      lang: item.lang,
      price: formatPrice(row.price, row.currency, locale),
      imageUrl: row.imageUrl,
      soldOut: row.availability === "sold_out",
      restaurantId: row.restaurantId,
    };
  });
}
