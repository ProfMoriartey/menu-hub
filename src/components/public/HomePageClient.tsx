// src/components/public/HomePageClient.tsx
"use client"; // This is a Client Component

import { useState } from "react"; // Example: if search input were stateful
import Link from "next/link";
import Image from "next/image"; // Use Next.js Image component directly
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

// Define the type for a Restaurant, matching your Drizzle schema output
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date | null;
}

interface HomePageClientProps {
  restaurants: Restaurant[];
}

export function HomePageClient({ restaurants }: HomePageClientProps) {
  // Example: If you wanted a client-side search input, its state would live here
  // const [searchTerm, setSearchTerm] = useState('');

  // Fallback image URL for onError
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
        {/* Optional: Search Bar (client-side interactive elements) */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Input
            type="text"
            placeholder="Search for a restaurant or cuisine..."
            className="w-full rounded-lg p-3 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-80"
            // value={searchTerm} // Example: if using useState
            // onChange={(e) => setSearchTerm(e.target.value)}
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
                    {/* Use Next.js Image component directly here */}
                    {/* <Image
                      src={`https://placehold.co/300x200/E0E0E0/333333?text=${restaurant.name.split(" ")[0]}+Logo`}
                      alt={`${restaurant.name} Logo`}
                      width={300}
                      height={200}
                      className="mb-4 h-40 w-full rounded-md object-cover"
                      onError={(e) => {
                        // onError is fine in a Client Component
                        e.currentTarget.src = fallbackImageUrl;
                        e.currentTarget.onerror = null; // Prevent infinite loop
                      }}
                    /> */}
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
