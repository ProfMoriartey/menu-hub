// src/components/themes/CategoryCardsImageDominantThemeExample.tsx
"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import Image from "next/image";
import { useTranslations } from "next-intl"; // ADDED: Import useTranslations

// Mock data now uses translation keys for names and includes image paths
const mockCategories = [
  {
    id: "appetizers",
    key: "appetizers",
    itemKey: "frenchFries", // Key to look up in tItems
  },
  {
    id: "main-courses",
    key: "mainCourses",
    itemKey: "deliciousBowl",
  },
  {
    id: "desserts",
    key: "desserts",
    itemKey: "lemonCheesecake",
  },
  {
    id: "drinks",
    key: "drinks",
    itemKey: "cocaCola",
  },
];

// Actual item data with image paths - these are NOT translated
const allMockItems = {
  frenchFries: { image: "/french-fries.jpg" },
  deliciousBowl: { image: "/bowl.png" },
  lemonCheesecake: { image: "/Limon-cheesecake.jpg" },
  cocaCola: { image: "/cocacola.jpg" },
};

export function CategoryCardsImageDominantThemeExample() {
  const t = useTranslations("categoryCardsImageDominantThemeExample"); // General translations
  const tCategories = useTranslations(
    "categoryCardsImageDominantThemeExample.categories",
  ); // Category name translations
  const tItems = useTranslations(
    "categoryCardsImageDominantThemeExample.items",
  ); // Item name translations

  // Safely get the initial category to avoid 'undefined' access
  const initialCategory =
    mockCategories.length > 0 ? mockCategories[0] : undefined;

  // State to hold the currently active item's translated name and image path
  const [activeCategoryItem, setActiveCategoryItem] = useState<{
    name: string;
    image: string;
  } | null>(
    initialCategory // Use the safely retrieved initialCategory
      ? {
          name: tItems(`${initialCategory.itemKey}.name`),
          image:
            allMockItems[initialCategory.itemKey as keyof typeof allMockItems]
              .image,
        }
      : null,
  );

  return (
    <div className="mb-8">
      <h3 className="text-foreground mb-2 text-xl font-semibold">
        {t("exampleTitle")}
      </h3>
      <div className="border-border bg-background rounded-lg border p-4">
        {/* Category Cards */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          {mockCategories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                setActiveCategoryItem({
                  name: tItems(`${category.itemKey}.name`),
                  image:
                    allMockItems[category.itemKey as keyof typeof allMockItems]
                      .image,
                })
              }
              className={cn(
                "rounded-md p-3 text-center transition-colors",
                activeCategoryItem?.name === tItems(`${category.itemKey}.name`) // Compare translated names
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {tCategories(category.key)}
            </button>
          ))}
        </div>

        {/* Dominant Image Display */}
        {activeCategoryItem ? (
          <div className="border-border bg-card relative h-48 w-full overflow-hidden rounded-md border">
            <Image
              src={activeCategoryItem.image}
              alt={activeCategoryItem.name}
              fill
              className="object-cover"
            />
            <span className="absolute bottom-2 left-2 text-xl font-bold text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              {activeCategoryItem.name}
            </span>
          </div>
        ) : (
          <p className="text-muted-foreground text-center">
            {t("selectCategoryMessage")}
          </p>
        )}
      </div>
    </div>
  );
}
