// src/components/admin/RestaurantManagementClient.tsx
"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

// Import new components
import { AddRestaurantForm } from "~/components/admin/AddRestaurantForm";
import { RestaurantCard } from "~/components/admin/RestaurantCard";

import type { Restaurant } from "~/types/restaurant";

interface RestaurantManagementClientProps {
  initialRestaurants: Restaurant[];
  addRestaurantAction: (formData: FormData) => Promise<void>;
  deleteRestaurantAction: (restaurantId: string) => Promise<void>;
  updateRestaurantAction: (formData: FormData) => Promise<void>;
}

export function RestaurantManagementClient({
  initialRestaurants,
  addRestaurantAction,
  deleteRestaurantAction,
  updateRestaurantAction,
}: RestaurantManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRestaurants = initialRestaurants.filter((restaurant) => {
    const term = searchTerm.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(term) ||
      restaurant.slug.toLowerCase().includes(term) ||
      (restaurant.country?.toLowerCase().includes(term) ?? false) ||
      (restaurant.foodType?.toLowerCase().includes(term) ?? false) ||
      (restaurant.address?.toLowerCase().includes(term) ?? false)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4 md:flex-row">
        {/* Input component usually handles its own theming via Shadcn defaults */}
        <Input
          type="text"
          placeholder="Search by name, slug, country, type, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow md:w-2/3" // Placeholder text color is typically handled by Shadcn's Input default style.
        />
        <AddRestaurantForm addRestaurantAction={addRestaurantAction} />
      </div>

      {/* UPDATED: Card uses semantic background, text, and border colors */}
      <Card className={cn("bg-card text-foreground border-border border")}>
        <CardHeader>
          {/* UPDATED: CardTitle and CardDescription use semantic text colors */}
          <CardTitle className="text-foreground">
            Existing Restaurants
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            A list of all restaurants currently in your database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* UPDATED: No results found message uses semantic text color */}
          {filteredRestaurants.length === 0 ? (
            <p className="text-muted-foreground text-center">
              No results found.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  deleteRestaurantAction={deleteRestaurantAction}
                  updateRestaurantAction={updateRestaurantAction}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
