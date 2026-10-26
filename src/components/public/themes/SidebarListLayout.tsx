// src/components/public/themes/SidebarListLayout.tsx
"use client";

import {
  CategoryNav,
  useCategoryScrollSpy,
} from "~/components/public/CategoryNav";
import { categorySectionId } from "~/lib/category-section";
import { MenuItemCard } from "~/components/public/MenuItemCard";
import type { PublicMenuData } from "~/components/public/menu-types";

interface SidebarListLayoutProps {
  menuData: PublicMenuData;
}

// The whole menu as one list, with the categories in a sticky sidebar on wide
// screens. Phones have no room for a sidebar, so they get the category bar.
export function SidebarListLayout({ menuData }: SidebarListLayoutProps) {
  const { activeSlug, scrollToCategory } = useCategoryScrollSpy(
    menuData.categories,
  );
  const navProps = {
    categories: menuData.categories,
    activeSlug,
    onSelect: scrollToCategory,
  };

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <CategoryNav variant="bar" className="md:hidden" {...navProps} />
      <CategoryNav
        variant="sidebar"
        className="hidden w-64 shrink-0 self-start md:block"
        {...navProps}
      />

      <div className="min-w-0 flex-grow space-y-8">
        {menuData.categories.map((category) => (
          <section
            key={category.id}
            id={categorySectionId(category.slug)}
            aria-labelledby={`${categorySectionId(category.slug)}-heading`}
            className="scroll-mt-24 md:scroll-mt-4"
          >
            <h2
              id={`${categorySectionId(category.slug)}-heading`}
              className="text-foreground mb-4 text-2xl font-semibold sm:text-3xl"
            >
              {category.name}
            </h2>
            <div className="grid gap-4">
              {category.menuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  restaurantSlug={menuData.restaurant.slug}
                  imagePosition="start"
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
