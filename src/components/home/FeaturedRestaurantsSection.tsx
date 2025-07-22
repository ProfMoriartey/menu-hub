// src/components/home/FeaturedRestaurantsSection.tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import type { Restaurant } from "~/types/restaurant";
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

interface FeaturedRestaurantsSectionProps {
  restaurants: Restaurant[];
}

export function FeaturedRestaurantsSection({
  restaurants,
}: FeaturedRestaurantsSectionProps) {
  const fallbackImageUrl = `https://placehold.co/300x200/E0E0E0/333333?text=No+Image`;

  return (
    // UPDATED: Use bg-secondary for the section background
    <section className="bg-secondary py-16">
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
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/${restaurant.slug}`} passHref>
                {/* UPDATED: Card uses bg-card, text-foreground, and border-border */}
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
                    {/* CardTitle and CardDescription should inherit or be explicitly themed if defaults aren't enough */}
                    <CardTitle className="text-foreground text-2xl">
                      {restaurant.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {restaurant.foodType}{" "}
                      {restaurant.country && ` - ${restaurant.country}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    {/* Button with outline variant. Assuming it picks up theme colors from shadcn defaults. */}
                    <Button variant="outline" className="w-full">
                      View Menu
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
          <Link href="/restaurants" passHref>
            {/* UPDATED: Button uses bg-primary and text-primary-foreground */}
            <Button
              className={cn(
                "rounded-full px-8 py-3 text-lg shadow-md transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90", // Adjusted hover for a slight shade change
              )}
            >
              View All Restaurants
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
