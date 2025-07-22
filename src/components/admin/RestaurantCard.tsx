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
import { DeleteRestaurantDialog } from "~/components/admin/DeleteRestaurantDialog";
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

import type { Restaurant } from "~/types/restaurant";

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
    // UPDATED: Card uses semantic background, text, and border colors
    <Card
      className={cn(
        "bg-card text-foreground border-border flex h-full flex-col border",
      )}
    >
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
        {/* UPDATED: CardTitle and CardDescription use semantic text colors */}
        <CardTitle className="text-foreground">{restaurant.name}</CardTitle>
        <CardDescription className="text-muted-foreground">
          Slug: {restaurant.slug}
        </CardDescription>
        {/* UPDATED: Timestamp text uses semantic muted-foreground color */}
        <p className="text-muted-foreground text-xs">
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
          {/* Button with secondary variant should pick up theme colors */}
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
