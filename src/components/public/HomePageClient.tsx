//src/components/public/HomePageClient.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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
import { searchRestaurants } from "~/app/actions/search";

interface HomePageClientProps {
  restaurants: Restaurant[];
}

export function HomePageClient({ restaurants }: HomePageClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fallbackImageUrl = `https://placehold.co/50x50/E0E0E0/333333?text=Logo`;

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.length > 0) {
      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        // Use 'void' operator on the IIFE invocation to suppress no-floating-promises
        void (async () => {
          // <-- CHANGE MADE HERE: Added 'void'
          try {
            const results = await searchRestaurants(searchTerm);
            setSearchResults(results);
            setIsPopoverOpen(true);
          } catch (error) {
            console.error("Failed to fetch search results:", error);
            setSearchResults([]);
            setIsPopoverOpen(false);
          } finally {
            setIsSearching(false);
          }
        })();
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  const restaurantsToDisplay =
    searchTerm.length > 0 ? searchResults : restaurants;

  const handlePopoverOpenChange = (newOpenState: boolean) => {
    setIsPopoverOpen(newOpenState);
    if (!newOpenState && searchTerm.length > 0) {
      setSearchTerm("");
    }
  };

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
          <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-center rounded-lg p-3 text-gray-500 shadow-sm sm:w-80"
                onClick={() => {
                  setIsPopoverOpen(true);
                }}
              >
                Search Menus
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command>
                <CommandInput
                  placeholder="Search for a restaurant, cuisine, or menu item..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  className="h-9"
                  autoFocus
                />
                <CommandList>
                  {isSearching ? (
                    <CommandEmpty>Searching...</CommandEmpty>
                  ) : restaurantsToDisplay.length === 0 &&
                    searchTerm.length > 0 ? (
                    <CommandEmpty>No results found.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {restaurantsToDisplay.map((restaurant) => (
                        <Link
                          key={restaurant.id}
                          href={`/${restaurant.slug}`}
                          passHref
                          onClick={() => {
                            setIsPopoverOpen(false);
                            setSearchTerm("");
                          }}
                        >
                          <CommandItem
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
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
