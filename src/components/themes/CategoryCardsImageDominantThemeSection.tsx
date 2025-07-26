// src/components/themes/CategoryCardsImageDominantThemeSection.tsx
"use client";

import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { PublicRestaurantCard } from "~/components/public/RestaurantCard";
import type { Restaurant } from "~/types/restaurant";
import { CategoryCardsImageDominantThemeExample } from "~/components/themes/CategoryCardsImageDominantThemeExample";
import { useTranslations } from "next-intl"; // Import useTranslations

interface CategoryCardsImageDominantThemeSectionProps {
  restaurant: Restaurant | null;
  reverseLayout: boolean;
}

export function CategoryCardsImageDominantThemeSection({
  restaurant,
  reverseLayout,
}: CategoryCardsImageDominantThemeSectionProps) {
  const t = useTranslations("themesPage.sections.categoryCardsImageDominant"); // Initialize translations

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const mockRestaurantFallback: Restaurant = {
    id: "mock-restaurant-image-dominant",
    name: "Flavor Fusion",
    slug: "flavor-fusion",
    address: "200 Spice Lane",
    country: "Australia",
    foodType: "International",
    isActive: true,
    isDisplayed: true,
    logoUrl: "https://placehold.co/300x200/E0E0E0/333333?text=Fusion+Logo",
    currency: "AUD",
    phoneNumber: "555-777-8888",
    description: "A blend of tastes from around the world.",
    theme: "category-cards-image-dominant",
    typeOfEstablishment: "Fine Dining",
    createdAt: new Date(),
    updatedAt: new Date(),
    categories: [],
  };

  const restaurantToDisplay = restaurant ?? mockRestaurantFallback;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }} // Adjusted viewport amount
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
          <CategoryCardsImageDominantThemeExample />
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
              restaurant={{
                ...restaurantToDisplay,
                theme: "category-cards-image-dominant",
              }}
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
