// src/components/shared/VenueTypeIcon.tsx
import {
  Beer,
  CakeSlice,
  Coffee,
  CookingPot,
  Croissant,
  Sandwich,
  Store,
  UtensilsCrossed,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import type { VenueType } from "~/lib/venue-types";

const ICONS: Record<VenueType, LucideIcon> = {
  restaurant: UtensilsCrossed,
  cafe: Croissant,
  coffee_shop: Coffee,
  bakery: Wheat,
  dessert: CakeSlice,
  fast_food: Sandwich,
  bar: Beer,
  home_cooking: CookingPot,
};

/** The venue type's icon; a shop front for no type. Decorative. */
export function VenueTypeIcon({
  type,
  className,
}: {
  type: VenueType | null;
  className?: string;
}) {
  const Icon = type ? ICONS[type] : Store;
  return <Icon className={className} aria-hidden />;
}
