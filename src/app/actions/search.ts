// src/app/actions/search.ts
"use server";

import { getLocale } from "next-intl/server";
import { and, asc, eq, ne, or, sql, type AnyColumn, type SQL } from "drizzle-orm";
import { db } from "~/server/db";
import { menuItems, restaurants } from "~/server/db/schema";
import { localizeItem } from "~/server/localize-menu";
import { formatPrice } from "~/lib/format-price";
import { menuLanguagesOf } from "~/lib/menu-languages";
import { MIN_DISH_QUERY } from "~/lib/menus-directory";
import { FOLD_FROM, FOLD_TO, foldText } from "~/lib/fold-text";

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

// The column's text folded like the query (lib/fold-text), so accents and
// letter variants don't stop a match.
const folded = (column: SQL | AnyColumn) =>
  sql`translate(lower(${column}), ${FOLD_FROM}, ${FOLD_TO})`;

/**
 * Dishes on any live menu (or those in `country`) whose name or description contains `query`, in
 * the main language or a translation, ignoring case and accents. Names come back in the page's
 * language where the menu has it, prices formatted for it. Dishes whose
 * name matches come first.
 */
export async function searchDishes(
  query: string,
  // An ISO code: only menus from that country.
  country?: string | null,
): Promise<DishResult[]> {
  const text = query.trim().slice(0, 100);
  if (text.length < MIN_DISH_QUERY) return [];
  const locale = await getLocale();
  const pattern = likePattern(foldText(text, locale));

  // Only the translated texts, not the field names stored beside them.
  const inTranslations = sql`exists (
    select 1 from jsonb_each(coalesce(${menuItems.translations}, '{}'::jsonb)) as l(lang, fields),
      jsonb_each_text(l.fields) as f(field, value)
    where ${folded(sql`f.value`)} like ${pattern}
  )`;
  const nameMatches = sql`${folded(menuItems.name)} like ${pattern}`;

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
        country ? eq(restaurants.country, country) : undefined,
        ne(menuItems.availability, "hidden"),
        or(
          nameMatches,
          sql`${folded(menuItems.description)} like ${pattern}`,
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
