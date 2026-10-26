// src/components/public/MenuItemCard.tsx
"use client";

import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { cn } from "~/lib/utils";
import { SoldOutBadge } from "~/components/public/SoldOutBadge";
import { useDishSheet } from "~/components/public/DishSheet";
import { DietaryBadges } from "~/components/public/DietaryBadges";

import type { PublicMenuItem } from "~/components/public/menu-types";

/*
 * How one dish looks in each menu design (lib/menu-design). Parts carry
 * `data-role` with the colour they use, so the Appearance page's preview
 * (which renders these same components) can point at the right colour.
 */

interface DishProps {
  item: PublicMenuItem;
  restaurantSlug: string;
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
}: DishProps & { className?: string; children: React.ReactNode }) {
  const sheet = useDishSheet();
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
        "group focus-visible:ring-ring/50 block focus-visible:ring-[3px] focus-visible:outline-none",
        // Sold-out dishes stay readable but step back from the rest.
        item.availability === "sold_out" && "opacity-70",
        className,
      )}
    >
      {children}
    </Link>
  );
}

const Name = ({
  item,
  className,
}: {
  item: PublicMenuItem;
  className?: string;
}) => (
  <h3
    data-role="text"
    className={cn("text-foreground font-semibold", className)}
  >
    <span lang={item.lang} dir="auto">
      {item.name}
    </span>
  </h3>
);

const Price = ({
  item,
  className,
}: {
  item: PublicMenuItem;
  className?: string;
}) => (
  <p
    data-role="primary"
    className={cn("text-primary font-bold tabular-nums", className)}
  >
    {item.displayPrice}
    <SoldOutBadge availability={item.availability} />
  </p>
);

/** Classic: a card with the text first and the photo beside it. */
export function ClassicDish({ item, restaurantSlug }: DishProps) {
  return (
    <DishLink
      item={item}
      restaurantSlug={restaurantSlug}
      className="bg-card border-border h-full rounded-xl border p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4"
    >
      <div data-role="card" className="flex h-full items-start gap-3">
        <div className="min-w-0 flex-1">
          <Name
            item={item}
            className="line-clamp-2 text-base leading-snug sm:text-lg"
          />
          {item.description && (
            <p
              data-role="text"
              className="text-muted-foreground mt-1 line-clamp-2 text-sm"
            >
              <span lang={item.lang} dir="auto">
                {item.description}
              </span>
            </p>
          )}
          <DietaryBadges labels={item.dietaryLabels} className="mt-1.5" />
          <Price item={item} className="mt-1.5" />
        </div>
        {item.imageUrl && (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="112px"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        )}
      </div>
    </DishLink>
  );
}

/** Photo grid: a square photo on top, name and price under it. */
export function PhotoDish({ item, restaurantSlug }: DishProps) {
  return (
    <DishLink
      item={item}
      restaurantSlug={restaurantSlug}
      className="bg-card border-border h-full overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md"
    >
      <div data-role="card" className="flex h-full flex-col">
        <div className="bg-muted relative flex aspect-square items-center justify-center overflow-hidden">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <UtensilsCrossed
              className="text-muted-foreground h-8 w-8 opacity-60"
              aria-hidden
            />
          )}
        </div>
        <div className="flex flex-1 flex-col p-2.5 sm:p-3">
          <Name
            item={item}
            className="line-clamp-2 text-sm leading-snug sm:text-base"
          />
          <Price item={item} className="mt-auto pt-1 text-sm sm:text-base" />
        </div>
      </div>
    </DishLink>
  );
}

/** Compact: one line per dish like a printed menu, name ····· price. */
export function CompactDish({ item, restaurantSlug }: DishProps) {
  return (
    <DishLink
      item={item}
      restaurantSlug={restaurantSlug}
      className="hover:bg-accent/40 px-3 py-3 transition-colors sm:px-4"
    >
      <div className="flex items-baseline gap-2">
        <Name item={item} className="min-w-0 text-base leading-snug" />
        <span
          className="border-border mb-1 min-w-4 flex-1 border-b border-dotted"
          aria-hidden
        />
        <Price item={item} className="shrink-0 text-base" />
      </div>
      {item.description && (
        <p
          data-role="text"
          className="text-muted-foreground mt-0.5 line-clamp-2 text-sm"
        >
          <span lang={item.lang} dir="auto">
            {item.description}
          </span>
        </p>
      )}
      <DietaryBadges labels={item.dietaryLabels} className="mt-1" />
    </DishLink>
  );
}
