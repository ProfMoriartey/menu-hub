// src/components/public/RestaurantSearchAndGrid.tsx
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
import { cn } from "~/lib/utils";
import { motion } from "framer-motion"; // Keep this import

import type { Restaurant } from "~/types/restaurant";
import { searchRestaurants } from "~/app/actions/search";
import { RestaurantCardSkeleton } from "~/components/shared/RestaurantCardSkeleton";
import { Skeleton } from "../ui/skeleton";
// REMOVED: import { AddRestaurantForm } from "../admin/AddRestaurantForm"; // REMOVED ADMIN COMPONENT
// REMOVED: import { RestaurantCard } from "../admin/RestaurantCard"; // REMOVED ADMIN COMPONENT

// ADDED: Import the NEW public-facing RestaurantCard
import { PublicRestaurantCard } from "~/components/public/RestaurantCard";

interface RestaurantSearchAndGridProps {
  initialRestaurants: Restaurant[];
  // REMOVED: addRestaurantAction, deleteRestaurantAction, updateRestaurantAction props
}

export function RestaurantSearchAndGrid({
  initialRestaurants,
  // REMOVED: Destructure admin-related props here
}: RestaurantSearchAndGridProps) {
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
        void (async () => {
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

  const restaurantsToDisplayInGrid =
    searchTerm.length > 0 ? searchResults : initialRestaurants;

  const handlePopoverOpenChange = (newOpenState: boolean) => {
    setIsPopoverOpen(newOpenState);
    if (!newOpenState && searchTerm.length > 0) {
      setSearchTerm("");
    }
  };

  return (
    <>
      {/* REMOVED: motion.div wrapper around the control div if AddRestaurantForm is removed from here */}
      <div // Reverted to normal div, if AddRestaurantForm is removed
        className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-center rounded-lg p-3 shadow-sm sm:w-80",
                "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={() => {
                setIsPopoverOpen(true);
              }}
            >
              Search Restaurants
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
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : restaurantsToDisplayInGrid.length === 0 &&
                  searchTerm.length > 0 ? (
                  <CommandEmpty>
                    No results found for &quot;{searchTerm}&quot;.
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {restaurantsToDisplayInGrid.map((restaurant) => (
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
                          className="text-foreground flex cursor-pointer items-center gap-2"
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
                            <p className="text-muted-foreground text-sm">
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
        {/* REMOVED: AddRestaurantForm from here */}
        {/* <AddRestaurantForm addRestaurantAction={addRestaurantAction} /> */}
      </div>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <h2 className="text-foreground mb-10 text-center text-4xl font-bold">
          All Restaurants
        </h2>
        {isSearching && searchTerm.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : restaurantsToDisplayInGrid.length === 0 &&
          searchTerm.length === 0 ? (
          <div className="text-muted-foreground text-center">
            <p>No restaurants found.</p>
            <p className="mt-2">
              If you are the admin, please add restaurants via the dashboard.
            </p>
          </div>
        ) : restaurantsToDisplayInGrid.length === 0 && searchTerm.length > 0 ? (
          <div className="text-muted-foreground text-center">
            <p>No results found for &quot;{searchTerm}&quot;.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {restaurantsToDisplayInGrid.map((restaurant, index) => (
              <motion.div // Keep motion.div wrapper for animation
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
                className="block h-full"
              >
                {/* CHANGED: Use the NEW PublicRestaurantCard */}
                <PublicRestaurantCard restaurant={restaurant} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
