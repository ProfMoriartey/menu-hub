// src/components/themes/ClassicThemeSection.tsx
"use client";

import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { PublicRestaurantCard } from "~/components/public/RestaurantCard";
import type { Restaurant } from "~/types/restaurant";
import { useState } from "react";

// Mock data for categories and items (remains the same)
const mockCategories = [
  { id: "appetizers", name: "Appetizers" },
  { id: "main-courses", name: "Main Courses" },
  { id: "desserts", name: "Desserts" },
  { id: "drinks", name: "Drinks" },
];

const mockItems = {
  appetizers: [
    { id: "a1", name: "Spring Rolls" },
    { id: "a2", name: "Garlic Bread" },
    { id: "a3", name: "Tomato Bruschetta" },
  ],
  "main-courses": [
    { id: "m1", name: "Grilled Salmon" },
    { id: "m2", name: "Steak Frites" },
    { id: "m3", name: "Veggie Burger" },
    { id: "m4", name: "Chicken Alfredo" },
  ],
  desserts: [
    { id: "d1", name: "Cheesecake" },
    { id: "d2", name: "Chocolate Lava Cake" },
  ],
  drinks: [
    { id: "dr1", name: "Iced Tea" },
    { id: "dr2", name: "Lemonade" },
    { id: "dr3", name: "Coffee" },
    { id: "dr4", name: "Orange Juice" },
  ],
};

// Interface definition for component props (remains the same)
interface ClassicThemeSectionProps {
  restaurant: Restaurant | null;
  reverseLayout: boolean;
}

export function ClassicThemeSection({
  restaurant,
  reverseLayout,
}: ClassicThemeSectionProps) {
  const [activeCategory, setActiveCategory] = useState(
    mockCategories[0]?.id ?? "",
  );

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
        A timeless, easy-to-navigate layout. It features prominent top
        categories and a clear two-column menu grid. Ideal for broad menus.
      </motion.p>

      <div
        className={cn(
          "flex flex-col items-center gap-8 md:flex-row",
          reverseLayout ? "md:flex-row-reverse" : "",
        )}
      >
        {/* Left column content: Example */}
        <div className="w-full flex-1 space-y-4 md:flex-shrink md:flex-grow">
          <div className="mb-8">
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              Example:
            </h3>
            <div className="border-border bg-background rounded-lg border p-4">
              <div className="mb-4 flex space-x-2 overflow-x-auto">
                {mockCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm transition-colors",
                      activeCategory === category.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {mockItems[activeCategory as keyof typeof mockItems]?.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="border-border bg-card rounded-md border p-2"
                    >
                      {item.name}
                    </div>
                  ),
                )}
                {mockItems[activeCategory as keyof typeof mockItems]?.length ===
                  0 && (
                  <p className="text-muted-foreground col-span-2 text-center">
                    No items in this category.
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* REMOVED: How it looks: from here */}
        </div>

        {/* Right column content: How it looks + Restaurant Card */}
        <div className="flex w-full flex-col items-center md:w-[450px] md:flex-shrink-0 md:flex-grow-0 lg:w-[500px] xl:w-[550px]">
          {/* ADDED: How it looks: here */}
          <motion.h3
            variants={itemVariants}
            transition={{ delay: 0.4 }}
            className="text-foreground mb-4 text-xl font-semibold"
          >
            How it looks:
          </motion.h3>
          {restaurant ? (
            <PublicRestaurantCard
              restaurant={{ ...restaurantToDisplay, theme: "classic" }}
              isFullWidthDisplay={true}
            />
          ) : (
            <p className="border-border bg-background text-muted-foreground mx-auto w-full max-w-sm rounded-lg border p-4 text-center">
              No restaurant found with &aposclassic&apos theme to display.
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
