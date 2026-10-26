// src/components/colors/MenuColorPreview.tsx
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import { cn } from "~/lib/utils";

export interface PreviewMenu {
  name: string;
  logoUrl: string | null;
  description: string | null;
  categories: {
    id: string;
    name: string;
    items: {
      id: string;
      name: string;
      description: string | null;
      displayPrice: string;
      imageUrl: string | null;
    }[];
  }[];
}

/**
 * A small copy of the restaurant's menu built from the same colour tokens as
 * the public pages. Every coloured part names its colour in `data-role`
 * (space-separated when it changes on hover), which is how the editor links
 * a hovered part to its colour control. Links are inert: it's a picture.
 */
export function MenuColorPreview({ menu }: { menu: PreviewMenu }) {
  const t = useTranslations("ColorTheme");
  const categories = menu.categories.slice(0, 4);
  const shown = categories[0];

  return (
    <div
      data-role="background"
      className="bg-background text-foreground space-y-4 p-4 sm:p-5"
    >
      <header
        data-role="card"
        className="bg-card flex gap-3 rounded-lg p-4 shadow-sm"
      >
        <RestaurantLogo restaurant={menu} size="lg" />
        <div className="min-w-0">
          <p data-role="text" className="truncate text-xl font-bold">
            {menu.name}
          </p>
          <p
            data-role="text"
            className="text-muted-foreground line-clamp-2 text-sm"
          >
            {menu.description ?? t("sampleDescription")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
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
        </div>
      </header>

      <nav
        data-role="card"
        className="bg-card flex gap-2 overflow-x-auto rounded-lg p-2 shadow-sm"
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

      <div className="grid gap-3 sm:grid-cols-2">
        {(shown?.items.length
          ? shown.items.slice(0, 4)
          : [
              {
                id: "sample",
                name: t("sampleDish"),
                description: t("sampleDishDescription"),
                displayPrice: "12.50",
                imageUrl: null,
              },
            ]
        ).map((item) => (
          <div
            key={item.id}
            data-role="card"
            className="bg-card flex gap-3 rounded-lg p-3 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <p data-role="text" className="truncate font-semibold">
                {item.name}
              </p>
              {item.description && (
                <p
                  data-role="text"
                  className="text-muted-foreground line-clamp-2 text-sm"
                >
                  {item.description}
                </p>
              )}
              <p data-role="primary" className="text-primary mt-1 font-bold">
                {item.displayPrice}
              </p>
            </div>
            {item.imageUrl && (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
