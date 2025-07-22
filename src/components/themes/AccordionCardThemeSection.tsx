// src/components/themes/AccordionCardThemeSection.tsx
"use client";

import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { PublicRestaurantCard } from "~/components/public/RestaurantCard";
import type { Restaurant } from "~/types/restaurant";

interface AccordionCardThemeSectionProps {
  restaurant: Restaurant | null;
  reverseLayout: boolean; // ADDED: New prop
}

export function AccordionCardThemeSection({
  restaurant,
  reverseLayout,
}: AccordionCardThemeSectionProps) {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const mockRestaurantFallback: Restaurant = {
    id: "mock-restaurant-accordion",
    name: "The Urban Cafe",
    slug: "urban-cafe",
    address: "101 City Rd",
    country: "UK",
    foodType: "Coffee & Pastries",
    isActive: true,
    isDisplayed: true,
    logoUrl: "https://placehold.co/300x200/E0E0E0/333333?text=Cafe+Logo",
    currency: "GBP",
    phoneNumber: "555-333-4444",
    description: "Cozy spot for your morning brew.",
    theme: "accordion-card",
    typeOfEstablishment: "Cafe",
    createdAt: new Date(),
    updatedAt: new Date(),
    categories: [],
  };

  const restaurantToDisplay = restaurant ?? mockRestaurantFallback;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants}
      transition={{ duration: 0.8 }}
      className={cn("rounded-lg p-6 shadow-lg", "bg-card")}
    >
      <motion.h2
        variants={itemVariants}
        transition={{ delay: 0.2 }}
        className="text-foreground mb-4 text-3xl font-bold"
      >
        Accordion Card Layout
      </motion.h2>
      <motion.p
        variants={itemVariants}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mb-6 text-lg"
      >
        Organizes menu categories into expandable/collapsible accordion
        sections, revealing menu items displayed as distinct cards.
      </motion.p>

      {/* ADDED: Conditional flex-row-reverse for layout */}
      <div
        className={cn(
          "flex flex-col items-center gap-8 md:flex-row",
          reverseLayout ? "md:flex-row-reverse" : "",
        )}
      >
        {/* Content Block (Example + How it looks) */}
        <div className="w-full flex-1 space-y-4">
          <div className="mb-8">
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              Example:
            </h3>
            <div className="border-border bg-background rounded-lg border p-4">
              <div className="bg-primary text-primary-foreground mb-2 rounded-md px-3 py-2">
                Category 1 (Click to expand)
              </div>
              <div className="bg-secondary text-secondary-foreground mb-2 rounded-md px-3 py-2">
                Category 2
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-card border-border rounded-md border p-2">
                  Card Item A
                </div>
                <div className="bg-card border-border rounded-md border p-2">
                  Card Item B
                </div>
              </div>
            </div>
          </div>
          <motion.h3
            variants={itemVariants}
            transition={{ delay: 0.4 }}
            className="text-foreground mb-4 text-xl font-semibold"
          >
            How it looks:
          </motion.h3>
        </div>

        {/* Restaurant Card Block */}
        <div className="flex w-full flex-1 justify-center">
          {restaurant ? (
            <PublicRestaurantCard
              restaurant={{ ...restaurantToDisplay, theme: "accordion-card" }}
            />
          ) : (
            <p className="text-muted-foreground border-border bg-background mx-auto w-full max-w-sm rounded-lg border p-4 text-center">
              No restaurant found with &aposaccordion-card&apos theme to
              display.
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
