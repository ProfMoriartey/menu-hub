// src/components/themes/ClassicThemeExample.tsx
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
    { id: "a3", key: "a3" },
  ],
  "main-courses": [
    { id: "m1", key: "m1" },
    { id: "m2", key: "m2" },
    { id: "m3", key: "m3" },
    { id: "m4", key: "m4" },
  ],
  desserts: [
    { id: "d1", key: "d1" },
    { id: "d2", key: "d2" },
  ],
  drinks: [
    { id: "dr1", key: "dr1" },
    { id: "dr2", key: "dr2" },
    { id: "dr3", key: "dr3" },
    { id: "dr4", key: "dr4" },
  ],
};

export function ClassicThemeExample() {
  const t = useTranslations("classicThemeExample"); // Translations for general strings
  const tCategories = useTranslations("classicThemeExample.categories"); // Translations for category names
  const tItems = useTranslations("classicThemeExample.items"); // Translations for item names

  const [activeCategory, setActiveCategory] = useState(
    mockCategories[0]?.id ?? "",
  );

  return (
    <div className="mb-8">
      <h3 className="text-foreground mb-2 text-xl font-semibold">
        {t("exampleTitle")}
      </h3>
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
              {tCategories(category.key)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {mockItems[activeCategory as keyof typeof mockItems]?.map((item) => (
            <div
              key={item.id}
              className="border-border bg-card rounded-md border p-2"
            >
              {tItems(item.key)}
            </div>
          ))}
          {mockItems[activeCategory as keyof typeof mockItems]?.length ===
            0 && (
            <p className="text-muted-foreground col-span-2 text-center">
              {t("noItemsMessage")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
