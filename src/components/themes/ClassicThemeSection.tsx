// src/components/themes/ClassicThemeSection.tsx
"use client";

import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { PublicRestaurantCard } from "~/components/public/RestaurantCard";
import type { Restaurant } from "~/types/restaurant";
import { ClassicThemeExample } from "~/components/themes/ClassicThemeExample";
import { useTranslations } from "next-intl"; // Import useTranslations

// Interface definition for component props (remains the same)
interface ClassicThemeSectionProps {
  restaurant: Restaurant | null;
  reverseLayout: boolean;
}

export function ClassicThemeSection({
  restaurant,
  reverseLayout,
}: ClassicThemeSectionProps) {
  const t = useTranslations("themesPage.sections.classic"); // Initialize translations for the 'themesPage.sections.classic' namespace

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
        {t("title")}
      </motion.h2>
      <motion.p
        variants={itemVariants}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mb-6 text-lg"
      >
        {t("description")}
      </motion.p>

      <div
        className={cn(
          "flex flex-col items-center gap-8 md:flex-row",
          reverseLayout ? "md:flex-row-reverse" : "",
        )}
      >
        {/* Left column content: Example */}
        <div className="w-full flex-1 space-y-4 md:flex-shrink md:flex-grow">
          <ClassicThemeExample />
        </div>

        {/* Right column content: How it looks + Restaurant Card */}
        <div className="flex w-full flex-col items-center md:w-[450px] md:flex-shrink-0 md:flex-grow-0 lg:w-[500px] xl:w-[550px]">
          <motion.h3
            variants={itemVariants}
            transition={{ delay: 0.4 }}
            className="text-foreground mb-4 text-xl font-semibold"
          >
            {t("howItLooks")}
          </motion.h3>
          {restaurant ? (
            <PublicRestaurantCard
              restaurant={{ ...restaurantToDisplay, theme: "classic" }}
              isFullWidthDisplay={true}
            />
          ) : (
            <p className="border-border bg-background text-muted-foreground mx-auto w-full max-w-sm rounded-lg border p-4 text-center">
              {t("noRestaurantFound")}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
