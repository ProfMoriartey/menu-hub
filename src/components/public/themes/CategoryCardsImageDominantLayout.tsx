// src/components/public/themes/CategoryCardsImageDominantLayout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "~/lib/utils";
import type { MenuItem, Category, DietaryLabel } from "~/types/restaurant";
import { ChevronLeft } from "lucide-react"; // Needed for back button
import { Button } from "~/components/ui/button"; // Needed for back button

interface RestaurantMenuData {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    description: string | null;
  };
  categories: (Category & { menuItems: MenuItem[] })[]; // This type is correct here
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

  const fallbackImageUrl = `https://placehold.co/400x300/E0E0E0/333333?text=No+Image`; // Larger fallback for dominant images

  if (selectedCategory) {
    // --- Start of Fix ---
    // Ensure menuItems is not undefined before accessing it
    const itemsToDisplay = selectedCategory.menuItems || [];
    // --- End of Fix ---

    // Display Menu Items for the selected category
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          className="bg-background text-foreground border-border mb-6 flex items-center"
          onClick={() => setSelectedCategory(null)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Categories
        </Button>

        <h2 className="text-foreground mb-4 text-3xl font-semibold">
          {selectedCategory.name}
        </h2>

        {/* Use itemsToDisplay.length */}
        {itemsToDisplay.length === 0 ? (
          <div className="text-muted-foreground py-10 text-center">
            <p>No items in this category yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {/* Use itemsToDisplay.map */}
            {itemsToDisplay.map((item) => (
              <Link
                key={item.id}
                href={`/${menuData.restaurant.slug}/item/${item.id}`}
                passHref
                className="group block"
              >
                <div className="bg-card border-border flex flex-col overflow-hidden rounded-lg border shadow-md transition-shadow duration-200 hover:shadow-lg">
                  {/* Image Dominant */}
                  <div className="relative h-64 w-full overflow-hidden sm:h-80">
                    <Image
                      src={item.imageUrl ?? fallbackImageUrl}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
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
                    </div>
                    <p className="text-primary mt-4 text-lg font-bold">
                      {item.price} {menuData.restaurant.currency}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Display Category Cards
  return (
    <div className="space-y-6">
      <h2 className="text-foreground mb-4 text-3xl font-semibold">
        Explore Categories
      </h2>
      {menuData.categories.length === 0 ? (
        <div className="text-muted-foreground py-10 text-center">
          <p>No categories available for this restaurant yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menuData.categories.map((category) => (
            <div
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className="group bg-card border-border flex cursor-pointer flex-col items-center rounded-lg border p-6 text-center shadow-md transition-shadow duration-200 hover:shadow-lg"
            >
              <h3 className="text-foreground group-hover:text-primary mb-2 text-2xl font-semibold">
                {category.name}
              </h3>
              <p className="text-muted-foreground">
                {/* Add a nullish coalescing operator here too */}
                {category.menuItems?.length || 0} items
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
