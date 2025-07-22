// src/components/themes/ClassicThemeSection.tsx
"use client";

import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { PublicRestaurantCard } from "~/components/public/RestaurantCard";
import type { Restaurant } from "~/types/restaurant";

interface ClassicThemeSectionProps {
  restaurant: Restaurant | null;
  reverseLayout: boolean; // ADDED: New prop
}

export function ClassicThemeSection({
  restaurant,
  reverseLayout,
}: ClassicThemeSectionProps) {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const mockRestaurantFallback: Restaurant = {
    id: "mock-restaurant-classic",
    name: "Classic Diner",
    slug: "classic-diner",
    address: "456 Oak Ave",
    country: "USA",
    foodType: "American",
    isActive: true,
    isDisplayed: true,
    logoUrl: "https://placehold.co/300x200/E0E0E0/333333?text=Classic+Logo",
    currency: "USD",
    phoneNumber: "555-987-6543",
    description: "A timeless dining experience.",
    theme: "classic",
    typeOfEstablishment: "Diner",
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
        Classic Layout
      </motion.h2>
      <motion.p
        variants={itemVariants}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mb-6 text-lg"
      >
        A traditional and clean layout with categories displayed as a top
        horizontal bar, and menu items in a two-column grid.
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
              <div className="mb-4 flex space-x-2 overflow-x-auto">
                <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm">
                  Appetizers
                </span>
                <span className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                  Main Courses
                </span>
                <span className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                  Desserts
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border-border rounded-md border p-2">
                  Item 1
                </div>
                <div className="bg-card border-border rounded-md border p-2">
                  Item 2
                </div>
                <div className="bg-card border-border rounded-md border p-2">
                  Item 3
                </div>
                <div className="bg-card border-border rounded-md border p-2">
                  Item 4
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
              restaurant={{ ...restaurantToDisplay, theme: "classic" }}
            />
          ) : (
            <p className="text-muted-foreground border-border bg-background mx-auto w-full max-w-sm rounded-lg border p-4 text-center">
              No restaurant found with &aposclassic&apos theme to display.
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
