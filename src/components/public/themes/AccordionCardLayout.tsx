// src/components/public/themes/AccordionCardLayout.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

import { motion } from "framer-motion"; // ADDED: Import motion

import type { MenuItem, Category, DietaryLabel } from "~/types/restaurant";

// Import Shadcn UI Accordion components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

interface RestaurantMenuData {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    description: string | null;
  };
  categories: (Category & { menuItems: MenuItem[] })[];
}

interface AccordionCardLayoutProps {
  menuData: RestaurantMenuData;
}

export function AccordionCardLayout({ menuData }: AccordionCardLayoutProps) {
  const fallbackImageUrl = `https://placehold.co/120x120/E0E0E0/333333?text=No+Image`;

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full">
        {menuData.categories.length === 0 ? (
          <div className="text-muted-foreground py-10 text-center">
            <p>No categories available for this restaurant yet.</p>
          </div>
        ) : (
          menuData.categories.map(
            (
              category,
              categoryIndex, // ADDED: categoryIndex
            ) => (
              <motion.div // ADDED: motion.div wrapper for each AccordionItem
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1, duration: 0.5 }} // Staggered fade-in for categories
                className="mb-4" // Keep margin bottom for spacing
              >
                <AccordionItem
                  value={category.id}
                  className="bg-card border-border rounded-lg border shadow-md"
                >
                  <AccordionTrigger className="text-foreground px-6 py-4 text-left text-xl font-semibold hover:no-underline">
                    {category.name}
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0">
                    {category.menuItems.length === 0 ? (
                      <div className="text-muted-foreground py-4 text-center">
                        <p>No items in this category yet.</p>
                      </div>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {category.menuItems.map(
                          (
                            item,
                            itemIndex, // ADDED: itemIndex
                          ) => (
                            <motion.div // ADDED: motion.div for each menu item card
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }} // Start slightly below and invisible
                              animate={{ opacity: 1, y: 0 }} // Animate to visible and original position
                              transition={{
                                delay: itemIndex * 0.05,
                                duration: 0.3,
                              }} // Staggered fade-in for items
                              whileHover={{ scale: 1.02 }} // Subtle scale on item card hover
                              className="block" // Ensure it remains a block
                            >
                              <Link
                                href={`/${menuData.restaurant.slug}/item/${item.id}`}
                                passHref
                                className="group block h-full" // Ensure link takes full height of motion.div
                              >
                                <div className="bg-background border-border flex flex-col items-center rounded-lg border p-4 text-center shadow-sm transition-shadow duration-200 hover:shadow-md">
                                  <div className="relative mb-4 h-32 w-full overflow-hidden rounded-md">
                                    <Image
                                      src={item.imageUrl ?? fallbackImageUrl}
                                      alt={item.name}
                                      layout="fill"
                                      objectFit="cover"
                                      className="rounded-md transition-transform duration-220 group-hover:scale-105"
                                    />
                                  </div>
                                  <h3 className="text-foreground group-hover:text-primary mb-1 text-xl font-semibold transition-colors duration-200">
                                    {item.name}
                                  </h3>
                                  {item.description && (
                                    <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                                      {item.description}
                                    </p>
                                  )}
                                  {item.dietaryLabels &&
                                    item.dietaryLabels.length > 0 && (
                                      <div className="mt-2 mb-2 flex flex-wrap justify-center gap-1">
                                        {item.dietaryLabels.map(
                                          (label: DietaryLabel) => (
                                            <span
                                              key={label}
                                              className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-semibold"
                                            >
                                              {label.charAt(0).toUpperCase() +
                                                label
                                                  .slice(1)
                                                  .replace(/-/g, " ")}
                                            </span>
                                          ),
                                        )}
                                      </div>
                                    )}
                                  <p className="text-primary mt-2 text-lg font-bold">
                                    {item.price} {menuData.restaurant.currency}
                                  </p>
                                </div>
                              </Link>
                            </motion.div>
                          ),
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ),
          )
        )}
      </Accordion>
    </div>
  );
}
