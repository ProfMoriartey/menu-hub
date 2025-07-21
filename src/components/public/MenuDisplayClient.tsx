// src/components/public/MenuDisplayClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "~/lib/utils";

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

interface MenuDisplayClientProps {
  menuData: RestaurantMenuData;
}

export function MenuDisplayClient({ menuData }: MenuDisplayClientProps) {
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
      <nav className="scrollbar-hide sticky top-0 z-10 overflow-x-auto rounded-lg bg-white px-4 py-3 whitespace-nowrap shadow-md">
        <div className="flex space-x-4">
          {menuData.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                activeCategoryId === category.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
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
          <h2 className="mt-4 mb-2 text-3xl font-semibold text-gray-900">
            {activeCategory.name}
          </h2>
          {menuData.restaurant.description && (
            <p className="mb-4 text-lg leading-relaxed text-gray-700">
              {menuData.restaurant.description}
            </p>
          )}

          {activeCategory.menuItems.length === 0 ? (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map(
                (
                  _,
                  i, // FIX APPLIED HERE
                ) => (
                  <MenuItemCardSkeleton key={i} />
                ),
              )}
              <p className="col-span-full mt-4 text-center text-gray-500">
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
                  <div className="flex cursor-pointer flex-row items-start space-x-4 rounded-lg bg-white p-4 shadow-md transition-shadow duration-200 hover:shadow-lg">
                    <div className="order-first flex-grow text-left">
                      <h3 className="text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                          {item.description}
                        </p>
                      )}
                      {item.dietaryLabels && item.dietaryLabels.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.dietaryLabels.map((label: DietaryLabel) => (
                            <span
                              key={label}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800"
                            >
                              {label.charAt(0).toUpperCase() +
                                label.slice(1).replace(/-/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-lg font-bold text-blue-700">
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
        <p className="py-10 text-center text-gray-500">
          Select a category to view menu items.
        </p>
      )}
    </div>
  );
}
