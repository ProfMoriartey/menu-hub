"use client"; // This is a Client Component

import { useState } from "react";
import Link from "next/link";
// REMOVED: import { ResponsiveImage } from "~/components/shared/ResponsiveImage"; // No longer needed
import Image from "next/image"; // Import Next.js Image component
import { cn } from "~/lib/utils"; // Shadcn utility for class merging (if you have it, otherwise use 'clsx')

// Import types from your shared types file
// Import types from your shared types file
import type { MenuItem, Category, DietaryLabel } from "~/types/restaurant"; // Import MenuItem, Category, and DietaryLabel
// Import MenuItem, Category, and DietaryLabel

// Redefine RestaurantMenuData using the imported types
interface RestaurantMenuData {
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
  categories: (Category & { menuItems: MenuItem[] })[]; // Category with its nested menuItems
}

interface MenuDisplayClientProps {
  menuData: RestaurantMenuData;
}

export function MenuDisplayClient({ menuData }: MenuDisplayClientProps) {
  // State to manage the currently active category ID
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    () => {
      if (menuData.categories.length > 0 && menuData.categories[0]) {
        return menuData.categories[0].id;
      }
      return null;
    },
  );

  // Find the active category object
  const activeCategory = menuData.categories.find(
    (cat) => cat.id === activeCategoryId,
  );

  // Fallback image URL for when a menu item image is not available
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
          {activeCategory.menuItems.length === 0 ? (
            <p className="text-center text-gray-500">
              No items in this category yet.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {activeCategory.menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/${menuData.restaurant.slug}/item/${item.id}`}
                  passHref
                  className="group block"
                >
                  <div className="flex cursor-pointer flex-col items-center space-y-4 rounded-lg bg-white p-4 shadow-md transition-shadow duration-200 hover:shadow-lg sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4">
                    {/* Image on Right (for larger screens) / Top (for smaller screens) */}
                    <div className="order-2 flex-shrink-0 sm:order-2">
                      <Image // Use Next.js Image component
                        src={item.imageUrl ?? fallbackImageUrl} // Use nullish coalescing
                        alt={item.name}
                        width={120}
                        height={120}
                        className="h-24 w-24 rounded-md object-cover transition-transform duration-220 group-hover:scale-105 sm:h-32 sm:w-32"
                      />
                    </div>
                    {/* Name, Description, Price on Left */}
                    <div className="order-1 flex-grow text-center sm:order-1 sm:text-left">
                      <h3 className="text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600">
                        {item.name}
                      </h3>
                      {item.description && ( // Conditionally render description
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-2 text-lg font-bold text-blue-700">
                        ${item.price} {/* Price is now a string, no toFixed */}
                      </p>
                      {/* NEW: Display Dietary Labels */}
                      {item.dietaryLabels && item.dietaryLabels.length > 0 && (
                        <div className="mt-2 flex flex-wrap justify-center gap-1 sm:justify-start">
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
