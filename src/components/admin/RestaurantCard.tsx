// src/components/admin/RestaurantCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { EditRestaurantDialog } from "~/components/admin/EditRestaurantDialog";
import { DeleteRestaurantDialog } from "~/components/admin/DeleteRestaurantDialog"; // Import the new delete dialog

import type { Restaurant } from "~/types/restaurant"; // Ensure this path is correct

interface RestaurantCardProps {
  restaurant: Restaurant;
  deleteRestaurantAction: (restaurantId: string) => Promise<void>;
  updateRestaurantAction: (formData: FormData) => Promise<void>;
}

export function RestaurantCard({
  restaurant,
  deleteRestaurantAction,
  updateRestaurantAction,
}: RestaurantCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-grow">
        {restaurant.logoUrl && (
          <div className="mb-2 h-24 w-24 overflow-hidden rounded-md">
            <Image
              width={250}
              height={250}
              src={restaurant.logoUrl}
              alt={`${restaurant.name} Logo`}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardTitle>{restaurant.name}</CardTitle>
        <CardDescription>Slug: {restaurant.slug}</CardDescription>
        <p className="text-xs text-gray-500">
          Created:{" "}
          {new Date(restaurant.createdAt).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </p>
      </CardHeader>
      <CardContent className="mt-auto flex justify-end space-x-2 p-4 pt-0">
        <Link href={`/admin/restaurants/${restaurant.id}/categories`}>
          <Button variant="secondary" size="sm">
            Categories
          </Button>
        </Link>
        <EditRestaurantDialog
          restaurant={restaurant}
          updateRestaurantAction={updateRestaurantAction}
        />
        <DeleteRestaurantDialog
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          deleteRestaurantAction={deleteRestaurantAction}
        />
      </CardContent>
    </Card>
  );
}
