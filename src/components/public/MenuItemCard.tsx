// src/components/public/MenuItemCard.tsx
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { cn } from "~/lib/utils";
import { DIETARY_LABEL_KEYS } from "~/lib/dietary-labels";
import { SoldOutBadge } from "~/components/public/SoldOutBadge";

import type { DietaryLabel, MenuItem } from "~/types/restaurant";

export function DietaryBadges({
  labels,
  className,
}: {
  labels: DietaryLabel[] | null;
  className?: string;
}) {
  const t = useTranslations("MenuEditor.dietary");
  if (!labels?.length) return null;

  return (
    <ul className={cn("flex flex-wrap gap-1", className)}>
      {labels.map((label) => (
        <li
          key={label}
          className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-semibold"
        >
          {t(DIETARY_LABEL_KEYS[label])}
        </li>
      ))}
    </ul>
  );
}

/**
 * One item on a list-style menu (classic and sidebar themes). Items without a
 * photo get no image box at all, so the text uses the full width instead of
 * sitting next to a placeholder.
 */
export function MenuItemCard({
  item,
  restaurantSlug,
  currency,
  imagePosition = "end",
}: {
  item: MenuItem;
  restaurantSlug: string;
  currency: string;
  imagePosition?: "start" | "end";
}) {
  return (
    <Link
      href={`/${restaurantSlug}/item/${item.slug}`}
      className="group bg-card flex h-full items-start gap-4 rounded-lg p-4 shadow-md transition-shadow duration-200 hover:shadow-lg"
    >
      <div className="min-w-0 flex-grow">
        <h3 className="text-foreground group-hover:text-primary text-lg font-semibold transition-colors duration-200 sm:text-xl">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
            {item.description}
          </p>
        )}
        <DietaryBadges labels={item.dietaryLabels} className="mt-2" />
        <p className="text-primary mt-2 text-lg font-bold">
          {item.price} {currency}
          <SoldOutBadge availability={item.availability} />
        </p>
      </div>

      {item.imageUrl && (
        <div
          className={cn(
            "relative h-24 w-24 shrink-0 overflow-hidden rounded-md sm:h-28 sm:w-28",
            imagePosition === "start" && "order-first",
          )}
        >
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="112px"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      )}
    </Link>
  );
}
