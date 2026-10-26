// src/server/color-preview.ts
import { getLocale } from "next-intl/server";
import { formatPrice } from "~/lib/format-price";
import { getPublicMenu } from "~/server/public-menu";
import type { PreviewMenu } from "~/components/colors/MenuColorPreview";

/**
 * The restaurant's own menu for the colours page preview: its first
 * categories and dishes, as guests see them (main language).
 */
export async function getPreviewMenu(restaurant: {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  currency: string;
}): Promise<PreviewMenu> {
  const [menu, locale] = await Promise.all([
    getPublicMenu(restaurant.id),
    getLocale(),
  ]);
  return {
    name: restaurant.name,
    slug: restaurant.slug,
    logoUrl: restaurant.logoUrl,
    description: restaurant.description,
    categories: menu
      .filter((category) => category.menuItems.length > 0)
      .slice(0, 4)
      .map((category) => ({
        id: category.id,
        name: category.name,
        // The same shape the public menu uses, so the preview renders the
        // real dish components. Main language, no translations.
        items: category.menuItems
          .slice(0, 4)
          .map(({ translations: _t, ...item }) => ({
            ...item,
            displayPrice: formatPrice(item.price, restaurant.currency, locale),
          })),
      })),
  };
}
