// src/components/menus/DishResults.tsx
import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import type { DishResult } from "~/app/actions/search";
import type { DirectoryVenue } from "~/lib/menus-directory";

/** Dishes found across every menu, each linking to its page on its menu. */
export function DishResults({
  dishes,
  venues,
}: {
  dishes: DishResult[];
  venues: Map<string, DirectoryVenue>;
}) {
  const t = useTranslations("MenusPage");

  return (
    <ul className="divide-border border-border bg-card divide-y overflow-hidden rounded-2xl border">
      {dishes.map((dish) => {
        const venue = venues.get(dish.restaurantId);
        if (!venue) return null;
        return (
          <li key={dish.id}>
            <Link
              href={`/${venue.slug}/item/${dish.slug}`}
              className="hover:bg-accent/40 focus-visible:bg-accent/40 flex items-center gap-3 p-3 outline-none"
            >
              <div className="bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                {dish.imageUrl ? (
                  <Image src={dish.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <UtensilsCrossed
                    className="text-muted-foreground absolute inset-0 m-auto h-6 w-6"
                    aria-hidden
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-medium" lang={dish.lang}>
                  {dish.name}
                </p>
                <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                  <RestaurantLogo restaurant={venue} className="h-5 w-5 rounded-md text-[9px]" imageSizes="20px" />
                  <span className="line-clamp-1">{venue.name}</span>
                </p>
              </div>
              <div className="shrink-0 text-end">
                <p className="font-semibold tabular-nums" dir="ltr">
                  {dish.price}
                </p>
                {dish.soldOut && (
                  <p className="text-muted-foreground text-xs">{t("soldOut")}</p>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
