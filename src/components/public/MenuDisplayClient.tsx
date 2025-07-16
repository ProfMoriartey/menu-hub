// src/components/public/MenuDisplayClient.tsx
"use client"; // This is a Client Component

import { useState } from "react";
import Link from "next/link";
import { ResponsiveImage } from "~/components/shared/ResponsiveImage"; // Re-use our image component
import { cn } from "~/lib/utils"; // Shadcn utility for class merging (if you have it, otherwise use 'clsx')

// Define types for the data structure passed from the Server Component
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  ingredients: string;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  imageUrl: string;
}

interface CategoryWithItems {
  id: string;
  name: string;
  order: number;
  menuItems: MenuItem[];
}

interface RestaurantMenuData {
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
  categories: CategoryWithItems[];
}

interface MenuDisplayClientProps {
  menuData: RestaurantMenuData;
}

export function MenuDisplayClient({ menuData }: MenuDisplayClientProps) {
  // State to manage the currently active category ID
  // Initialize with the first category's ID if available, otherwise null
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    () => {
      // Use a function for initial state to ensure it's only computed once
      // Add a check that menuData.categories[0] actually exists before accessing .id
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
              {" "}
              {/* Responsive grid */}
              {activeCategory.menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/${menuData.restaurant.slug}/item/${item.id}`} // Link to item detail page
                  passHref
                  className="group block" // Use group for hover effects on children
                >
                  <div className="flex cursor-pointer flex-col items-center space-y-4 rounded-lg bg-white p-4 shadow-md transition-shadow duration-200 hover:shadow-lg sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4">
                    {/* Image on Right (for larger screens) / Top (for smaller screens) */}
                    <div className="order-2 flex-shrink-0 sm:order-2">
                      <ResponsiveImage
                        src={item.imageUrl}
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
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {item.description}
                      </p>
                      <p className="mt-2 text-lg font-bold text-blue-700">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="mt-2 flex justify-center space-x-2 sm:justify-start">
                        {item.isVegetarian && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                            Veg
                          </span>
                        )}
                        {item.isGlutenFree && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                            GF
                          </span>
                        )}
                      </div>
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
