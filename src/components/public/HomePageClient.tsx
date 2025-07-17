"use client"; // This is a Client Component

import Link from "next/link";
import Image from "next/image"; // Import Next.js Image component
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

// Import the shared Restaurant interface for type consistency
import type { Restaurant } from "~/types/restaurant";

interface HomePageClientProps {
  restaurants: Restaurant[];
}

export function HomePageClient({ restaurants }: HomePageClientProps) {
  // Fallback image URL for when a logo is not available
  const fallbackImageUrl = `https://placehold.co/300x200/E0E0E0/333333?text=No+Logo`;

  return (
    <>
      <header className="max-w-4xl px-4 py-12 text-center">
        <h1 className="mb-4 text-5xl leading-tight font-extrabold text-gray-900">
          Welcome to <span className="text-blue-600">Menu Hub</span>
        </h1>
        <p className="mb-8 text-xl text-gray-700">
          Your ultimate destination to explore delicious menus from local
          restaurants.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Input
            type="text"
            placeholder="Search for a restaurant or cuisine..."
            className="w-full rounded-lg p-3 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-80"
          />
          <Button className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white shadow-md transition-colors hover:bg-blue-700 sm:w-auto">
            Search Menus
          </Button>
        </div>
      </header>

      <section className="w-full max-w-6xl px-4 py-12">
        <h2 className="mb-10 text-center text-4xl font-bold text-gray-900">
          Featured Restaurants
        </h2>
        {restaurants.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No restaurants added yet. Check back soon!</p>
            <p className="mt-2">
              If you are the admin, please add restaurants via the dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/${restaurant.slug}`} passHref>
                <Card className="flex h-full cursor-pointer flex-col transition-shadow duration-300 hover:shadow-xl">
                  <CardHeader className="flex-grow">
                    {/* Display Logo using Next.js Image component */}
                    <div className="mb-4 h-40 w-full overflow-hidden rounded-md">
                      <Image
                        src={restaurant.logoUrl ?? fallbackImageUrl} // Use logoUrl or fallback
                        alt={`${restaurant.name} Logo`}
                        width={300} // Required for Next.js Image
                        height={200} // Required for Next.js Image
                        className="h-full w-full object-cover"
                        // onError is not typically used with Next/Image for fallbacks,
                        // as the src prop should already handle the fallback URL.
                        // If the URL itself is invalid, Next.js Image will show a broken image icon.
                      />
                    </div>
                    <CardTitle className="text-2xl">
                      {restaurant.name}
                    </CardTitle>
                    <CardDescription>
                      Explore their delicious menu.
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
      </section>
    </>
  );
}
