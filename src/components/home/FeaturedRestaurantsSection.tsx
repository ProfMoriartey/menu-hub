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
import type { Restaurant } from "~/types/restaurant"; // Import Restaurant type

interface FeaturedRestaurantsSectionProps {
  restaurants: Restaurant[]; // Receive restaurants as a prop
}

export function FeaturedRestaurantsSection({
  restaurants,
}: FeaturedRestaurantsSectionProps) {
  const fallbackImageUrl = `https://placehold.co/300x200/E0E0E0/333333?text=No+Image`;

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="mb-10 text-center text-4xl font-bold text-gray-900">
          Featured Restaurants
        </h2>
        {restaurants.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <p>No featured restaurants available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/${restaurant.slug}`} passHref>
                <Card className="flex h-full cursor-pointer flex-col transition-shadow duration-300 hover:shadow-xl">
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
                    <CardTitle className="text-2xl">
                      {restaurant.name}
                    </CardTitle>
                    <CardDescription>
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
              </Link>
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
          <Link href="/restaurants" passHref>
            <Button className="rounded-full bg-blue-600 px-8 py-3 text-lg text-white shadow-md transition-colors hover:bg-blue-700">
              View All Restaurants
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
