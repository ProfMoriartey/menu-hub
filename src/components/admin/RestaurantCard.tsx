// src/components/admin/RestaurantCard.tsx
"use client";

import Image from "next/image";
import { ExternalLink, MapPin, Pencil, Star, UtensilsCrossed } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { DeleteRestaurantDialog } from "~/components/admin/DeleteRestaurantDialog";
import { cn } from "~/lib/utils";

import type { Restaurant } from "~/types/restaurant";

// Fixed locale and time zone so server and browser render the same date.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function RestaurantLogo({
  restaurant,
  size = "md",
}: {
  restaurant: Pick<Restaurant, "name" | "logoUrl">;
  size?: "md" | "lg";
}) {
  const initials = restaurant.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={cn(
        "bg-muted border-border relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border",
        size === "lg" ? "h-16 w-16 text-xl" : "h-12 w-12 text-base",
      )}
    >
      {restaurant.logoUrl ? (
        <Image
          src={restaurant.logoUrl}
          alt=""
          fill
          sizes={size === "lg" ? "64px" : "48px"}
          className="object-cover"
        />
      ) : (
        <span className="text-muted-foreground font-semibold">{initials}</span>
      )}
    </div>
  );
}

export function StatusBadges({
  restaurant,
}: {
  restaurant: Pick<Restaurant, "isActive" | "isDisplayed">;
}) {
  return (
    <>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
          restaurant.isActive
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : "bg-muted text-muted-foreground",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            restaurant.isActive ? "bg-emerald-500" : "bg-muted-foreground/60",
          )}
        />
        {restaurant.isActive ? "Active" : "Inactive"}
      </span>
      {restaurant.isActive && restaurant.isDisplayed && (
        <span className="bg-attention/15 text-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
          <Star className="text-attention h-3 w-3 fill-current" />
          Featured
        </span>
      )}
    </>
  );
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  deleteRestaurantAction: (restaurantId: string) => Promise<void>;
}

export function RestaurantCard({
  restaurant,
  deleteRestaurantAction,
}: RestaurantCardProps) {
  const details = [restaurant.typeOfEstablishment, restaurant.foodType]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="bg-card text-card-foreground border-border group flex h-full flex-col rounded-xl border shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <RestaurantLogo restaurant={restaurant} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">
              <Link
                href={`/admin/restaurants/${restaurant.slug}/edit`}
                className="hover:underline"
              >
                {restaurant.name}
              </Link>
            </h3>
            <p className="text-muted-foreground truncate font-mono text-xs">
              /{restaurant.slug}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <StatusBadges restaurant={restaurant} />
        </div>

        <dl className="text-muted-foreground space-y-1 text-sm">
          {details && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Type</dt>
              <UtensilsCrossed className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <dd className="truncate">{details}</dd>
            </div>
          )}
          {(restaurant.address ?? restaurant.country) && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Location</dt>
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <dd className="truncate">
                {[restaurant.address, restaurant.country].filter(Boolean).join(", ")}
              </dd>
            </div>
          )}
        </dl>

        <p className="text-muted-foreground mt-auto text-xs">
          Added {dateFormat.format(new Date(restaurant.createdAt))}
        </p>
      </div>

      <div className="border-border flex items-center gap-2 border-t px-5 py-3">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/restaurants/${restaurant.slug}/edit`}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/restaurants/${restaurant.slug}/menu`}>Menu</Link>
        </Button>
        <div className="ml-auto flex items-center">
          {restaurant.isActive && (
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={`/${restaurant.slug}`}
                target="_blank"
                aria-label={`Open ${restaurant.name}'s live menu`}
                title="Open live menu"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <DeleteRestaurantDialog
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            deleteRestaurantAction={deleteRestaurantAction}
          />
        </div>
      </div>
    </article>
  );
}
