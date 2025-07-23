// src/components/themes/SidebarListThemeExample.tsx
"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";

// Mock data for categories and items for the sidebar list theme
const mockCategories = [
  { id: "appetizers", name: "Appetizers" },
  { id: "main-courses", name: "Main Courses" },
  { id: "desserts", name: "Desserts" },
  { id: "drinks", name: "Drinks" },
];

const mockItems = {
  appetizers: [
    { id: "a1", name: "Soup of the Day" },
    { id: "a2", name: "House Salad" },
  ],
  "main-courses": [
    { id: "m1", name: "Pasta Primavera" },
    { id: "m2", name: "Grilled Chicken" },
    { id: "m3", name: "Vegetable Curry" },
  ],
  desserts: [{ id: "d1", name: "Chocolate Cake" }],
  drinks: [
    { id: "dr1", name: "Fresh Orange Juice" },
    { id: "dr2", name: "Sparkling Water" },
  ],
};

export function SidebarListThemeExample() {
  const [activeCategory, setActiveCategory] = useState(
    mockCategories[0]?.id ?? "",
  );

  return (
    <div className="mb-8">
      <h3 className="text-foreground mb-2 text-xl font-semibold">Example:</h3>
      <div className="border-border bg-background flex rounded-lg border p-4">
        {/* Sidebar for categories */}
        <div className="border-border w-1/3 border-r pr-4">
          {mockCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "mb-2 block w-full rounded-md px-3 py-1 text-left transition-colors",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
        {/* Main content area for items */}
        <div className="w-2/3 pl-4">
          {mockItems[activeCategory as keyof typeof mockItems]?.length > 0 ? (
            mockItems[activeCategory as keyof typeof mockItems]?.map((item) => (
              <div
                key={item.id}
                className="border-border bg-card mb-2 rounded-md border p-2"
              >
                {item.name}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center">
              No items in this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
