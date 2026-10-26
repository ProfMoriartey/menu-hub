// src/app/actions/menu-languages.ts
"use server";

import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { categories, restaurants } from "~/server/db/schema";
import {
  checkAuthorization,
  checkOwnerAuthorization,
  isSystemAdmin,
} from "~/app/actions/auth";
import { ActionError, type ActionResult } from "~/lib/action-result";
import {
  cleanTranslations,
  isMenuLanguage,
  mergeTranslations,
  type CategoryTranslations,
  type RestaurantTranslations,
} from "~/lib/menu-languages";
import { getMenuLanguages } from "~/server/menu-languages";
import { runAction } from "~/server/run-action";
import {
  revalidatePublicMenu,
  revalidatePublicRestaurant,
} from "~/server/public-menu";

/*
 * Who does what: a system admin turns menus in several languages on or off
 * per restaurant; owners and admins choose the languages and translate the
 * description; anyone on the team (editors too) translates the menu itself
 * (category names here, items in actions/menu-item.ts).
 */

// Column lengths: categories.name is 256; descriptions are text, kept sane.
const MAX_CATEGORY_NAME = 256;
const MAX_DESCRIPTION = 2000;

/** Admin only. Off hides translations everywhere but keeps them. */
export async function setMultilingualEnabled(
  restaurantId: string,
  enabled: boolean,
): Promise<ActionResult> {
  return runAction("saveLanguagesFailed", async () => {
    if (!(await isSystemAdmin())) throw new ActionError("adminOnly");
    await db
      .update(restaurants)
      .set({ multilingualEnabled: enabled === true, updatedAt: new Date() })
      .where(eq(restaurants.id, restaurantId));
    revalidatePublicRestaurant(restaurantId);
  });
}

/**
 * Owners and admins: the menu's main language (the one its existing texts
 * are in), extra languages, and the description in each extra language.
 */
export async function updateMenuLanguages(
  restaurantId: string,
  input: {
    mainLanguage: string;
    extraLanguages: string[];
    descriptions: unknown;
  },
): Promise<ActionResult> {
  return runAction("saveLanguagesFailed", async () => {
    await checkOwnerAuthorization(restaurantId);
    const row = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, restaurantId),
      columns: { multilingualEnabled: true, translations: true },
    });
    if (!row) throw new ActionError("restaurantNotFound");
    if (!row.multilingualEnabled) throw new ActionError("multilingualOff");

    if (!isMenuLanguage(input.mainLanguage))
      throw new ActionError("invalidLanguages");
    const main = input.mainLanguage;
    if (
      !Array.isArray(input.extraLanguages) ||
      !input.extraLanguages.every(isMenuLanguage)
    ) {
      throw new ActionError("invalidLanguages");
    }
    const extra = [...new Set(input.extraLanguages)].filter((l) => l !== main);

    const descriptions = cleanTranslations(
      input.descriptions,
      extra,
      ["description"] as const,
      () => MAX_DESCRIPTION,
    );
    await db
      .update(restaurants)
      .set({
        mainLanguage: main,
        extraLanguages: extra,
        translations: mergeTranslations<RestaurantTranslations>(
          row.translations,
          descriptions,
          extra,
        ),
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurantId));
    revalidatePublicRestaurant(restaurantId);
  });
}

/** Anyone on the team: a category's name in the extra languages. */
export async function updateCategoryTranslations(
  restaurantId: string,
  categoryId: string,
  names: unknown,
): Promise<ActionResult> {
  return runAction("saveTranslationsFailed", async () => {
    await checkAuthorization(restaurantId);
    const languages = await getMenuLanguages(restaurantId);
    if (!languages) throw new ActionError("multilingualOff");

    const where = and(
      eq(categories.id, categoryId),
      eq(categories.restaurantId, restaurantId),
    );
    const category = await db.query.categories.findFirst({
      where,
      columns: { translations: true },
    });
    if (!category) throw new ActionError("categoryNotFound");

    const edited = cleanTranslations(
      names,
      languages.extra,
      ["name"] as const,
      () => MAX_CATEGORY_NAME,
    );
    await db
      .update(categories)
      .set({
        translations: mergeTranslations<CategoryTranslations>(
          category.translations,
          edited,
          languages.extra,
        ),
        updatedAt: new Date(),
      })
      .where(where);
    revalidatePublicMenu(restaurantId);
  });
}
