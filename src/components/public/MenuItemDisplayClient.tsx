// src/components/public/MenuItemDisplayClient.tsx
"use client";

import { Link } from "~/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { categorySectionId } from "~/components/public/CategoryNav";
import { DietaryBadges } from "~/components/public/MenuItemCard";
import { SoldOutBadge } from "~/components/public/SoldOutBadge";
import { PublicPageControls } from "~/components/public/PublicPageControls";
import type { MenuItem, Category } from "~/types/restaurant";

interface RestaurantForMenuItemDisplay {
  id: string;
  name: string;
  slug: string;
  currency: string;
  theme: string | null;
}

interface MenuItemDisplayClientProps {
  item: MenuItem & {
    restaurant: RestaurantForMenuItemDisplay;
    category: Category;
  };
  // Formatted on the server for the guest's language (lib/format-price).
  displayPrice: string;
  restaurantSlug: string;
  theme: string;
}

export function MenuItemDisplayClient({
  item,
  displayPrice,
  restaurantSlug,
  theme,
}: MenuItemDisplayClientProps) {
  const t = useTranslations("menuItemDetailPage");
  // Back to the item's own category, not the top of the menu.
  const menuHref = `/${restaurantSlug}#${categorySectionId(item.category.slug)}`;

  return (
    <div
      className={cn(
        "bg-background text-foreground min-h-screen",
        `theme-${theme}`,
      )}
    >
      <div className="container mx-auto max-w-3xl px-4 py-4 sm:py-8">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Button variant="ghost" className="-ms-2" asChild>
            <Link href={menuHref}>
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
              {t("backToMenu")}
            </Link>
          </Button>
          <PublicPageControls />
        </div>

        <article className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
          {item.imageUrl && (
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                priority
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-4 p-6 sm:p-8">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                <Link
                  href={`/${restaurantSlug}`}
                  className="hover:text-foreground hover:underline"
                >
                  {item.restaurant.name}
                </Link>
                <span aria-hidden> · </span>
                <Link
                  href={menuHref}
                  className="hover:text-foreground hover:underline"
                >
                  {item.category.name}
                </Link>
              </p>
              <h1 className="text-foreground mt-1 text-3xl font-bold sm:text-4xl">
                {item.name}
              </h1>
            </div>

            <p className="text-primary text-2xl font-bold">
              {displayPrice}
              <SoldOutBadge availability={item.availability} />
            </p>

            {item.description && (
              <p className="text-muted-foreground text-lg leading-relaxed">
                {item.description}
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
