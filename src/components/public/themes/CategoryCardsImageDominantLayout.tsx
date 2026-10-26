// src/components/public/themes/CategoryCardsImageDominantLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { Link } from "~/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { ChevronLeft, UtensilsCrossed } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { categorySectionId } from "~/lib/category-section";
import { DietaryBadges } from "~/components/public/MenuItemCard";
import { SoldOutBadge } from "~/components/public/SoldOutBadge";
import type { PublicMenuData } from "~/components/public/menu-types";

interface CategoryCardsImageDominantLayoutProps {
  menuData: PublicMenuData;
}

// Category cards first; picking one shows its items. The menu page only
// passes categories that have items, so there are no empty states here.
export function CategoryCardsImageDominantLayout({
  menuData,
}: CategoryCardsImageDominantLayoutProps) {
  const t = useTranslations("PublicMenu");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedCategory = menuData.categories.find((c) => c.id === selectedId);

  // Item pages link back to `#category-<slug>`: reopen that category.
  useEffect(() => {
    const match = menuData.categories.find(
      (c) => `#${categorySectionId(c.slug)}` === window.location.hash,
    );
    if (match) setSelectedId(match.id);
  }, [menuData.categories]);

  const showCategories = () => {
    setSelectedId(null);
    if (window.location.hash) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  };

  if (selectedCategory) {
    return (
      <div className="space-y-6">
        <div>
          <Button
            variant="outline"
            className="bg-background text-foreground border-border mb-6"
            onClick={showCategories}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            {t("allCategories")}
          </Button>
        </div>

        <h2 className="text-foreground mb-4 text-3xl font-semibold">
          <span lang={selectedCategory.lang} dir="auto">
            {selectedCategory.name}
          </span>
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {selectedCategory.menuItems.map((item) => (
            <div
              key={item.id}
              className="block h-full transition-transform duration-200 motion-safe:hover:scale-[1.02]"
            >
              <Link
                href={`/${menuData.restaurant.slug}/item/${item.slug}`}
                className={cn(
                  "group bg-card border-border flex h-full flex-col overflow-hidden rounded-lg border shadow-md transition-shadow duration-200 hover:shadow-lg",
                  item.availability === "sold_out" && "opacity-70",
                )}
              >
                {item.imageUrl && (
                  <div className="relative h-64 w-full overflow-hidden sm:h-80">
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-grow flex-col justify-between p-4">
                  <div>
                    <h3 className="text-foreground group-hover:text-primary mb-1 text-xl font-semibold transition-colors duration-200">
                      <span lang={item.lang} dir="auto">
                        {item.name}
                      </span>
                    </h3>
                    {item.description && (
                      <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                        <span lang={item.lang} dir="auto">
                          {item.description}
                        </span>
                      </p>
                    )}
                    <DietaryBadges
                      labels={item.dietaryLabels}
                      className="mt-2"
                    />
                  </div>
                  <p className="text-primary mt-4 text-lg font-bold">
                    {item.displayPrice}
                    <SoldOutBadge availability={item.availability} />
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {menuData.categories.map((category) => {
        const coverUrl = category.menuItems.find(
          (item) => item.imageUrl,
        )?.imageUrl;

        return (
          <div
            key={category.id}
            className="block transition-transform duration-200 motion-safe:hover:scale-[1.03]"
          >
            <button
              type="button"
              onClick={() => setSelectedId(category.id)}
              className="group bg-card border-border flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border text-center shadow-md transition-shadow duration-200 hover:shadow-lg"
            >
              <div className="bg-muted relative flex h-40 w-full items-center justify-center overflow-hidden">
                {coverUrl ? (
                  <>
                    <Image
                      src={coverUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Overlay for contrast */}
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
                  </>
                ) : (
                  <UtensilsCrossed
                    className="text-muted-foreground/60 h-10 w-10"
                    aria-hidden
                  />
                )}
              </div>

              <div className="flex w-full flex-grow flex-col justify-between p-4">
                <h3 className="text-foreground group-hover:text-primary mb-2 text-2xl font-semibold">
                  <span lang={category.lang} dir="auto">
                    {category.name}
                  </span>
                </h3>
                <p className="text-muted-foreground">
                  {t("itemCount", { count: category.menuItems.length })}
                </p>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
