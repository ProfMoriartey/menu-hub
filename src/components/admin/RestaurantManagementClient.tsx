// src/components/admin/RestaurantManagementClient.tsx
"use client";

import { useState } from "react";
import { Plus, Search, Store } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { RestaurantCard } from "~/components/admin/RestaurantCard";
import { cn } from "~/lib/utils";

import type { Restaurant } from "~/types/restaurant";

const FILTERS = [
  { id: "all", label: "All", test: () => true },
  { id: "active", label: "Active", test: (r: Restaurant) => r.isActive },
  { id: "inactive", label: "Inactive", test: (r: Restaurant) => !r.isActive },
  { id: "featured", label: "Featured", test: (r: Restaurant) => r.isActive && r.isDisplayed },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

interface RestaurantManagementClientProps {
  initialRestaurants: Restaurant[];
  deleteRestaurantAction: (restaurantId: string) => Promise<void>;
}

export function RestaurantManagementClient({
  initialRestaurants,
  deleteRestaurantAction,
}: RestaurantManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

  const term = searchTerm.trim().toLowerCase();
  const matchesSearch = (restaurant: Restaurant) =>
    [
      restaurant.name,
      restaurant.slug,
      restaurant.country,
      restaurant.foodType,
      restaurant.typeOfEstablishment,
      restaurant.address,
    ].some((value) => value?.toLowerCase().includes(term));

  const searched = term ? initialRestaurants.filter(matchesSearch) : initialRestaurants;
  const activeFilter = FILTERS.find((f) => f.id === filter)!;
  const visible = searched.filter(activeFilter.test);

  if (initialRestaurants.length === 0) {
    return (
      <div className="border-border flex flex-col items-center rounded-xl border border-dashed px-6 py-16 text-center">
        <Store className="text-muted-foreground mb-4 h-10 w-10" />
        <h2 className="text-lg font-semibold">No restaurants yet</h2>
        <p className="text-muted-foreground mt-1 mb-6 max-w-sm text-sm">
          Create the first restaurant, then add its categories and menu items.
        </p>
        <Button asChild>
          <Link href="/admin/restaurants/new">
            <Plus className="h-4 w-4" /> New restaurant
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search name, cuisine, country…"
            aria-label="Search restaurants"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div role="tablist" aria-label="Filter by status" className="bg-muted inline-flex rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span className="text-muted-foreground ml-1.5 tabular-nums">
                {searched.filter(f.test).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="border-border rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="font-medium">No restaurants match</p>
          <p className="text-muted-foreground mt-1 text-sm">Try a different search or filter.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearchTerm("");
              setFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              deleteRestaurantAction={deleteRestaurantAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
