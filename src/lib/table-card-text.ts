// src/lib/table-card-text.ts
// The words printed on table cards. They are chosen per card, independently
// of the dashboard's language (a Turkish restaurant may print Turkish and
// English), so they live here rather than in the dashboard messages.
import { routing } from "~/i18n/routing";

export type CardLanguage = (typeof routing.locales)[number];

export const CARD_HEADLINES: Record<CardLanguage, string> = {
  en: "Scan for the menu",
  tr: "Menü için okutun",
  ar: "امسح الرمز لعرض القائمة",
  es: "Escanea para ver el menú",
  ru: "Отсканируйте, чтобы открыть меню",
};

// Each language in its own name, for the language pickers.
export const CARD_LANGUAGE_NAMES: Record<CardLanguage, string> = {
  en: "English",
  tr: "Türkçe",
  ar: "العربية",
  es: "Español",
  ru: "Русский",
};

export const isCardLanguage = (value: string): value is CardLanguage =>
  (routing.locales as readonly string[]).includes(value);
