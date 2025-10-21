// src/app/themes/page.tsx
// No "use client" here - this is a Server Component

import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";

// Import the new client components for each theme section
import { ClassicThemeSection } from "~/components/themes/ClassicThemeSection";
import { SidebarListThemeSection } from "~/components/themes/SidebarListThemeSection";
import { AccordionCardThemeSection } from "~/components/themes/AccordionCardThemeSection";
import { CategoryCardsImageDominantThemeSection } from "~/components/themes/CategoryCardsImageDominantThemeSection";

// ADDED: Import the ThemesHeader client component
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

  return (
    // The main page container now has a multi-color background gradient
    // transitioning through various theme colors.
    <div>
      {/* RENDERED: The ThemesHeader client component */}
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
