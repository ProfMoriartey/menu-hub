// src/components/public/MenuItemDetail.tsx
import { Link } from "~/i18n/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { LeaderRow } from "~/components/table/LeaderRow";
import { PlatePhoto } from "~/components/table/Plate";
import { categorySectionId } from "~/lib/category-section";
import { DietaryBadges } from "~/components/public/DietaryBadges";
import { SoldOutBadge } from "~/components/public/SoldOutBadge";
import { PublicPageControls } from "~/components/public/PublicPageControls";

import type { PublicMenuItem } from "~/components/public/menu-types";
import type { Category, Restaurant } from "~/types/restaurant";

interface MenuItemDetailProps {
  item: PublicMenuItem & {
    category: Pick<Category, "name" | "slug"> & { lang?: string };
  };
  restaurant: Pick<Restaurant, "name" | "slug" | "theme">;
}

// A single item's page. Rendered on the server: nothing on it needs to run in
// the browser except the language and theme switches.
export function MenuItemDetail({ item, restaurant }: MenuItemDetailProps) {
  const t = useTranslations("menuItemDetailPage");
  // Back to the item's own category, not the top of the menu.
  const menuHref = `/${restaurant.slug}#${categorySectionId(item.category.slug)}`;

  return (
    <div className={`theme-${restaurant.theme ?? "default"}`}>
      <div className="container mx-auto max-w-3xl px-4 py-4 sm:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="ghost"
            className="text-on-ground hover:bg-on-ground/10 hover:text-on-ground -ms-2 h-11 rounded-full"
            asChild
          >
            <Link href={menuHref}>
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
              {t("backToMenu")}
            </Link>
          </Button>
          <PublicPageControls className="bg-card ms-auto rounded-full p-0.5 shadow-sm" />
        </div>

        {/* A white place card; the dish sits on a large round plate. */}
        <article className="bg-card text-card-foreground border-border/60 rounded-3xl border p-6 shadow-[0_2px_6px_rgb(34_26_23/0.08)] sm:p-8">
          {item.imageUrl && (
            <PlatePhoto
              src={item.imageUrl}
              alt={item.name}
              size={288}
              priority
              className="mx-auto mb-6 block aspect-square !h-auto max-w-full"
            />
          )}

          <div className="space-y-4">
            <p className="text-muted-foreground text-sm font-medium">
              <Link
                href={`/${restaurant.slug}`}
                className="hover:text-foreground inline-flex min-h-11 items-center hover:underline"
              >
                {restaurant.name}
              </Link>
              <span aria-hidden> · </span>
              <Link
                href={menuHref}
                className="hover:text-foreground inline-flex min-h-11 items-center hover:underline"
              >
                <span lang={item.category.lang} dir="auto">
                  {item.category.name}
                </span>
              </Link>
            </p>
            <LeaderRow
              nameAs="h1"
              name={
                <span lang={item.lang} dir="auto">
                  {item.name}
                </span>
              }
              price={item.displayPrice}
              nameClassName="text-foreground text-2xl leading-tight font-extrabold sm:text-3xl"
              priceClassName="text-primary text-xl sm:text-2xl"
            />
            <SoldOutBadge availability={item.availability} className="ms-1" />

            {item.description && (
              <p className="text-muted-foreground text-lg leading-relaxed">
                <span lang={item.lang} dir="auto">
                  {item.description}
                </span>
              </p>
            )}

            <DietaryBadges labels={item.dietaryLabels} />

            {item.ingredients && (
              <div className="border-border border-t pt-4">
                <h2 className="text-foreground mb-2 text-lg font-semibold">
                  {t("ingredientsLabel")}
                </h2>
                <p className="text-muted-foreground">{item.ingredients}</p>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
