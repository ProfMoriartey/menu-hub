// src/components/themes/AccordionCardThemeExample.tsx
"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence

// Mock data for categories and items for the accordion card theme
const mockCategories = [
  { id: "coffee", name: "Coffee Drinks" },
  { id: "pastries", name: "Fresh Pastries" },
  { id: "sandwiches", name: "Light Bites" },
];

const mockItems = {
  coffee: [
    { id: "c1", name: "Espresso", desc: "Strong, rich shot." },
    { id: "c2", name: "Latte", desc: "Espresso with steamed milk." },
    {
      id: "c3",
      name: "Cappuccino",
      desc: "Equal parts espresso, steamed milk, foam.",
    },
  ],
  pastries: [
    { id: "p1", name: "Croissant", desc: "Flaky, buttery perfection." },
    { id: "p2", name: "Muffin", desc: "Blueberry or chocolate chip." },
  ],
  sandwiches: [
    { id: "s1", name: "BLT", desc: "Bacon, lettuce, tomato." },
    { id: "s2", name: "Veggie Wrap", desc: "Fresh vegetables, hummus." },
  ],
};

export function AccordionCardThemeExample() {
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
      <h3 className="text-foreground mb-2 text-xl font-semibold">Example:</h3>
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
              <span>{category.name}</span>
              <span>{expandedCategory === category.id ? "▲" : "▼"}</span>
            </button>
            <AnimatePresence>
              {expandedCategory === category.id && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={itemGridVariants}
                  className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" // Use grid for cards
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
                            {item.name}
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            {item.desc}
                          </p>
                        </motion.div>
                      ),
                    )
                  ) : (
                    <p className="text-muted-foreground col-span-full text-center">
                      No items in this category.
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
