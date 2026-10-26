// src/server/demo-menu.ts
import { formatPrice } from "~/lib/format-price";
import { DEMO_RESTAURANT, demoMenuIn } from "~/lib/demo-menu";
import { MENU_LANGUAGES, type MenuLanguage } from "~/lib/menu-languages";
import type { PublicCategory } from "~/components/public/menu-types";

export type DemoMenus = Record<
  MenuLanguage,
  { description: string; categories: PublicCategory[] }
>;

/**
 * The demo menu in every language, prices formatted on the server like the
 * real menus (browsers format some currencies differently from Node).
 */
export function getDemoMenus(): DemoMenus {
  return Object.fromEntries(
    MENU_LANGUAGES.map((lang) => [
      lang,
      {
        description: DEMO_RESTAURANT.description[lang],
        categories: demoMenuIn(lang, (price) =>
          formatPrice(price, DEMO_RESTAURANT.currency, lang),
        ),
      },
    ]),
  ) as DemoMenus;
}
