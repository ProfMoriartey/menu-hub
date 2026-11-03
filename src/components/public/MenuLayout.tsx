// src/components/public/MenuLayout.tsx
"use client";

import {
  CategoryNav,
  useCategoryScrollSpy,
} from "~/components/public/CategoryNav";
import {
  ClassicDish,
  CompactDish,
  PhotoDish,
} from "~/components/public/MenuItemCard";
import { categorySectionId } from "~/lib/category-section";
import { cn } from "~/lib/utils";

import type { PublicMenuData } from "~/components/public/menu-types";
import type { MenuDesign } from "~/lib/menu-design";

// How each design lays out a category's dishes; everything else is shared.
const DISHES: Record<MenuDesign, { Dish: typeof ClassicDish; list: string }> = {
  classic: {
    Dish: ClassicDish,
    list: "grid gap-3 md:grid-cols-2 lg:grid-cols-3",
  },
  "photo-grid": {
    Dish: PhotoDish,
    list: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
  },
  compact: {
    Dish: CompactDish,
    list: "bg-card border-border divide-border divide-y overflow-hidden rounded-xl border shadow-sm",
  },
};

// Dishes at the top of the first category, on screen when the menu opens on
// a phone. Their photos are fetched first; the rest load as guests scroll.
const PRIORITY_PHOTOS = 4;

// The first dishes on screen rise in one after another; the rest at once.
const ENTER_STEP_MS = 60;
const ENTER_STAGGERED = 6;
const enterDelay = (categoryIndex: number, itemIndex: number) =>
  categoryIndex === 0 && itemIndex > 0
    ? { animationDelay: `${Math.min(itemIndex, ENTER_STAGGERED) * ENTER_STEP_MS}ms` }
    : undefined;

/**
 * The whole menu on one page, a section per category, with a sticky bar of
 * categories that follows the scroll and jumps to a section when tapped.
 * The same for every design, made for phones first.
 */
export function MenuLayout({
  menuData,
  design,
}: {
  menuData: PublicMenuData;
  design: MenuDesign;
}) {
  const { activeSlug, scrollToCategory, endRef } = useCategoryScrollSpy(
    menuData.categories,
  );
  const { Dish, list } = DISHES[design];

  return (
    <div className="space-y-6">
      <CategoryNav
        variant="bar"
        categories={menuData.categories}
        activeSlug={activeSlug}
        onSelect={scrollToCategory}
      />

      {menuData.categories.map((category, categoryIndex) => (
        <section
          key={category.id}
          id={categorySectionId(category.slug)}
          aria-labelledby={`${categorySectionId(category.slug)}-heading`}
          className="scroll-mt-20"
        >
          <h2
            id={`${categorySectionId(category.slug)}-heading`}
            className="text-foreground mb-3 text-xl font-semibold sm:text-2xl"
          >
            <span lang={category.lang} dir="auto">
              {category.name}
            </span>
          </h2>
          {/* Compact rows are plain list items; cards are a grid. */}
          {/* Each dish rises in on load and slides as it scrolls in and
              out of view (globals.css: .dish-enter, .dish-reveal). */}
          {design === "compact" ? (
            <ul className={list}>
              {category.menuItems.map((item, itemIndex) => (
                <li key={item.id} className="dish-reveal">
                  <div className="dish-enter" style={enterDelay(categoryIndex, itemIndex)}>
                    <Dish item={item} restaurantSlug={menuData.restaurant.slug} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={cn(list)}>
              {category.menuItems.map((item, itemIndex) => (
                <div key={item.id} className="dish-reveal">
                  <div className="dish-enter h-full" style={enterDelay(categoryIndex, itemIndex)}>
                    <Dish
                      item={item}
                      restaurantSlug={menuData.restaurant.slug}
                      priority={categoryIndex === 0 && itemIndex < PRIORITY_PHOTOS}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* The end of the menu, for the category bar (useCategoryScrollSpy). */}
          {categoryIndex === menuData.categories.length - 1 && (
            <div ref={endRef} aria-hidden />
          )}
        </section>
      ))}
    </div>
  );
}
