// app/page.tsx
import { db } from "~/server/db";

import type { Restaurant } from "~/types/restaurant";
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas"; // Add this import

import { FeaturedRestaurantsSection } from "~/components/home/FeaturedRestaurantsSection";
import { cn } from "~/lib/utils";
import { getTranslations } from "next-intl/server";
import { HeroScroll } from "~/components/home/HeroSectionScroll";
import { AboutScroll } from "~/components/home/AboutSectionScroll";
import { ThemesScroll } from "~/components/home/ThemesSectionScroll";
import { ContactScroll } from "~/components/home/ContactSectionScroll";
import { a } from "framer-motion/client";

export default async function HomePage() {
  const t = await getTranslations("hero");

  // Fetch raw data without the strict type hint
  const rawRestaurants = await db.query.restaurants.findMany(
    {
      where: (restaurant, { eq }) => eq(restaurant.isDisplayed, true),
      limit: 6,
      orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
      with: {
        categories: true, 
      },
    },
  );

  // Map the results and cast the JSONB fields
  const featuredRestaurants: Restaurant[] = rawRestaurants.map((restaurant) => ({
    ...restaurant,
    socialMedia: restaurant.socialMedia as SocialMediaLinks,
    deliveryApps: restaurant.deliveryApps as DeliveryAppLinks,
  }));

  return (
    <div
      className={cn("bg-background text-foreground flex min-h-screen flex-col")}
    >
      <HeroScroll />
      <AboutScroll />
      <FeaturedRestaurantsSection restaurants={featuredRestaurants} />
      <ThemesScroll />
      <ContactScroll />

      <footer className="bg-card text-muted-foreground w-full py-8 text-center text-sm">
        <p>
          &copy; {new Date().getFullYear()} {<a href="https://www.ahmedalhusaini.com">Ahmed Alhusaini</a>}. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}