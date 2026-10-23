// src/components/public/MenuDisplayClient.tsx
"use client";

import { ClassicMenuLayout } from "~/components/public/themes/ClassicMenuLayout";
import { SidebarListLayout } from "~/components/public/themes/SidebarListLayout";
import { AccordionCardLayout } from "~/components/public/themes/AccordionCardLayout";
import { CategoryCardsImageDominantLayout } from "~/components/public/themes/CategoryCardsImageDominantLayout";
import {
  MenuFilterBar,
  NoMenuResults,
  useMenuFilters,
} from "~/components/public/MenuFilters";

import type { PublicMenuData } from "~/components/public/menu-types";

interface MenuDisplayClientProps {
  menuData: PublicMenuData;
  theme: string;
}

// Search and dietary filters sit above every theme; the theme only ever
// sees the categories and items that match.
export function MenuDisplayClient({ menuData, theme }: MenuDisplayClientProps) {
  const filters = useMenuFilters(menuData.categories);
  const shown = { ...menuData, categories: filters.filtered };

  const layout = (() => {
    switch (theme) {
      case "sidebar-list":
        return <SidebarListLayout menuData={shown} />;
      case "accordion-card":
        return (
          <AccordionCardLayout
            menuData={shown}
            expandAll={filters.isFiltering}
          />
        );
      case "category-cards-image-dominant":
        return <CategoryCardsImageDominantLayout menuData={shown} />;
      case "classic":
      default:
        return <ClassicMenuLayout menuData={shown} />;
    }
  })();

  return (
    <div className="space-y-6">
      <MenuFilterBar filters={filters} />
      {shown.categories.length === 0 ? (
        <NoMenuResults onClear={filters.clear} />
      ) : (
        layout
      )}
    </div>
  );
}
