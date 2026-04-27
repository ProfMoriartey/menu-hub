// src/app/themes/page.tsx
// No "use client" here - this is a Server Component

import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";

import { ClassicThemeSection } from "~/components/themes/ClassicThemeSection";
import { SidebarListThemeSection } from "~/components/themes/SidebarListThemeSection";
import { AccordionCardThemeSection } from "~/components/themes/AccordionCardThemeSection";
import { CategoryCardsImageDominantThemeSection } from "~/components/themes/CategoryCardsImageDominantThemeSection";
import { ThemesHeader } from "~/components/themes/ThemesHeader";

import type { Restaurant } from "~/types/restaurant";
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas";

// 🛑 FIX: Use a strictly typed generic instead of 'any' to satisfy ESLint
function castRestaurant<
  T extends { socialMedia?: unknown; deliveryApps?: unknown }
>(rawRestaurant: T | null | undefined): Restaurant | null {
  if (!rawRestaurant) return null;
  
  return {
    ...rawRestaurant,
    socialMedia: rawRestaurant.socialMedia as SocialMediaLinks,
    deliveryApps: rawRestaurant.deliveryApps as DeliveryAppLinks,
  } as unknown as Restaurant; 
}

export default async function ThemesPage() {
  const rawClassic = await db.query.restaurants.findFirst({
    where: eq(restaurants.theme, "classic"),
    orderBy: [desc(restaurants.createdAt)],
    with: { categories: true },
  });

  const rawSidebarList = await db.query.restaurants.findFirst({
    where: eq(restaurants.theme, "sidebar-list"),
    orderBy: [desc(restaurants.createdAt)],
    with: { categories: true },
  });

  const rawAccordionCard = await db.query.restaurants.findFirst({
    where: eq(restaurants.theme, "accordion-card"),
    orderBy: [desc(restaurants.createdAt)],
    with: { categories: true },
  });

  const rawImageDominant = await db.query.restaurants.findFirst({
    where: eq(restaurants.theme, "category-cards-image-dominant"),
    orderBy: [desc(restaurants.createdAt)],
    with: { categories: true },
  });

  return (
    <div>
      <ThemesHeader />

      <main className="container mx-auto space-y-16 px-4 py-8">
        <ClassicThemeSection
          restaurant={castRestaurant(rawClassic)}
          reverseLayout={false}
        />
        <SidebarListThemeSection
          restaurant={castRestaurant(rawSidebarList)}
          reverseLayout={true}
        />
        <AccordionCardThemeSection
          restaurant={castRestaurant(rawAccordionCard)}
          reverseLayout={false}
        />
        <CategoryCardsImageDominantThemeSection
          restaurant={castRestaurant(rawImageDominant)}
          reverseLayout={true}
        />
      </main>
    </div>
  );
}