// src/components/public/themes/ClassicMenuLayout.tsx
"use client";

import {
  CategoryNav,
  useCategoryScrollSpy,
} from "~/components/public/CategoryNav";
import { categorySectionId } from "~/lib/category-section";
import { MenuItemCard } from "~/components/public/MenuItemCard";
import type { PublicMenuData } from "~/components/public/menu-types";

interface ClassicMenuLayoutProps {
  menuData: PublicMenuData;
}

// The whole menu on one page, one section per category, with a sticky bar of
// categories that follows the scroll and jumps to a section when tapped.
export function ClassicMenuLayout({ menuData }: ClassicMenuLayoutProps) {
  const { activeSlug, scrollToCategory } = useCategoryScrollSpy(
    menuData.categories,
  );

  return (
    <div className="space-y-8">
      <CategoryNav
        variant="bar"
        categories={menuData.categories}
        activeSlug={activeSlug}
        onSelect={scrollToCategory}
      />

      {menuData.categories.map((category) => (
        <section
          key={category.id}
          id={categorySectionId(category.slug)}
          aria-labelledby={`${categorySectionId(category.slug)}-heading`}
          className="scroll-mt-24"
        >
          <h2
            id={`${categorySectionId(category.slug)}-heading`}
            className="text-foreground mb-4 text-2xl font-semibold sm:text-3xl"
          >
            {category.name}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {category.menuItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                restaurantSlug={menuData.restaurant.slug}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
