import Image from "next/image";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import { cn } from "~/lib/utils";
import type { Restaurant } from "~/types/restaurant";

const PLATE_SIZES = {
  sm: "size-24",
  md: "size-48",
  lg: "size-80",
  // As wide as its container (a column, a grid cell); give it a max width.
  fluid: "w-full aspect-square",
} as const;

type PlateProps = React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article";
  size?: keyof typeof PLATE_SIZES;
};

/**
 * A plate seen from above (from the Table redesign; colours are the --plate
 * tokens in globals.css). Content sits centred in the well; the caller keeps
 * it inside the circle (padding of about a sixth of the width keeps text
 * off the rim).
 */
export function Plate({ as: Tag = "div", size = "md", className, ...props }: PlateProps) {
  return (
    <Tag
      className={cn("plate flex shrink-0 flex-col items-center justify-center", PLATE_SIZES[size], className)}
      {...props}
    />
  );
}

/** A dish photo filling a plate's well, the rim showing around it. `alt` is empty when the dish name is beside it. */
export function PlatePhoto({ src, alt, sizes, className }: { src: string; alt: string; sizes: string; className?: string }) {
  return (
    <Plate className={className}>
      <span className="absolute inset-[11%] overflow-hidden rounded-full">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </span>
    </Plate>
  );
}

/** A restaurant's logo served on a small plate (dashboard home cards and restaurant header). */
export function PlatedLogo({
  restaurant,
  size = "md",
}: {
  restaurant: Pick<Restaurant, "name" | "logoUrl">;
  size?: "md" | "lg";
}) {
  const lg = size === "lg";
  return (
    <Plate size="sm" className={lg ? "size-24" : "size-16"}>
      <RestaurantLogo
        restaurant={restaurant}
        className={cn("rounded-full border-0", lg ? "size-[62%] text-lg" : "size-[62%] text-sm")}
        imageSizes={lg ? "60px" : "40px"}
      />
    </Plate>
  );
}

/** A rectangular plate, for rows a round plate can't hold: same rim, band and well as the plate. */
export function Platter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("platter p-8 sm:p-10", className)} {...props} />;
}
