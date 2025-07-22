// src/components/themes/CategoryCardsImageDominantThemeSection.tsx
"use client";

import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { PublicRestaurantCard } from "~/components/public/RestaurantCard";
import type { Restaurant } from "~/types/restaurant";
import Image from "next/image";

interface CategoryCardsImageDominantThemeSectionProps {
  restaurant: Restaurant | null;
  reverseLayout: boolean; // ADDED: New prop
}

export function CategoryCardsImageDominantThemeSection({
  restaurant,
  reverseLayout,
}: CategoryCardsImageDominantThemeSectionProps) {
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
        Category Cards Image Dominant Layout
      </motion.h2>
      <motion.p
        variants={itemVariants}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mb-6 text-lg"
      >
        Presents categories as prominent clickable cards. Upon selection, menu
        items are displayed with larger, dominant images for a visually rich
        experience.
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
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="bg-primary text-primary-foreground rounded-md p-3 text-center">
                  Category X
                </div>
                <div className="bg-secondary text-secondary-foreground rounded-md p-3 text-center">
                  Category Y
                </div>
              </div>
              <div className="bg-card border-border relative h-32 w-full overflow-hidden rounded-md border">
                <Image
                  src="https://placehold.co/400x300/E0E0E0/333333?text=Item+Image"
                  alt="Example Item"
                  fill
                  style={{ objectFit: "cover" }}
                />
                <span className="absolute bottom-2 left-2 text-sm font-bold text-white">
                  Dish Name
                </span>
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
              restaurant={{
                ...restaurantToDisplay,
                theme: "category-cards-image-dominant",
              }}
            />
          ) : (
            <p className="text-muted-foreground border-border bg-background mx-auto w-full max-w-sm rounded-lg border p-4 text-center">
              No restaurant found with &aposcategory-cards-image-dominant&apos
              theme to display.
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
