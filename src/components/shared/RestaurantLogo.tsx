// src/components/shared/RestaurantLogo.tsx
import Image from "next/image";
import { cn } from "~/lib/utils";

import type { Restaurant } from "~/types/restaurant";

const SIZES = {
  sm: { box: "h-8 w-8 rounded-lg text-xs", image: "32px" },
  md: { box: "h-12 w-12 rounded-xl text-base", image: "48px" },
  lg: { box: "h-16 w-16 rounded-xl text-xl", image: "64px" },
};

/**
 * The restaurant's logo, or its initials on a muted tile when it has none.
 * `className` can override the box (size, rounding, text size); pass
 * `imageSizes` with it so the browser picks a matching image width.
 */
export function RestaurantLogo({
  restaurant,
  size = "md",
  className,
  imageSizes,
  priority,
}: {
  restaurant: Pick<Restaurant, "name" | "logoUrl">;
  size?: keyof typeof SIZES;
  className?: string;
  imageSizes?: string;
  priority?: boolean;
}) {
  const initials = restaurant.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={cn(
        "bg-muted border-border relative flex shrink-0 items-center justify-center overflow-hidden border",
        SIZES[size].box,
        className,
      )}
    >
      {restaurant.logoUrl ? (
        <Image
          src={restaurant.logoUrl}
          alt=""
          fill
          sizes={imageSizes ?? SIZES[size].image}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <span className="text-muted-foreground font-semibold" aria-hidden>
          {initials}
        </span>
      )}
    </div>
  );
}
