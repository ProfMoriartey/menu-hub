// src/components/public/themes/CategoryCardsImageDominantLayout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { ChevronLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";

import type { MenuItem, Category, DietaryLabel } from "~/types/restaurant";

interface RestaurantMenuData {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    description: string | null;
  };
  // Ensure menuItems is included in the categories type
  categories: (Category & { menuItems: MenuItem[] })[];
}

interface CategoryCardsImageDominantLayoutProps {
  menuData: RestaurantMenuData;
}

export function CategoryCardsImageDominantLayout({
  menuData,
}: CategoryCardsImageDominantLayoutProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const fallbackImageUrl = `https://placehold.co/400x300/E0E0E0/333333?text=Menu+Item`; // Changed fallback text

  if (selectedCategory) {
    const itemsToDisplay = selectedCategory.menuItems ?? [];

    // Display Menu Items for the selected category (No visual changes needed here, only in the main list)
    return (
      <div className="space-y-6">
        {/* Back Button Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="outline"
            className="bg-background text-foreground border-border mb-6 flex items-center"
            onClick={() => setSelectedCategory(null)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
          </Button>
        </motion.div>

        <h2 className="text-foreground mb-4 text-3xl font-semibold">
          {selectedCategory.name}
        </h2>

        {itemsToDisplay.length === 0 ? (
          <div className="text-muted-foreground py-10 text-center">
            <p>No items in this category yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {itemsToDisplay.map((item, itemIndex) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: itemIndex * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="block h-full"
              >
                <Link
                  href={`/${menuData.restaurant.slug}/item/${item.id}`}
                  passHref
                  className="group block h-full"
                >
                  <div className="bg-card border-border flex flex-col overflow-hidden rounded-lg border shadow-md transition-shadow duration-200 hover:shadow-lg">
                    <div className="relative h-64 w-full overflow-hidden sm:h-80">
                      <Image
                        src={item.imageUrl ?? fallbackImageUrl}
                        alt={item.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="transition-transform duration-220 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-grow flex-col justify-between p-4">
                      <div>
                        <h3 className="text-foreground group-hover:text-primary mb-1 text-xl font-semibold transition-colors duration-200">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                            {item.description}
                          </p>
                        )}
                        {item.dietaryLabels &&
                          item.dietaryLabels.length > 0 && (
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
                      </div>
                      <p className="text-primary mt-4 text-lg font-bold">
                        {item.price} {menuData.restaurant.currency}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Display Category Cards (Initial View)
  return (
    <div className="space-y-6">
      {menuData.categories.length === 0 ? (
        <div className="text-muted-foreground py-10 text-center">
          <p>No categories available for this restaurant yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menuData.categories.map((category, categoryIndex) => {
            // 🛑 1. FIND THE FIRST IMAGE URL
            const firstImageUrl = category.menuItems?.find(
              (item) => item.imageUrl,
            )?.imageUrl;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
                className="block"
              >
                <div
                  onClick={() => setSelectedCategory(category)}
                  className="group bg-card border-border flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border text-center shadow-md transition-shadow duration-200 hover:shadow-lg"
                >
                  {/* 🛑 2. IMAGE SECTION (Image Dominant) */}
                  <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={firstImageUrl ?? fallbackImageUrl}
                      alt={`${category.name} preview`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Overlay for contrast */}
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20"></div>
                  </div>

                  {/* 🛑 3. TEXT SECTION (Below Image) */}
                  <div className="flex flex-grow flex-col justify-between p-4">
                    <h3 className="text-foreground group-hover:text-primary mb-2 text-2xl font-semibold">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {category.menuItems?.length ?? 0} items
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
