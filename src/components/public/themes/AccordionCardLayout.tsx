// src/components/public/themes/AccordionCardLayout.tsx
"use client";

import { Link } from "~/i18n/navigation";
import Image from "next/image";

import { motion } from "framer-motion";

import { categorySectionId } from "~/components/public/CategoryNav";
import { DietaryBadges } from "~/components/public/MenuItemCard";
import { SoldOutBadge } from "~/components/public/SoldOutBadge";
import type { MenuItem, Category } from "~/types/restaurant";

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

// The menu page only passes categories that have items, so there are no
// empty states to handle here.
export function AccordionCardLayout({ menuData }: AccordionCardLayoutProps) {
  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full">
        {menuData.categories.map((category, categoryIndex) => (
          <motion.div
            key={category.id}
            id={categorySectionId(category.slug)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1, duration: 0.5 }}
            className="mb-4 scroll-mt-4"
          >
            <AccordionItem
              value={category.id}
              className="bg-card border-border rounded-lg border shadow-md"
            >
              <AccordionTrigger className="text-foreground px-6 py-4 text-start text-xl font-semibold hover:no-underline">
                {category.name}
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.menuItems.map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: itemIndex * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      className="block"
                    >
                      <Link
                        href={`/${menuData.restaurant.slug}/item/${item.slug}`}
                        className="group bg-background border-border flex h-full flex-col items-center rounded-lg border p-4 text-center shadow-sm transition-shadow duration-200 hover:shadow-md"
                      >
                        {item.imageUrl && (
                          <div className="relative mb-4 h-32 w-full overflow-hidden rounded-md">
                            <Image
                              src={item.imageUrl}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                              className="rounded-md object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <h3 className="text-foreground group-hover:text-primary mb-1 text-xl font-semibold transition-colors duration-200">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                            {item.description}
                          </p>
                        )}
                        <DietaryBadges
                          labels={item.dietaryLabels}
                          className="mt-2 mb-2 justify-center"
                        />
                        <p className="text-primary mt-auto pt-2 text-lg font-bold">
                          {item.price} {menuData.restaurant.currency}
                          <SoldOutBadge availability={item.availability} />
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  );
}
