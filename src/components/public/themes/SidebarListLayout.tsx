// src/components/public/themes/SidebarListLayout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion"; // ADDED: Import motion

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

interface SidebarListLayoutProps {
  menuData: RestaurantMenuData;
}

export function SidebarListLayout({ menuData }: SidebarListLayoutProps) {
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
    <div className="flex flex-col space-y-8 md:flex-row md:space-y-0 md:space-x-8">
      {/* Category Navigation (Vertical Sidebar) */}
      <nav className="bg-card w-full flex-shrink-0 overflow-y-auto rounded-lg p-4 shadow-md md:w-64">
        <ul className="space-y-2">
          {menuData.categories.map(
            (
              category,
              index, // ADDED: index for staggered animation
            ) => (
              <motion.li // ADDED: motion.li wrapper
                key={category.id}
                initial={{ opacity: 0, x: -20 }} // Start slightly left and invisible
                animate={{ opacity: 1, x: 0 }} // Animate to visible and original position
                transition={{ delay: index * 0.1, duration: 0.5 }} // Staggered fade-in for categories
              >
                <button
                  onClick={() => setActiveCategoryId(category.id)}
                  className={cn(
                    "w-full rounded-md px-4 py-2 text-left text-base font-medium transition-colors duration-200",
                    activeCategoryId === category.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-foreground hover:bg-muted-foreground/10",
                  )}
                >
                  {category.name}
                </button>
              </motion.li> // ADDED: closing motion.li
            ),
          )}
        </ul>
      </nav>

      {/* Menu Items Display (Single Column List) */}
      <div className="flex-grow space-y-6">
        {activeCategory ? (
          <div className="grid gap-6">
            <h2 className="text-foreground text-3xl font-semibold">
              {activeCategory.name}
            </h2>

            {activeCategory.menuItems.length === 0 ? (
              <div className="grid gap-6 sm:grid-cols-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <MenuItemCardSkeleton key={i} />
                ))}
                <p className="text-muted-foreground col-span-full mt-4 text-center">
                  No items in this category yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeCategory.menuItems.map(
                  (
                    item,
                    itemIndex, // ADDED: itemIndex
                  ) => (
                    <motion.div // ADDED: motion.div wrapper for each menu item
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }} // Start slightly below and invisible
                      animate={{ opacity: 1, y: 0 }} // Animate to visible and original position
                      transition={{ delay: itemIndex * 0.05, duration: 0.3 }} // Staggered fade-in for items
                      whileHover={{ scale: 1.02 }} // Subtle scale on item card hover
                      className="block" // Ensure it remains a block for layout
                    >
                      <Link
                        href={`/${menuData.restaurant.slug}/item/${item.id}`}
                        passHref
                        className="group block" // Ensure Link behaves as a block
                      >
                        <div className="bg-card flex cursor-pointer items-center space-x-4 rounded-lg p-4 shadow-md transition-shadow duration-200 hover:shadow-lg">
                          {/* Image on Left */}
                          <div className="flex-shrink-0">
                            <Image
                              src={item.imageUrl ?? fallbackImageUrl}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="h-20 w-20 rounded-md object-cover transition-transform duration-220 group-hover:scale-105"
                            />
                          </div>
                          {/* Text Details on Right */}
                          <div className="flex-grow">
                            <h3 className="text-foreground group-hover:text-primary text-xl font-semibold transition-colors duration-200">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                                {item.description}
                              </p>
                            )}
                            {item.dietaryLabels &&
                              item.dietaryLabels.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {item.dietaryLabels.map(
                                    (label: DietaryLabel) => (
                                      <span
                                        key={label}
                                        className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-semibold"
                                      >
                                        {label.charAt(0).toUpperCase() +
                                          label.slice(1).replace(/-/g, " ")}
                                      </span>
                                    ),
                                  )}
                                </div>
                              )}
                            <p className="text-primary mt-2 text-lg font-bold">
                              {item.price} {menuData.restaurant.currency}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ),
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground py-10 text-center">
            Select a category from the sidebar to view menu items.
          </p>
        )}
      </div>
    </div>
  );
}
