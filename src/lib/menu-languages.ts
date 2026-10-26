// src/lib/menu-languages.ts
// Menus in several languages. Browser-safe: used by the editors, the public
// pages and the server actions alike.
//
// A restaurant's existing text columns (item name, description, …) hold its
// MAIN language. Other languages live in a `translations` JSON column,
// keyed by language. Only the site's own languages can be menu languages, so
// the page around a translated menu is always in the same language.

export const MENU_LANGUAGES = ["en", "tr", "ar", "es", "ru"] as const;
export type MenuLanguage = (typeof MENU_LANGUAGES)[number];

// Each language in its own name, so people find theirs whatever the page is in.
export const LANGUAGE_NAMES: Record<MenuLanguage, string> = {
  en: "English",
  tr: "Türkçe",
  ar: "العربية",
  es: "Español",
  ru: "Русский",
};

export const isMenuLanguage = (value: unknown): value is MenuLanguage =>
  typeof value === "string" &&
  (MENU_LANGUAGES as readonly string[]).includes(value);

export const ITEM_TEXT_FIELDS = ["name", "description", "ingredients"] as const;
export type ItemTextField = (typeof ITEM_TEXT_FIELDS)[number];

export type ItemTranslations = Partial<
  Record<MenuLanguage, Partial<Record<ItemTextField, string>>>
>;
export type CategoryTranslations = Partial<
  Record<MenuLanguage, { name?: string }>
>;
export type RestaurantTranslations = Partial<
  Record<MenuLanguage, { description?: string }>
>;

/** The languages a restaurant's menu is in, when the feature is in use. */
export interface MenuLanguages {
  main: MenuLanguage;
  // Never includes `main`.
  extra: MenuLanguage[];
}

/**
 * The restaurant's menu languages, or null when translations shouldn't be
 * used: an admin hasn't turned the feature on, or no main language is set.
 * Turning it off hides translations everywhere without deleting them.
 */
export function menuLanguagesOf(restaurant: {
  multilingualEnabled: boolean;
  mainLanguage: string | null;
  extraLanguages: string[] | null;
}): MenuLanguages | null {
  if (
    !restaurant.multilingualEnabled ||
    !isMenuLanguage(restaurant.mainLanguage)
  )
    return null;
  const main = restaurant.mainLanguage;
  const extra = (restaurant.extraLanguages ?? []).filter(
    (lang): lang is MenuLanguage => isMenuLanguage(lang) && lang !== main,
  );
  return { main, extra: [...new Set(extra)] };
}

/** Every language the menu is published in, main first. */
export const allMenuLanguages = (languages: MenuLanguages) => [
  languages.main,
  ...languages.extra,
];

/**
 * Cleans translations sent by a form: only the given languages and fields,
 * trimmed, empty values dropped, cut to `maxLength`. Anything else is ignored.
 */
export function cleanTranslations<F extends string>(
  raw: unknown,
  languages: MenuLanguage[],
  fields: readonly F[],
  maxLength: (field: F) => number,
): Partial<Record<MenuLanguage, Partial<Record<F, string>>>> {
  const result: Partial<Record<MenuLanguage, Partial<Record<F, string>>>> = {};
  if (!raw || typeof raw !== "object") return result;
  for (const lang of languages) {
    const entry = (raw as Record<string, unknown>)[lang];
    if (!entry || typeof entry !== "object") continue;
    const cleaned: Partial<Record<F, string>> = {};
    for (const field of fields) {
      const value = (entry as Record<string, unknown>)[field];
      if (typeof value === "string" && value.trim()) {
        cleaned[field] = value.trim().slice(0, maxLength(field));
      }
    }
    if (Object.keys(cleaned).length > 0) result[lang] = cleaned;
  }
  return result;
}

/**
 * Saved translations after an edit: the languages being edited are replaced
 * by what was sent; languages no longer in use keep what they had, so adding
 * a language back brings its text back.
 */
export function mergeTranslations<
  T extends Partial<Record<MenuLanguage, object>>,
>(
  stored: T | null | undefined,
  edited: T,
  editedLanguages: MenuLanguage[],
): T | null {
  const merged: Partial<Record<MenuLanguage, object>> = { ...(stored ?? {}) };
  for (const lang of editedLanguages) {
    if (edited[lang]) merged[lang] = edited[lang];
    else delete merged[lang];
  }
  return Object.keys(merged).length > 0 ? (merged as T) : null;
}

/** Extra languages that have no translated name yet. */
export function missingNames(
  translations:
    | Partial<Record<MenuLanguage, { name?: string }>>
    | null
    | undefined,
  languages: MenuLanguages | null,
): MenuLanguage[] {
  if (!languages) return [];
  return languages.extra.filter((lang) => !translations?.[lang]?.name?.trim());
}

/**
 * Which language to show a guest reading the page in `pageLanguage`: that
 * language when the menu has it, else the main one. Null when translations
 * aren't in use, meaning "show the stored text as it is".
 */
export function contentLanguage(
  languages: MenuLanguages | null,
  pageLanguage: string,
): MenuLanguage | null {
  if (!languages) return null;
  return isMenuLanguage(pageLanguage) &&
    allMenuLanguages(languages).includes(pageLanguage)
    ? pageLanguage
    : languages.main;
}

/**
 * One text in the language a guest should see, falling back to the main
 * language's text field by field (a dish translated without its description
 * shows the main description). Returns the language actually shown, so the
 * page can mark text that differs from the page's language.
 */
export function pickText<F extends string>(
  mainValue: string | null,
  translations:
    | Partial<Record<MenuLanguage, Partial<Record<F, string>>>>
    | null
    | undefined,
  field: F,
  languages: MenuLanguages | null,
  wanted: MenuLanguage | null,
): { text: string | null; lang: MenuLanguage | null } {
  if (!languages || !wanted) return { text: mainValue, lang: null };
  const translated =
    wanted === languages.main ? undefined : translations?.[wanted]?.[field];
  return translated
    ? { text: translated, lang: wanted }
    : { text: mainValue, lang: mainValue ? languages.main : null };
}
