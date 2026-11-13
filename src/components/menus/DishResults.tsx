// src/components/menus/DishResults.tsx
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { LeaderRow } from "~/components/table/LeaderRow";
import { PlatePhoto, Platter } from "~/components/table/Plate";
import { Stamp } from "~/components/table/Stamp";
import type { DishResult } from "~/app/actions/search";
import type { DirectoryVenue } from "~/lib/menus-directory";

/** Dishes found across every menu, as leader rows on a platter, each linking to its page on its menu. */
export function DishResults({
  dishes,
  venues,
}: {
  dishes: DishResult[];
  venues: Map<string, DirectoryVenue>;
}) {
  const t = useTranslations("MenusPage");

  return (
    <Platter className="p-5 sm:p-7">
      <ul className="divide-plate-rim-shadow divide-y">
        {dishes.map((dish) => {
          const venue = venues.get(dish.restaurantId);
          if (!venue) return null;
          return (
            <li key={dish.id}>
              <Link
                href={`/${venue.slug}/item/${dish.slug}`}
                className="flex min-h-11 items-center gap-3 rounded-lg py-3 outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[var(--table-focus)]"
              >
                <PlatePhoto src={dish.imageUrl} alt="" size={56} />
                <LeaderRow
                  as="div"
                  className="min-w-0 flex-1"
                  muted={dish.soldOut}
                  name={<span lang={dish.lang}>{dish.name}</span>}
                  price={<bdi dir="ltr">{dish.price}</bdi>}
                >
                  <p className="text-ink-muted mt-0.5 flex flex-wrap items-center gap-x-2 text-sm">
                    <span className="line-clamp-1">{venue.name}</span>
                    {dish.soldOut && <Stamp className="text-[0.6875rem]">{t("soldOut")}</Stamp>}
                  </p>
                </LeaderRow>
              </Link>
            </li>
          );
        })}
      </ul>
    </Platter>
  );
}
