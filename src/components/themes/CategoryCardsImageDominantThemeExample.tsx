// src/components/themes/CategoryCardsImageDominantThemeExample.tsx
"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import Image from "next/image";

// Mock data for categories and their representative items
const mockCategories = [
  {
    id: "appetizers",
    name: "Appetizers",
    item: {
      name: "French Fries",
      image: "/french-fries.jpg",
    },
  },
  {
    id: "main-courses",
    name: "Main Courses",
    item: {
      name: "Delicious Bowl",
      image: "/bowl.png",
    },
  },
  {
    id: "desserts",
    name: "Desserts",
    item: {
      name: "Lemon Cheesecake",
      image: "/Limon-cheesecake.jpg",
    },
  },
  {
    id: "drinks",
    name: "Drinks",
    item: {
      name: "Coca Cola",
      image: "/cocacola.jpg",
    },
  },
];

export function CategoryCardsImageDominantThemeExample() {
  const [activeCategoryItem, setActiveCategoryItem] = useState(
    mockCategories[0]?.item ?? null, // Changed from: mockCategories.length > 0 ? mockCategories[0].item : null,
  );

  return (
    <div className="mb-8">
      <h3 className="text-foreground mb-2 text-xl font-semibold">Example:</h3>
      <div className="border-border bg-background rounded-lg border p-4">
        {/* Category Cards */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          {mockCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategoryItem(category.item)}
              className={cn(
                "rounded-md p-3 text-center transition-colors",
                activeCategoryItem?.name === category.item.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {category.name}
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
            Select a category to see an example item.
          </p>
        )}
      </div>
    </div>
  );
}
