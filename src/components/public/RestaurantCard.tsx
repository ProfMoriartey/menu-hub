// src/components/public/RestaurantCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button"; // Assuming you want a button here
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

import type { Restaurant } from "~/types/restaurant"; // Import Restaurant type
import { motion } from "framer-motion";

interface PublicRestaurantCardProps {
  restaurant: Restaurant;
}

export function PublicRestaurantCard({
  restaurant,
}: PublicRestaurantCardProps) {
  const fallbackImageUrl = `https://placehold.co/300x200/E0E0E0/333333?text=No+Image`;

  return (
    <Link key={restaurant.id} href={`/${restaurant.slug}`} passHref>
      <motion.div // Added motion.div for animation consistency
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
          )}
        >
          <CardHeader className="flex-grow">
            <div className="mb-4 h-40 w-full overflow-hidden rounded-md">
              <Image
                src={restaurant.logoUrl ?? fallbackImageUrl}
                alt={`${restaurant.name} Logo`}
                width={300}
                height={200}
                className="h-full w-full object-cover"
              />
            </div>
            <CardTitle className="text-foreground text-2xl">
              {restaurant.name}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {restaurant.foodType}{" "}
              {restaurant.country && ` - ${restaurant.country}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button variant="outline" className="w-full">
              View Menu
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
