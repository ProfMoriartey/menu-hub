//src/components/public/HomePageClient.tsx
"use client";

import { useState, useEffect } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";

import type { Restaurant } from "~/types/restaurant";

interface HomePageClientProps {
  restaurants: Restaurant[];
}

export function HomePageClient({ restaurants }: HomePageClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState<Restaurant[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const fallbackImageUrl = `https://placehold.co/50x50/E0E0E0/333333?text=Logo`;

  // Effect to filter restaurants based on search term
  useEffect(() => {
    if (searchTerm.length > 0) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const results = restaurants.filter((restaurant) => {
        const matchesSearch = (value: string | null | undefined): boolean => {
          return value?.toLowerCase().includes(lowerCaseSearchTerm) ?? false;
        };

        // Search by restaurant name, slug, country, food type, or address
        if (
          matchesSearch(restaurant.name) ||
          matchesSearch(restaurant.slug) ||
          matchesSearch(restaurant.country) ||
          matchesSearch(restaurant.foodType) ||
          matchesSearch(restaurant.address)
        ) {
          return true;
        }

        // Search by category name or menu item name
        if (restaurant.categories) {
          for (const category of restaurant.categories) {
            // Search by category name
            if (matchesSearch(category.name)) {
              return true;
            }
            // Search by menu item name within category
            if (
              category.menuItems?.some((menuItem) =>
                matchesSearch(menuItem.name),
              )
            ) {
              return true;
            }
          }
        }
        return false;
      });
      setFilteredResults(results);
      // Only open popover if there are results or if the search term is present
      setIsPopoverOpen(results.length > 0 || searchTerm.length > 0);
    } else {
      setFilteredResults([]);
      setIsPopoverOpen(false);
    }
  }, [searchTerm, restaurants]);

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
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start rounded-lg p-3 text-gray-500 shadow-sm sm:w-80"
                onClick={() => setIsPopoverOpen(true)}
              >
                {searchTerm ||
                  "Search for a restaurant, cuisine, or menu item..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command>
                <CommandInput
                  placeholder="Search for a restaurant, cuisine, or menu item..."
                  value={searchTerm}
                  onValueChange={(value) => {
                    setSearchTerm(value);
                    setIsPopoverOpen(true);
                  }}
                  className="h-9"
                  autoFocus
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {filteredResults.map((restaurant) => (
                      <Link
                        key={restaurant.id}
                        href={`/${restaurant.slug}`}
                        passHref
                        onClick={() => setIsPopoverOpen(false)}
                      >
                        <CommandItem
                          // CONCATENATE ALL SEARCHABLE FIELDS INTO THE VALUE
                          value={`${restaurant.name} ${restaurant.slug ?? ""} ${restaurant.country ?? ""} ${restaurant.foodType ?? ""} ${restaurant.address ?? ""} ${restaurant.categories?.map((cat) => cat.name).join(" ") ?? ""} ${
                            restaurant.categories
                              ?.flatMap((cat) =>
                                cat.menuItems?.map((item) => item.name),
                              )
                              .filter(Boolean)
                              .join(" ") ?? ""
                          }`}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <Image
                            src={restaurant.logoUrl ?? fallbackImageUrl}
                            alt={`${restaurant.name} Logo`}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{restaurant.name}</p>
                            <p className="text-sm text-gray-500">
                              {restaurant.foodType}
                              {restaurant.country
                                ? ` - ${restaurant.country}`
                                : ""}
                            </p>
                          </div>
                        </CommandItem>
                      </Link>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
