// src/components/themes/AccordionCardThemeExample.tsx
"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl"; // ADDED: Import useTranslations

// Mock data now uses translation keys for names and descriptions
const mockCategories = [
  { id: "coffee", key: "coffee" },
  { id: "pastries", key: "pastries" },
  { id: "sandwiches", key: "sandwiches" },
];

const mockItems = {
  coffee: [
    { id: "c1", key: "c1" },
    { id: "c2", key: "c2" },
    { id: "c3", key: "c3" },
  ],
  pastries: [
    { id: "p1", key: "p1" },
    { id: "p2", key: "p2" },
  ],
  sandwiches: [
    { id: "s1", key: "s1" },
    { id: "s2", key: "s2" },
  ],
};

export function AccordionCardThemeExample() {
  const t = useTranslations("accordionCardThemeExample"); // Translations for general strings
  const tCategories = useTranslations("accordionCardThemeExample.categories"); // Translations for category names
  const tItems = useTranslations("accordionCardThemeExample.items"); // Translations for item names and descriptions

  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    mockCategories[0]?.id ?? null,
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const itemGridVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { staggerChildren: 0.05 },
    },
    exit: { opacity: 0, height: 0 },
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="mb-8">
      <h3 className="text-foreground mb-2 text-xl font-semibold">
        {t("exampleTitle")}
      </h3>
      <div className="border-border bg-background rounded-lg border p-4">
        {mockCategories.map((category) => (
          <div key={category.id} className="mb-2 last:mb-0">
            <button
              onClick={() => toggleCategory(category.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors",
                expandedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              <span>{tCategories(category.key)}</span>
              <span>{expandedCategory === category.id ? "▲" : "▼"}</span>
            </button>
            <AnimatePresence>
              {expandedCategory === category.id && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={itemGridVariants}
                  className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  {mockItems[category.id as keyof typeof mockItems]?.length >
                  0 ? (
                    mockItems[category.id as keyof typeof mockItems]?.map(
                      (item) => (
                        <motion.div
                          key={item.id}
                          variants={cardItemVariants}
                          className="border-border bg-card rounded-md border p-3"
                        >
                          <h4 className="text-foreground font-semibold">
                            {tItems(`${item.key}.name`)}
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            {tItems(`${item.key}.desc`)}
                          </p>
                        </motion.div>
                      ),
                    )
                  ) : (
                    <p className="text-muted-foreground col-span-full text-center">
                      {t("noItemsMessage")}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
