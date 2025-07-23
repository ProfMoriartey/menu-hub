// src/components/themes/SidebarListThemeSection.tsx
"use client";

import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { PublicRestaurantCard } from "~/components/public/RestaurantCard";
import type { Restaurant } from "~/types/restaurant";
import { SidebarListThemeExample } from "~/components/themes/SidebarListThemeExample";

interface SidebarListThemeSectionProps {
  restaurant: Restaurant | null;
  reverseLayout: boolean;
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
      viewport={{ once: true, amount: 0.1 }}
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

      <div
        className={cn(
          "flex flex-col items-center gap-8 md:flex-row",
          reverseLayout ? "md:flex-row-reverse" : "",
        )}
      >
        <div className="w-full flex-1 space-y-4 md:flex-shrink md:flex-grow">
          <SidebarListThemeExample />
        </div>

        <div className="flex w-full flex-col items-center md:w-[450px] md:flex-shrink-0 md:flex-grow-0 lg:w-[500px] xl:w-[550px]">
          <motion.h3
            variants={itemVariants}
            transition={{ delay: 0.4 }}
            className="text-foreground mb-4 text-xl font-semibold"
          >
            How it looks:
          </motion.h3>
          {restaurant ? (
            <PublicRestaurantCard
              restaurant={{ ...restaurantToDisplay, theme: "sidebar-list" }}
              isFullWidthDisplay={true}
            />
          ) : (
            <p className="border-border bg-background text-muted-foreground mx-auto w-full max-w-sm rounded-lg border p-4 text-center">
              No restaurant found with &apossidebar-list&apos theme to display.
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
