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
        <Input
          type="text"
          placeholder="Search by name, slug, country, type, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow md:w-2/3"
        />
        {/* Use the new AddRestaurantForm component */}
        <AddRestaurantForm addRestaurantAction={addRestaurantAction} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Restaurants</CardTitle>
          <CardDescription>
            A list of all restaurants currently in your database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRestaurants.length === 0 ? (
            <p className="text-center text-gray-500">No results found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Map over filtered restaurants and render RestaurantCard for each */}
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
