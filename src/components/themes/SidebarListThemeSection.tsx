// src/components/themes/SidebarListThemeSection.tsx
"use client";

import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { PublicRestaurantCard } from "~/components/public/RestaurantCard";
import type { Restaurant } from "~/types/restaurant";

interface SidebarListThemeSectionProps {
  restaurant: Restaurant | null;
  reverseLayout: boolean; // ADDED: New prop
}

export function SidebarListThemeSection({
  restaurant,
  reverseLayout,
}: SidebarListThemeSectionProps) {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const mockRestaurantFallback: Restaurant = {
    id: "mock-restaurant-sidebar",
    name: "The Green Bistro",
    slug: "green-bistro",
    address: "789 Pine St",
    country: "Canada",
    foodType: "Vegan",
    isActive: true,
    isDisplayed: true,
    logoUrl: "https://placehold.co/300x200/E0E0E0/333333?text=Bistro+Logo",
    currency: "CAD",
    phoneNumber: "555-111-2222",
    description: "Fresh, plant-based delights.",
    theme: "sidebar-list",
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
        Sidebar List Layout
      </motion.h2>
      <motion.p
        variants={itemVariants}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mb-6 text-lg"
      >
        Features a clean vertical sidebar for category navigation, with menu
        items displayed in a single-column list format.
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
            <div className="border-border bg-background flex rounded-lg border p-4">
              <div className="border-border w-1/3 border-r pr-4">
                <div className="bg-primary text-primary-foreground mb-2 rounded-md px-3 py-1">
                  Category A
                </div>
                <div className="bg-secondary text-secondary-foreground mb-2 rounded-md px-3 py-1">
                  Category B
                </div>
              </div>
              <div className="w-2/3 pl-4">
                <div className="bg-card border-border mb-2 rounded-md border p-2">
                  List Item 1
                </div>
                <div className="bg-card border-border mb-2 rounded-md border p-2">
                  List Item 2
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
              restaurant={{ ...restaurantToDisplay, theme: "sidebar-list" }}
            />
          ) : (
            <p className="text-muted-foreground border-border bg-background mx-auto w-full max-w-sm rounded-lg border p-4 text-center">
              No restaurant found with &apossidebar-list&apos theme to display.
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
