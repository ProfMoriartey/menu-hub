// src/components/public/MenuItemCard.tsx
"use client";

import { Link } from "~/i18n/navigation";
import { cn } from "~/lib/utils";
import { SoldOutBadge } from "~/components/public/SoldOutBadge";
import { useDishSheet } from "~/components/public/DishSheet";
import { DietaryBadges } from "~/components/public/DietaryBadges";
import { LeaderRow } from "~/components/table/LeaderRow";
import { PlatePhoto } from "~/components/table/Plate";

import type { PublicMenuItem } from "~/components/public/menu-types";

/*
 * How one dish looks in each menu design (lib/menu-design). Parts carry
 * `data-role` with the colour they use, so the Appearance page's preview
 * (which renders these same components) can point at the right colour.
 */

interface DishProps {
  item: PublicMenuItem;
  restaurantSlug: string;
  // The first dishes on screen: their photos load before the rest.
  priority?: boolean;
}

/**
 * A dish's link. It points to the dish page (shareable, crawlable, and what
 * a long-press or new tab opens); a plain tap opens the bottom sheet
 * instead, so guests keep their place in the menu.
 */
function DishLink({
  item,
  restaurantSlug,
  className,
  children,
}: Omit<DishProps, "priority"> & {
  className?: string;
  children: React.ReactNode;
}) {
  const sheet = useDishSheet();
  if (sheet?.inPlace)
    return (
      <button
        type="button"
        onClick={() => sheet.open(item)}
        className={cn("group block w-full text-start", className)}
      >
        {children}
      </button>
    );
  return (
    <Link
      href={`/${restaurantSlug}/item/${item.slug}`}
      onClick={(e) => {
        if (
          !sheet ||
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        )
          return;
        e.preventDefault();
        sheet.open(item);
      }}
      className={cn(
        // Focus: the world's outline (globals.css .table-world).
        "group block",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Name ····· price, in the world's leader row; the price in the brand ink. */
function DishLeader({
  item,
  nameClassName,
}: {
  item: PublicMenuItem;
  nameClassName?: string;
}) {
  return (
    <LeaderRow
      data-role="text"
      nameAs="h3"
      name={
        <span lang={item.lang} dir="auto">
          {item.name}
        </span>
      }
      price={<span data-role="primary"><bdi dir="ltr">{item.displayPrice}</bdi></span>}
      // Sold out: name and price step back; the stamp says why.
      muted={item.availability === "sold_out"}
      nameClassName={cn("text-foreground", nameClassName)}
      priceClassName="text-primary"
    />
  );
}

const Description = ({ item }: { item: PublicMenuItem }) =>
  item.description ? (
    <p data-role="text" className="text-muted-foreground mt-1 line-clamp-2 text-sm">
      <span lang={item.lang} dir="auto">
        {item.description}
      </span>
    </p>
  ) : null;

// In the flow under the name, so it never covers it (any language, RTL too).
const SoldOut = ({ item }: { item: PublicMenuItem }) => (
  <SoldOutBadge availability={item.availability} className="ms-1 mt-2.5 mb-1" />
);

const CARD = "bg-card border-border/60 h-full rounded-2xl border shadow-[0_2px_6px_rgb(34_26_23/0.08)] transition-shadow hover:shadow-[0_6px_14px_rgb(34_26_23/0.12)]";

/** Classic: a white card, the text first and the dish on a round plate beside it. */
export function ClassicDish({ item, restaurantSlug, priority }: DishProps) {
  return (
    <DishLink item={item} restaurantSlug={restaurantSlug} className={cn(CARD, "p-3 sm:p-4")}>
      <div data-role="card" className="flex h-full items-start gap-3">
        <div className="min-w-0 flex-1">
          <DishLeader item={item} nameClassName="sm:text-lg" />
          <Description item={item} />
          <DietaryBadges labels={item.dietaryLabels} className="mt-1.5" />
          <SoldOut item={item} />
        </div>
        {item.imageUrl && (
          <PlatePhoto src={item.imageUrl} alt="" size={96} priority={priority} />
        )}
      </div>
    </DishLink>
  );
}

/** Photo grid: a bigger plate on top, the leader row under it. */
export function PhotoDish({ item, restaurantSlug, priority }: DishProps) {
  return (
    <DishLink item={item} restaurantSlug={restaurantSlug} className={cn(CARD, "p-3")}>
      <div data-role="card" className="flex h-full flex-col">
        {/* No photo: an empty plate, never an icon or a broken image. */}
        <PlatePhoto
          src={item.imageUrl}
          alt=""
          size={128}
          priority={priority}
          // Stays round when the column is narrower than the plate (320 px).
          className="mx-auto mb-3 aspect-square !h-auto max-w-full"
        />
        <DishLeader item={item} nameClassName="text-sm sm:text-base" />
        <SoldOut item={item} />
      </div>
    </DishLink>
  );
}

/** Compact: no photos, one leader row per dish like a printed menu. */
export function CompactDish({ item, restaurantSlug }: DishProps) {
  return (
    <DishLink
      item={item}
      restaurantSlug={restaurantSlug}
      className="hover:bg-muted px-3 py-2.5 transition-colors sm:px-4"
    >
      <DishLeader item={item} />
      <Description item={item} />
      <DietaryBadges labels={item.dietaryLabels} className="mt-1" />
      <SoldOut item={item} />
    </DishLink>
  );
}
