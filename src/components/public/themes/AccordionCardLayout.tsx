// src/components/public/themes/AccordionCardLayout.tsx
"use client";

import { useState } from "react";
import { Link } from "~/i18n/navigation";
import Image from "next/image";

import { cn } from "~/lib/utils";

import { categorySectionId } from "~/lib/category-section";
import { DietaryBadges } from "~/components/public/MenuItemCard";
import { SoldOutBadge } from "~/components/public/SoldOutBadge";
import type { PublicMenuData } from "~/components/public/menu-types";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

interface AccordionCardLayoutProps {
  menuData: PublicMenuData;
  // True while the guest searches or filters: every matching category opens,
  // so results aren't hidden in closed panels.
  expandAll?: boolean;
}

// The menu page only passes categories that have items, so there are no
// empty states to handle here.
export function AccordionCardLayout({
  menuData,
  expandAll = false,
}: AccordionCardLayoutProps) {
  const [openId, setOpenId] = useState("");
  const accordionProps = expandAll
    ? ({
        type: "multiple",
        value: menuData.categories.map((c) => c.id),
      } as const)
    : ({
        type: "single",
        collapsible: true,
        value: openId,
        onValueChange: setOpenId,
      } as const);

  return (
    <div className="space-y-6">
      <Accordion
        key={expandAll ? "all" : "one"}
        {...accordionProps}
        className="w-full"
      >
        {menuData.categories.map((category) => (
          <div
            key={category.id}
            id={categorySectionId(category.slug)}
            className="mb-4 scroll-mt-4"
          >
            <AccordionItem
              value={category.id}
              className="bg-card border-border rounded-lg border shadow-md"
            >
              <AccordionTrigger className="text-foreground px-6 py-4 text-start text-xl font-semibold hover:no-underline">
                {category.name}
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="block transition-transform duration-200 motion-safe:hover:scale-[1.02]"
                    >
                      <Link
                        href={`/${menuData.restaurant.slug}/item/${item.slug}`}
                        className={cn(
                          "group bg-background border-border flex h-full flex-col items-center rounded-lg border p-4 text-center shadow-sm transition-shadow duration-200 hover:shadow-md",
                          item.availability === "sold_out" && "opacity-70",
                        )}
                      >
                        {item.imageUrl && (
                          <div className="relative mb-4 h-32 w-full overflow-hidden rounded-md">
                            <Image
                              src={item.imageUrl}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                              className="rounded-md object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          </div>
                        )}
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
                          className="mt-2 mb-2 justify-center"
                        />
                        <p className="text-primary mt-auto pt-2 text-lg font-bold">
                          {item.displayPrice}
                          <SoldOutBadge availability={item.availability} />
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </div>
        ))}
      </Accordion>
    </div>
  );
}
