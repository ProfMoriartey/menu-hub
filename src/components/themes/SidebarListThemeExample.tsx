// src/components/themes/SidebarListThemeExample.tsx
"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { useTranslations } from "next-intl"; // ADDED: Import useTranslations

// Mock data now uses translation keys for names
const mockCategories = [
  { id: "appetizers", key: "appetizers" },
  { id: "main-courses", key: "mainCourses" },
  { id: "desserts", key: "desserts" },
  { id: "drinks", key: "drinks" },
];

const mockItems = {
  appetizers: [
    { id: "a1", key: "a1" },
    { id: "a2", key: "a2" },
  ],
  "main-courses": [
    { id: "m1", key: "m1" },
    { id: "m2", key: "m2" },
    { id: "m3", key: "m3" },
  ],
  desserts: [{ id: "d1", key: "d1" }],
  drinks: [
    { id: "dr1", key: "dr1" },
    { id: "dr2", key: "dr2" },
  ],
};

export function SidebarListThemeExample() {
  const t = useTranslations("sidebarListThemeExample"); // Translations for general strings
  const tCategories = useTranslations("sidebarListThemeExample.categories"); // Translations for category names
  const tItems = useTranslations("sidebarListThemeExample.items"); // Translations for item names

  const [activeCategory, setActiveCategory] = useState(
    mockCategories[0]?.id ?? "",
  );

  return (
    <div className="mb-8">
      <h3 className="text-foreground mb-2 text-xl font-semibold">
        {t("exampleTitle")}
      </h3>
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
              {tCategories(category.key)}
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
                {tItems(item.key)}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center">
              {t("noItemsMessage")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
