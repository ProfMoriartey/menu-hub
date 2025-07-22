// src/components/public/MenuDisplayClient.tsx
"use client";

import type { MenuItem, Category } from "~/types/restaurant";
import { ClassicMenuLayout } from "~/components/public/themes/ClassicMenuLayout";
import { SidebarListLayout } from "~/components/public/themes/SidebarListLayout";
import { AccordionCardLayout } from "~/components/public/themes/AccordionCardLayout";
import { CategoryCardsImageDominantLayout } from "~/components/public/themes/CategoryCardsImageDominantLayout"; // Import the new layout component

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

interface MenuDisplayClientProps {
  menuData: RestaurantMenuData;
  theme: string;
}

export function MenuDisplayClient({ menuData, theme }: MenuDisplayClientProps) {
  switch (theme) {
    case "classic":
      return <ClassicMenuLayout menuData={menuData} />;
    case "sidebar-list":
      return <SidebarListLayout menuData={menuData} />;
    case "accordion-card":
      return <AccordionCardLayout menuData={menuData} />;
    case "category-cards-image-dominant": // New theme case
      return <CategoryCardsImageDominantLayout menuData={menuData} />;
    default:
      return <ClassicMenuLayout menuData={menuData} />;
  }
}
