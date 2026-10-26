// src/server/localize-menu.ts
import {
  contentLanguage,
  pickText,
  type CategoryTranslations,
  type ItemTranslations,
  type MenuLanguages,
  type RestaurantTranslations,
} from "~/lib/menu-languages";

/*
 * Turns menu rows into what a guest reading the page in `pageLanguage`
 * sees: their language where the menu has it, the main language otherwise,
 * field by field. Text in another language than the page gets `lang`, so
 * screen readers pronounce it right. With translations off, rows come back
 * as stored and `lang` stays unset.
 */

type Lang = string | undefined;

// Only mark text whose language is known and differs from the page's.
const markIfOther = (lang: string | null, pageLanguage: string): Lang =>
  lang && lang !== pageLanguage ? lang : undefined;

export function localizeItem<
  T extends {
    name: string;
    description: string | null;
    ingredients: string | null;
    translations: ItemTranslations | null;
  },
>(item: T, languages: MenuLanguages | null, pageLanguage: string) {
  const { translations, ...rest } = item;
  const wanted = contentLanguage(languages, pageLanguage);
  const name = pickText(item.name, translations, "name", languages, wanted);
  const description = pickText(
    item.description,
    translations,
    "description",
    languages,
    wanted,
  );
  const ingredients = pickText(
    item.ingredients,
    translations,
    "ingredients",
    languages,
    wanted,
  );
  return {
    ...rest,
    name: name.text ?? item.name,
    description: description.text,
    ingredients: ingredients.text,
    lang: markIfOther(name.lang, pageLanguage),
    // Guests can still search by the main-language name and description.
    searchText:
      name.text !== item.name
        ? [item.name, item.description].filter(Boolean).join(" ")
        : undefined,
  };
}

export function localizeCategory<
  T extends { name: string; translations: CategoryTranslations | null },
>(category: T, languages: MenuLanguages | null, pageLanguage: string) {
  const { translations, ...rest } = category;
  const wanted = contentLanguage(languages, pageLanguage);
  const name = pickText(category.name, translations, "name", languages, wanted);
  return {
    ...rest,
    name: name.text ?? category.name,
    lang: markIfOther(name.lang, pageLanguage),
  };
}

export function localizeDescription(
  restaurant: {
    description: string | null;
    translations: RestaurantTranslations | null;
  },
  languages: MenuLanguages | null,
  pageLanguage: string,
) {
  const wanted = contentLanguage(languages, pageLanguage);
  const description = pickText(
    restaurant.description,
    restaurant.translations,
    "description",
    languages,
    wanted,
  );
  return {
    text: description.text,
    lang: markIfOther(description.lang, pageLanguage),
  };
}
