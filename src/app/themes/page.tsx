// src/app/themes/page.tsx
// No "use client" here - this is a Server Component

import { cn } from "~/lib/utils";
import type { Restaurant } from "~/types/restaurant";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";

// Import the new client components for each theme section
import { ClassicThemeSection } from "~/components/themes/ClassicThemeSection";
import { SidebarListThemeSection } from "~/components/themes/SidebarListThemeSection";
import { AccordionCardThemeSection } from "~/components/themes/AccordionCardThemeSection";
import { CategoryCardsImageDominantThemeSection } from "~/components/themes/CategoryCardsImageDominantThemeSection";

// REMOVED: import { motion } from "framer-motion"; // No longer needed here
// ADDED: Import the new ThemesHeader client component
import { ThemesHeader } from "~/components/themes/ThemesHeader";

export default async function ThemesPage() {
  // Fetch the latest restaurant for each theme
  const latestClassicRestaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.theme, "classic"),
    orderBy: [desc(restaurants.createdAt)],
    with: { categories: true },
  });

  const latestSidebarListRestaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.theme, "sidebar-list"),
    orderBy: [desc(restaurants.createdAt)],
    with: { categories: true },
  });

  const latestAccordionCardRestaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.theme, "accordion-card"),
    orderBy: [desc(restaurants.createdAt)],
    with: { categories: true },
  });

  const latestCategoryCardsImageDominantRestaurant =
    await db.query.restaurants.findFirst({
      where: eq(restaurants.theme, "category-cards-image-dominant"),
      orderBy: [desc(restaurants.createdAt)],
      with: { categories: true },
    });

  // REMOVED: headerItemVariants as they are now in ThemesHeader.tsx
  // const headerItemVariants = {
  //   hidden: { opacity: 0, y: 20 },
  //   visible: { opacity: 1, y: 0 },
  // };

  return (
    <div
      className={cn("min-h-screen p-4 sm:p-8", "bg-background text-foreground")}
    >
      {/* RENDERED: The new ThemesHeader client component */}
      <ThemesHeader />

      <main className="container mx-auto space-y-16 px-4 py-8">
        <ClassicThemeSection
          restaurant={latestClassicRestaurant ?? null}
          reverseLayout={false}
        />
        <SidebarListThemeSection
          restaurant={latestSidebarListRestaurant ?? null}
          reverseLayout={true}
        />
        <AccordionCardThemeSection
          restaurant={latestAccordionCardRestaurant ?? null}
          reverseLayout={false}
        />
        <CategoryCardsImageDominantThemeSection
          restaurant={latestCategoryCardsImageDominantRestaurant ?? null}
          reverseLayout={true}
        />
      </main>
    </div>
  );
}
