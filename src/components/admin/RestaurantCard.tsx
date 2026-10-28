// src/components/admin/RestaurantCard.tsx
"use client";

import { ExternalLink, Eye, MapPin, PauseCircle, Pencil, Rocket, Star, UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { DeleteRestaurantDialog } from "~/components/admin/DeleteRestaurantDialog";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import { cn } from "~/lib/utils";
import { formatDate } from "~/lib/format";
import { venueTypeLabel } from "~/lib/venue-types";

import type { ActionResult } from "~/lib/action-result";
import type { Restaurant } from "~/types/restaurant";
import type { SetupProgress } from "~/lib/setup-checklist";

export function StatusBadges({
  restaurant,
}: {
  restaurant: Pick<Restaurant, "isActive" | "isDisplayed" | "pausedAt">;
}) {
  return (
    <>
      {restaurant.pausedAt && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
          <PauseCircle className="h-3 w-3" aria-hidden />
          Paused
        </span>
      )}
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
  // Getting-started checklist progress; absent when not loaded.
  setup?: SetupProgress;
  deleteRestaurantAction: (restaurantId: string) => Promise<ActionResult>;
}

export function RestaurantCard({
  restaurant,
  setup,
  deleteRestaurantAction,
}: RestaurantCardProps) {
  const tVenue = useTranslations("VenueTypes");
  const details = [venueTypeLabel(restaurant.typeOfEstablishment, tVenue), restaurant.foodType]
    .filter(Boolean)
    .join(" · ");
  // Countries as codes ("Bursa, TR"): short, and the same on server and client.
  const location = [restaurant.address, restaurant.city, restaurant.country]
    .filter(Boolean)
    .join(", ");

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
          {setup?.readyToGoLive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-800 dark:text-sky-300">
              <Rocket className="h-3 w-3" aria-hidden /> Ready to go live
            </span>
          ) : (
            setup &&
            !setup.complete && (
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">
                Setup {setup.done}/{setup.total}
              </span>
            )
          )}
        </div>

        <dl className="text-muted-foreground space-y-1 text-sm">
          {details && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Type</dt>
              <UtensilsCrossed className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <dd className="truncate">{details}</dd>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Location</dt>
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <dd className="truncate">
                {location}
              </dd>
            </div>
          )}
        </dl>

        <p className="text-muted-foreground mt-auto text-xs">
          Added {formatDate(restaurant.createdAt)}
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
          {/* Inactive restaurants open as a preview only people with access see. */}
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={`/${restaurant.slug}`}
              target="_blank"
              aria-label={
                restaurant.isActive
                  ? `Open ${restaurant.name}'s live menu`
                  : `Preview ${restaurant.name}'s menu`
              }
              title={restaurant.isActive ? "Open live menu" : "Preview menu"}
            >
              {restaurant.isActive ? <ExternalLink className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Link>
          </Button>
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
