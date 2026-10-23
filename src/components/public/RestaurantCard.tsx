// src/components/public/RestaurantCard.tsx
// This is a Client Component.
// It displays a single restaurant card and handles interactive elements like links.

"use client";

import { Link } from "~/i18n/navigation";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

import type { Restaurant } from "~/types/restaurant";
import { motion } from "framer-motion";

// ADDED: Import useTranslations from next-intl
import { useTranslations } from "next-intl";

interface PublicRestaurantCardProps {
  restaurant: Restaurant;
  isFullWidthDisplay?: boolean; // ADDED: New optional prop
}

export function PublicRestaurantCard({
  restaurant,
  isFullWidthDisplay = false, // ADDED: Default to false
}: PublicRestaurantCardProps) {
  // ADDED: Initialize translations for the "restaurantCard" namespace
  const t = useTranslations("restaurantCard");

  return (
    <Link key={restaurant.id} href={`/${restaurant.slug}`} passHref>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.03 }}
        className="block h-full"
      >
        <Card
          className={cn(
            "flex h-full cursor-pointer flex-col transition-shadow duration-300 hover:shadow-xl",
            "bg-card text-foreground border-border border",
            isFullWidthDisplay && // ADDED: Conditional min-width
              "min-w-[350px] sm:min-w-[400px] md:min-w-[450px] lg:min-w-[500px]",
          )}
        >
          <CardHeader className="flex-grow">
            <RestaurantLogo
              restaurant={restaurant}
              className="mb-4 h-40 w-full rounded-md text-4xl"
              imageSizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
            <CardTitle className="text-foreground mb-2 text-2xl">
              {restaurant.name}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {restaurant.foodType}{" "}
              {restaurant.country && ` - ${restaurant.country}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button variant="outline" className="w-full">
              {/* UPDATED: Use translation for "View Menu" button */}
              {t("viewMenu")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
