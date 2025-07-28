// components/public/RestaurantSearchAndGrid.tsx
// This is a Client Component.
// It handles user interactions, state management, and rendering on the client side.

"use client"; // This directive marks the component as a Client Component.

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";

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
import { motion } from "framer-motion";

import type { Restaurant } from "~/types/restaurant";
import { searchRestaurants } from "~/app/actions/search";
import { RestaurantCardSkeleton } from "~/components/shared/RestaurantCardSkeleton";
import { Skeleton } from "../ui/skeleton";

// ADDED: Import the NEW public-facing RestaurantCard
import { PublicRestaurantCard } from "~/components/public/RestaurantCard";

// ADDED: Import useTranslations from next-intl
import { useTranslations } from "next-intl";

interface RestaurantSearchAndGridProps {
  initialRestaurants: Restaurant[];
  // REMOVED: addRestaurantAction, deleteRestaurantAction, updateRestaurantAction props
}

export function RestaurantSearchAndGrid({
  initialRestaurants,
  // REMOVED: Destructure admin-related props here
}: RestaurantSearchAndGridProps) {
  // ADDED: Initialize translations
  const t = useTranslations("restaurantsPage");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fallbackImageUrl = `https://placehold.co/50x50/E0E0E0/333333?text=Logo`;

  // Effect for debouncing the search term and fetching results
  useEffect(() => {
    // Clear any existing debounce timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Only perform search if searchTerm has content
    if (searchTerm.length > 0) {
      setIsSearching(true); // Indicate that a search is in progress
      debounceRef.current = setTimeout(() => {
        void (async () => {
          try {
            // Call the server action to search for restaurants
            const results = await searchRestaurants(searchTerm);
            setSearchResults(results);
            setIsPopoverOpen(true); // Open the popover to show results
          } catch (error) {
            console.error("Failed to fetch search results:", error);
            setSearchResults([]);
            setIsPopoverOpen(false); // Close popover on error
          } finally {
            setIsSearching(false); // End searching state
          }
        })();
      }, 300); // Debounce time of 300ms
    } else {
      // If search term is empty, clear results and searching state
      setSearchResults([]);
      setIsSearching(false);
      setIsPopoverOpen(false); // Close popover when search term is empty
    }

    // Cleanup function: clear timeout if component unmounts or searchTerm changes
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]); // Re-run effect when searchTerm changes

  // Determine which list of restaurants to display in the main grid
  const restaurantsToDisplayInGrid =
    searchTerm.length > 0 ? searchResults : initialRestaurants;

  // Handler for popover open state changes, to reset search term if closed
  const handlePopoverOpenChange = (newOpenState: boolean) => {
    setIsPopoverOpen(newOpenState);
    if (!newOpenState && searchTerm.length > 0) {
      setSearchTerm(""); // Clear search term when popover closes if there was a term
    }
  };

  return (
    <>
      {/* Search control section */}
      <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-center rounded-lg p-3 shadow-sm sm:w-80",
                "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={() => {
                setIsPopoverOpen(true); // Force popover open when button is clicked
              }}
            >
              {/* UPDATED: Use translation for Search Restaurants button */}
              {t("searchButton")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput
                // UPDATED: Use translation for search placeholder
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="h-9"
                autoFocus // Automatically focus the input when popover opens
              />
              <CommandList>
                {isSearching ? (
                  // Display skeleton loaders while searching
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
                  // Display empty message if no search results for a non-empty term
                  <CommandEmpty>
                    {/* UPDATED: Use translation for no results found, passing searchTerm as a variable */}
                    {t("noResultsFound", { searchTerm })}
                  </CommandEmpty>
                ) : (
                  // Display search results or initial restaurants
                  <CommandGroup>
                    {restaurantsToDisplayInGrid.map((restaurant) => (
                      <Link
                        key={restaurant.id}
                        href={`/${restaurant.slug}`} // Link to restaurant details page
                        passHref
                        onClick={() => {
                          setIsPopoverOpen(false); // Close popover on item click
                          setSearchTerm(""); // Clear search term after selection
                        }}
                      >
                        <CommandItem
                          // Provide a comprehensive value for command item searching/filtering
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
      </div>

      {/* Main grid display section */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        {/* UPDATED: Use translation for All Restaurants title */}
        <h2 className="text-foreground mb-10 text-center text-4xl font-bold">
          {t("allRestaurantsTitle")}
        </h2>
        {isSearching && searchTerm.length > 0 ? (
          // Display skeletons if searching and a search term is present
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : restaurantsToDisplayInGrid.length === 0 &&
          searchTerm.length === 0 ? (
          // Message when no initial restaurants are found
          <div className="text-muted-foreground text-center">
            {/* UPDATED: Use translation for no restaurants found */}
            <p>{t("noRestaurantsFound")}</p>
            {/* UPDATED: Use translation for admin prompt */}
            <p className="mt-2">{t("adminPrompt")}</p>
          </div>
        ) : restaurantsToDisplayInGrid.length === 0 && searchTerm.length > 0 ? (
          // Message when no results are found for the current search term
          <div className="text-muted-foreground text-center">
            {/* UPDATED: Use translation for no results found, passing searchTerm as a variable */}
            <p>{t("noResultsFound", { searchTerm })}</p>
          </div>
        ) : (
          // Display the restaurant grid with motion animations
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
