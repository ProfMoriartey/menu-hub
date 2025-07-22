// src/components/home/FeaturedRestaurantsSection.tsx
"use client"; // ADDED: Ensure this is a client component for Framer Motion

import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Restaurant } from "~/types/restaurant";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion"; // ADDED: Import motion

interface FeaturedRestaurantsSectionProps {
  restaurants: Restaurant[];
}

export function FeaturedRestaurantsSection({
  restaurants,
}: FeaturedRestaurantsSectionProps) {
  const fallbackImageUrl = `https://placehold.co/300x200/E0E0E0/333333?text=No+Image`;

  return (
    // UPDATED: motion.section for fade-in effect on mount, and semantic colors
    <motion.section
      initial={{ opacity: 0, y: 50 }} // Starts invisible and slightly below
      animate={{ opacity: 1, y: 0 }} // Animates to visible and original position
      transition={{ duration: 0.8, delay: 0.2 }} // Smooth transition with slight delay
      className="bg-secondary py-16" // UPDATED: Use bg-secondary for the section background
    >
      <div className="container mx-auto max-w-6xl px-4">
        {/* UPDATED: Use text-foreground for the heading */}
        <h2 className="text-foreground mb-10 text-center text-4xl font-bold">
          Featured Restaurants
        </h2>
        {restaurants.length === 0 ? (
          // UPDATED: Use text-muted-foreground for text
          <div className="text-muted-foreground py-10 text-center">
            <p>No featured restaurants available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant, index) => (
              <Link key={restaurant.id} href={`/${restaurant.slug}`} passHref>
                {/* ADDED: motion.div wrapper for each RestaurantCard, with staggered animation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} // Start slightly below and invisible
                  animate={{ opacity: 1, y: 0 }} // Animate to visible and original position
                  transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }} // Staggered fade-in with a slight overall delay
                  whileHover={{ scale: 1.03 }} // Scale up slightly on hover
                  className="block h-full" // Ensure it takes full space in grid
                >
                  {/* UPDATED: Card uses semantic background, text, and border colors */}
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
                      {/* UPDATED: CardTitle and CardDescription also semantic */}
                      <CardTitle className="text-foreground text-2xl">
                        {restaurant.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {restaurant.foodType}{" "}
                        {restaurant.country && ` - ${restaurant.country}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      {/* Button with outline variant should pick up theme colors */}
                      <Button variant="outline" className="w-full">
                        View Menu
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
          <Link href="/restaurants" passHref>
            {/* ADDED: motion.button for hover and tap effects, and semantic colors */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "rounded-full px-8 py-3 text-lg shadow-md transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              View All Restaurants
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
