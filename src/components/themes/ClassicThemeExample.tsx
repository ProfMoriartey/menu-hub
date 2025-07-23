// src/components/themes/ClassicThemeExample.tsx
"use client";

import { useState } from "react";
import { cn } from "~/lib/utils"; // Assuming cn is needed for styling

// Mock data for categories and items
const mockCategories = [
  { id: "appetizers", name: "Appetizers" },
  { id: "main-courses", name: "Main Courses" },
  { id: "desserts", name: "Desserts" },
  { id: "drinks", name: "Drinks" },
];

const mockItems = {
  appetizers: [
    { id: "a1", name: "Spring Rolls" },
    { id: "a2", name: "Garlic Bread" },
    { id: "a3", name: "Tomato Bruschetta" },
  ],
  "main-courses": [
    { id: "m1", name: "Grilled Salmon" },
    { id: "m2", name: "Steak Frites" },
    { id: "m3", name: "Veggie Burger" },
    { id: "m4", name: "Chicken Alfredo" },
  ],
  desserts: [
    { id: "d1", name: "Cheesecake" },
    { id: "d2", name: "Chocolate Lava Cake" },
  ],
  drinks: [
    { id: "dr1", name: "Iced Tea" },
    { id: "dr2", name: "Lemonade" },
    { id: "dr3", name: "Coffee" },
    { id: "dr4", name: "Orange Juice" },
  ],
};

export function ClassicThemeExample() {
  const [activeCategory, setActiveCategory] = useState(
    mockCategories[0]?.id ?? "",
  );

  return (
    <div className="mb-8">
      <h3 className="text-foreground mb-2 text-xl font-semibold">Example:</h3>
      <div className="border-border bg-background rounded-lg border p-4">
        <div className="mb-4 flex space-x-2 overflow-x-auto">
          {mockCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition-colors",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {mockItems[activeCategory as keyof typeof mockItems]?.map((item) => (
            <div
              key={item.id}
              className="border-border bg-card rounded-md border p-2"
            >
              {item.name}
            </div>
          ))}
          {mockItems[activeCategory as keyof typeof mockItems]?.length ===
            0 && (
            <p className="text-muted-foreground col-span-2 text-center">
              No items in this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
