// src/components/public/MenuItemDetail.tsx
import { Link } from "~/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { categorySectionId } from "~/lib/category-section";
import { DietaryBadges } from "~/components/public/MenuItemCard";
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
    <div
      className={cn(
        "bg-background text-foreground min-h-screen",
        `theme-${restaurant.theme ?? "default"}`,
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
                  href={`/${restaurant.slug}`}
                  className="hover:text-foreground hover:underline"
                >
                  {restaurant.name}
                </Link>
                <span aria-hidden> · </span>
                <Link
                  href={menuHref}
                  className="hover:text-foreground hover:underline"
                >
                  <span lang={item.category.lang} dir="auto">
                    {item.category.name}
                  </span>
                </Link>
              </p>
              <h1 className="text-foreground mt-1 text-3xl font-bold sm:text-4xl">
                <span lang={item.lang} dir="auto">
                  {item.name}
                </span>
              </h1>
            </div>

            <p className="text-primary text-2xl font-bold">
              {item.displayPrice}
              <SoldOutBadge availability={item.availability} />
            </p>

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
