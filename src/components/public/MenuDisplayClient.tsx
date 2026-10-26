// src/components/public/MenuDisplayClient.tsx
"use client";

import { MenuLayout } from "~/components/public/MenuLayout";
import { DishSheetProvider } from "~/components/public/DishSheet";
import {
  MenuFilterBar,
  NoMenuResults,
  useMenuFilters,
} from "~/components/public/MenuFilters";
import { menuDesignOf } from "~/lib/menu-design";

import type { PublicMenuData } from "~/components/public/menu-types";

interface MenuDisplayClientProps {
  menuData: PublicMenuData;
  // The stored design (restaurants.theme); old names are mapped.
  theme: string;
}

// Search and dietary filters sit above every design; the layout only ever
// sees the categories and items that match. Tapping a dish opens it in a
// bottom sheet.
export function MenuDisplayClient({ menuData, theme }: MenuDisplayClientProps) {
  const filters = useMenuFilters(menuData.categories);
  const shown = { ...menuData, categories: filters.filtered };

  return (
    <DishSheetProvider
      categories={menuData.categories}
      restaurantSlug={menuData.restaurant.slug}
    >
      <div className="space-y-3 sm:space-y-6">
        <MenuFilterBar filters={filters} />
        {shown.categories.length === 0 ? (
          <NoMenuResults onClear={filters.clear} />
        ) : (
          <MenuLayout menuData={shown} design={menuDesignOf(theme)} />
        )}
      </div>
    </DishSheetProvider>
  );
}
