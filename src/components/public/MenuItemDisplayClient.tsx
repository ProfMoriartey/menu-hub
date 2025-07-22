// src/components/public/MenuItemDisplayClient.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { MenuItem, Category, DietaryLabel } from "~/types/restaurant";

interface RestaurantForMenuItemDisplay {
  id: string;
  name: string;
  slug: string;
  currency: string;
  theme: string | null;
}

interface MenuItemDisplayClientProps {
  item: MenuItem & {
    restaurant: RestaurantForMenuItemDisplay;
    category: Category;
  };
  restaurantSlug: string;
  theme: string;
}

export function MenuItemDisplayClient({
  item,
  restaurantSlug,
  theme,
}: MenuItemDisplayClientProps) {
  const fallbackImageUrl = `https://placehold.co/800x600/E0E0E0/333333?text=No+Image`;

  const baseContainerClasses =
    "container mx-auto max-w-3xl rounded-lg p-6 shadow-lg sm:p-8";

  const baseTitleClasses = "mb-2 text-4xl font-bold";
  const basePriceClasses = "mb-4 text-2xl font-bold";
  const baseDescriptionClasses = "mb-4 text-lg";
  // --- FIX START ---
  // Change 'text-gray-700' to 'text-muted-foreground' here
  const baseIngredientsClasses = "mb-6 text-muted-foreground";
  // --- FIX END ---
  const baseLabelsContainerClasses = "mb-6 flex flex-wrap gap-2";
  const baseLabelClasses = "rounded-full px-3 py-1 text-sm font-semibold";
  const themeClass = `theme-${theme}`;

  return (
    <div className={cn("min-h-screen p-4 sm:p-8", themeClass)}>
      <div className={cn(baseContainerClasses, "bg-card text-foreground")}>
        <Link href={`/${restaurantSlug}`} passHref>
          <Button
            variant="outline"
            className="bg-background text-foreground border-border mb-6 flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Menu
          </Button>
        </Link>

        <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg shadow-md sm:h-96">
          <Image
            src={item.imageUrl ?? fallbackImageUrl}
            alt={item.name}
            width={800}
            height={600}
            className="h-full w-full object-cover"
          />
        </div>

        <h1 className={cn(baseTitleClasses, "text-foreground")}>{item.name}</h1>
        <p className={cn(basePriceClasses, "text-primary")}>
          {item.price} {item.restaurant.currency}
        </p>

        {item.description && (
          <p className={cn(baseDescriptionClasses, "text-muted-foreground")}>
            {item.description}
          </p>
        )}

        {item.ingredients && (
          <div className="mb-6">
            <h3 className={cn("mb-2 text-xl font-semibold", "text-foreground")}>
              Ingredients:
            </h3>
            {/* This now correctly applies text-muted-foreground */}
            <p className={cn(baseIngredientsClasses)}>{item.ingredients}</p>
          </div>
        )}

        {item.dietaryLabels && item.dietaryLabels.length > 0 && (
          <div className={cn(baseLabelsContainerClasses)}>
            <h3 className="sr-only">Dietary Labels:</h3>
            {item.dietaryLabels.map((label: DietaryLabel) => (
              <span
                key={label}
                className={cn(
                  baseLabelClasses,
                  "bg-muted text-muted-foreground",
                )}
              >
                {label.charAt(0).toUpperCase() +
                  label.slice(1).replace(/-/g, " ")}
              </span>
            ))}
          </div>
        )}

        <div className="border-border text-muted-foreground mt-6 border-t pt-4 text-sm">
          <p>Category: {item.category.name}</p>
          <p>Restaurant: {item.restaurant.name}</p>
        </div>
      </div>
    </div>
  );
}
