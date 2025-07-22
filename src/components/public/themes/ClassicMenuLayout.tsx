// src/components/public/themes/ClassicMenuLayout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "~/lib/utils"; // Assuming this path is correct

import type { MenuItem, Category, DietaryLabel } from "~/types/restaurant";
import { MenuItemCardSkeleton } from "~/components/shared/MenuItemCardSkeleton";

interface RestaurantMenuData {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    description: string | null;
  };
  categories: (Category & { menuItems: MenuItem[] })[];
}

interface ClassicMenuLayoutProps {
  menuData: RestaurantMenuData;
}

export function ClassicMenuLayout({ menuData }: ClassicMenuLayoutProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    () => {
      if (menuData.categories.length > 0 && menuData.categories[0]) {
        return menuData.categories[0].id;
      }
      return null;
    },
  );

  const activeCategory = menuData.categories.find(
    (cat) => cat.id === activeCategoryId,
  );

  const fallbackImageUrl = `https://placehold.co/120x120/E0E0E0/333333?text=No+Image`;

  return (
    <div className="space-y-8">
      {/* Category Navigation (Top Bar) */}
      <nav className="scrollbar-hide bg-card sticky top-0 z-10 overflow-x-auto rounded-lg px-4 py-3 whitespace-nowrap shadow-md">
        <div className="flex space-x-4">
          {menuData.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                activeCategoryId === category.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Menu Items Display */}
      {activeCategory ? (
        <div className="grid gap-6">
          <h2 className="text-foreground mt-4 mb-2 text-3xl font-semibold">
            {activeCategory.name}
          </h2>
          {activeCategory.menuItems.length === 0 ? (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <MenuItemCardSkeleton key={i} />
              ))}
              <p className="text-muted-foreground col-span-full mt-4 text-center">
                No items in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {activeCategory.menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/${menuData.restaurant.slug}/item/${item.id}`}
                  passHref
                  className="group block"
                >
                  <div className="bg-card flex cursor-pointer flex-row items-start space-x-4 rounded-lg p-4 shadow-md transition-shadow duration-200 hover:shadow-lg">
                    <div className="order-first flex-grow text-left">
                      <h3 className="text-foreground group-hover:text-primary text-xl font-semibold transition-colors duration-200">
                        {item.name}
                      </h3>
                      {item.description && (
                        // FIXED: Corrected comment syntax within JSX
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                          {item.description}
                        </p>
                      )}
                      {item.dietaryLabels && item.dietaryLabels.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.dietaryLabels.map((label: DietaryLabel) => (
                            <span
                              key={label}
                              className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-semibold"
                            >
                              {label.charAt(0).toUpperCase() +
                                label.slice(1).replace(/-/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-primary mt-2 text-lg font-bold">
                        {item.price} {menuData.restaurant.currency}
                      </p>
                    </div>

                    <div className="order-last flex-shrink-0">
                      <Image
                        src={item.imageUrl ?? fallbackImageUrl}
                        alt={item.name}
                        width={120}
                        height={120}
                        className="h-24 w-24 rounded-md object-cover transition-transform duration-220 group-hover:scale-105 sm:h-32 sm:w-32"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground py-10 text-center">
          Select a category to view menu items.
        </p>
      )}
    </div>
  );
}
