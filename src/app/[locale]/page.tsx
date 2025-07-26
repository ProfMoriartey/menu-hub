// app/page.tsx
import { db } from "~/server/db";

import type { Restaurant } from "~/types/restaurant";

import { HeroSection } from "~/components/home/HeroSection";
import { AboutHomeSection } from "~/components/home/AboutHomeSection";
import { FeaturedRestaurantsSection } from "~/components/home/FeaturedRestaurantsSection";
import { ThemesHomeSection } from "~/components/home/ThemesHomeSection";
import { ContactHomeSection } from "~/components/home/ContactHomeSection";
import { cn } from "~/lib/utils"; // ADDED: Import cn utility (if not already there)
import { getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";

export default async function HomePage() {
  // Fetch 6 featured restaurants for the "Restaurants Section"
  // Filter by isDisplayed: true
  const t = await getTranslations("hero");

  const featuredRestaurants: Restaurant[] = await db.query.restaurants.findMany(
    {
      where: (restaurant, { eq }) => eq(restaurant.isDisplayed, true),
      limit: 6,
      orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
      with: {
        categories: true, // NEW: Include categories to satisfy the Restaurant type
        // If you later need menu items here, it would be { categories: { with: { menuItems: true } } }
      },
    },
  );

  return (
    // UPDATED: Apply bg-background and text-foreground for dynamic theming
    <div
      className={cn("bg-background text-foreground flex min-h-screen flex-col")}
    >
      {/* ADDED: A simple header for the toggle, or place it in an existing layout component */}
      {/* <header className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </header> */}

      <HeroSection />
      <AboutHomeSection />
      <FeaturedRestaurantsSection restaurants={featuredRestaurants} />
      <ThemesHomeSection />
      <ContactHomeSection />

      {/* UPDATED: Footer also uses semantic background and text colors */}
      <footer className="bg-card text-muted-foreground w-full py-8 text-center text-sm">
        <p>
          &copy; {new Date().getFullYear()} Ahmed Alhusaini. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
