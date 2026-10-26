// src/components/colors/MenuColorPreview.tsx
"use client";

import { useTranslations } from "next-intl";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import {
  ClassicDish,
  CompactDish,
  PhotoDish,
} from "~/components/public/MenuItemCard";
import { cn } from "~/lib/utils";

import type { PublicMenuItem } from "~/components/public/menu-types";
import type { MenuDesign } from "~/lib/menu-design";

export interface PreviewMenu {
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  categories: { id: string; name: string; items: PublicMenuItem[] }[];
}

const SAMPLE_ITEM: Omit<PublicMenuItem, "name" | "description"> = {
  id: "sample",
  slug: "sample",
  price: "12.50",
  displayPrice: "12.50",
  ingredients: null,
  dietaryLabels: null,
  availability: "available",
  imageUrl: null,
};

/**
 * A small copy of the restaurant's menu in the chosen design, built from the
 * same colour tokens and dish components as the public pages. Coloured
 * parts name their colour in `data-role` (space-separated when it changes on
 * hover), which is how the editor links a hovered part to its control.
 * The editor makes the links inert: it's a picture.
 */
export function MenuColorPreview({
  menu,
  design,
}: {
  menu: PreviewMenu;
  design: MenuDesign;
}) {
  const t = useTranslations("ColorTheme");
  const categories = menu.categories.slice(0, 4);
  const items = categories[0]?.items.length
    ? categories[0].items.slice(0, design === "photo-grid" ? 4 : 3)
    : [
        {
          ...SAMPLE_ITEM,
          name: t("sampleDish"),
          description: t("sampleDishDescription"),
        },
      ];
  const Dish =
    design === "photo-grid"
      ? PhotoDish
      : design === "compact"
        ? CompactDish
        : ClassicDish;

  return (
    <div
      data-role="background"
      className="bg-background text-foreground space-y-3 p-3 sm:p-4"
    >
      <header
        data-role="card"
        className="bg-card border-border rounded-lg border p-3"
      >
        <div className="flex items-start gap-3">
          <RestaurantLogo
            restaurant={menu}
            className="h-12 w-12 rounded-xl text-base"
            imageSizes="48px"
          />
          <div className="min-w-0">
            <p
              data-role="text"
              className="truncate text-lg leading-tight font-bold"
            >
              {menu.name}
            </p>
            <p
              data-role="text"
              className="text-muted-foreground line-clamp-1 text-sm"
            >
              {menu.description ?? t("sampleDescription")}
            </p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span
            data-role="secondary"
            className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-medium"
          >
            {t("sampleDetails")}
          </span>
          <span
            data-role="primary"
            className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-medium"
          >
            {t("sampleOrder")}
          </span>
        </div>
      </header>

      <nav
        data-role="card"
        className="bg-card flex gap-2 overflow-x-auto rounded-lg p-1.5 shadow-sm"
      >
        {(categories.length > 0
          ? categories
          : [{ id: "sample", name: t("sampleCategory") }]
        ).map((category, index) => (
          <span
            key={category.id}
            data-role={index === 0 ? "primary" : "secondary accent"}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              index === 0
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {category.name}
          </span>
        ))}
      </nav>

      <p data-role="text" className="text-foreground text-lg font-semibold">
        {categories[0]?.name ?? t("sampleCategory")}
      </p>
      {design === "compact" ? (
        <ul
          data-role="card"
          className="bg-card border-border divide-border divide-y overflow-hidden rounded-xl border"
        >
          {items.map((item) => (
            <li key={item.id}>
              <Dish item={item} restaurantSlug={menu.slug} />
            </li>
          ))}
        </ul>
      ) : (
        <div
          className={cn(
            "grid gap-3",
            design === "photo-grid" ? "grid-cols-2" : "",
          )}
        >
          {items.map((item) => (
            <Dish key={item.id} item={item} restaurantSlug={menu.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
