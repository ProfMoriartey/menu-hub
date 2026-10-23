// src/components/public/themes/CategoryCardsImageDominantLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { Link } from "~/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { ChevronLeft, UtensilsCrossed } from "lucide-react";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";

import { categorySectionId } from "~/components/public/CategoryNav";
import { DietaryBadges } from "~/components/public/MenuItemCard";
import { SoldOutBadge } from "~/components/public/SoldOutBadge";
import type { MenuItem, Category } from "~/types/restaurant";

interface RestaurantMenuData {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    description: string | null;
  };
  categories: (Category & { menuItems: MenuItem[] })[];
}

interface CategoryCardsImageDominantLayoutProps {
  menuData: RestaurantMenuData;
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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="outline"
            className="bg-background text-foreground border-border mb-6"
            onClick={showCategories}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            {t("allCategories")}
          </Button>
        </motion.div>

        <h2 className="text-foreground mb-4 text-3xl font-semibold">
          {selectedCategory.name}
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {selectedCategory.menuItems.map((item, itemIndex) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: itemIndex * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="block h-full"
            >
              <Link
                href={`/${menuData.restaurant.slug}/item/${item.slug}`}
                className="group bg-card border-border flex h-full flex-col overflow-hidden rounded-lg border shadow-md transition-shadow duration-200 hover:shadow-lg"
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
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                        {item.description}
                      </p>
                    )}
                    <DietaryBadges
                      labels={item.dietaryLabels}
                      className="mt-2"
                    />
                  </div>
                  <p className="text-primary mt-4 text-lg font-bold">
                    {item.price} {menuData.restaurant.currency}
                    <SoldOutBadge availability={item.availability} />
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {menuData.categories.map((category, categoryIndex) => {
        const coverUrl = category.menuItems.find(
          (item) => item.imageUrl,
        )?.imageUrl;

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.03 }}
            className="block"
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
                  {category.name}
                </h3>
                <p className="text-muted-foreground">
                  {t("itemCount", { count: category.menuItems.length })}
                </p>
              </div>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
