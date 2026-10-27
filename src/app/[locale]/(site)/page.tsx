// app/page.tsx
import { db } from "~/server/db";

import type { Restaurant } from "~/types/restaurant";
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas"; // Add this import

import { FeaturedRestaurantsSection } from "~/components/home/FeaturedRestaurantsSection";
import { cn } from "~/lib/utils";
import { getLocale, getTranslations } from "next-intl/server";
import { countryName } from "~/lib/countries";
import { HeroScroll } from "~/components/home/HeroSectionScroll";
import { AboutScroll } from "~/components/home/AboutSectionScroll";
import { ThemesScroll } from "~/components/home/ThemesSectionScroll";
import { getDemoMenus } from "~/server/demo-menu";
import { ContactScroll } from "~/components/home/ContactSectionScroll";
import GroovySittingDoodle from "~/components/svg/GroovySittingDoodle";
import CoffeeDoodle from "~/components/svg/CoffeeDoodle";
import SittingDoodle from "~/components/svg/SittingDoodle";
import ZombieingDoodle from "~/components/svg/ZombieingDoodle";
import { a } from "framer-motion/client";

export default async function HomePage() {
  const t = await getTranslations("hero");
  const locale = await getLocale();

  // Fetch raw data without the strict type hint
  const rawRestaurants = await db.query.restaurants.findMany({
    where: (restaurant, { and, eq }) =>
      and(eq(restaurant.isDisplayed, true), eq(restaurant.isActive, true)),
    limit: 6,
    orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
  });

  // Map the results and cast the JSONB fields
  const featuredRestaurants: Restaurant[] = rawRestaurants.map(
    (restaurant) => ({
      ...restaurant,
      // Named here: browsers name some countries differently from Node.
      country: countryName(restaurant.country, locale),
      categories: [],
      socialMedia: restaurant.socialMedia as SocialMediaLinks,
      deliveryApps: restaurant.deliveryApps as DeliveryAppLinks,
    }),
  );

  return (
    <div
      className={cn("bg-background text-foreground flex min-h-screen flex-col")}
    >
      <HeroScroll
        doodle={
          <GroovySittingDoodle className="text-background h-auto w-full" />
        }
      />
      <AboutScroll
        doodle={
          <CoffeeDoodle
            className="h-auto w-full"
            doodleFillColorLight="text-attention"
            doodleFillColorDark="dark:text-white"
            doodleStrokeColorLight="text-foreground"
            doodleStrokeColorDark="dark:text-black"
          />
        }
      />
      <FeaturedRestaurantsSection restaurants={featuredRestaurants} />
      <ThemesScroll
        demo={getDemoMenus()}
        doodle={
          <SittingDoodle
            className="h-auto w-full"
            doodleFillColorLight="text-attention"
            doodleFillColorDark="dark:text-white"
            doodleStrokeColorLight="text-foreground"
            doodleStrokeColorDark="dark:text-black"
          />
        }
      />
      <ContactScroll
        doodle={
          <ZombieingDoodle
            className="h-auto w-full"
            doodleFillColorLight="text-background" // Default light fill
            doodleFillColorDark="dark:text-attention" // Default dark fill
            doodleStrokeColorLight="text-foreground" // Default light stroke
            doodleStrokeColorDark="dark:text-primary-foreground" // Default dark stroke
          />
        }
      />

      <footer className="bg-card text-muted-foreground w-full py-8 text-center text-sm">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          {<a href="https://www.ahmedalhusaini.com">Ahmed Alhusaini</a>}. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
