// app/page.tsx
import { db } from "~/server/db";

import type { Restaurant } from "~/types/restaurant";

import { HeroSection } from "~/components/home/HeroSection";
import { AboutHomeSection } from "~/components/home/AboutHomeSection";
import { FeaturedRestaurantsSection } from "~/components/home/FeaturedRestaurantsSection";
import { ThemesHomeSection } from "~/components/home/ThemesHomeSection";
import { ContactHomeSection } from "~/components/home/ContactHomeSection";

export default async function HomePage() {
  // Fetch 6 featured restaurants for the "Restaurants Section"
  // Filter by isDisplayed: true
  const featuredRestaurants: Restaurant[] = await db.query.restaurants.findMany(
    {
      where: (restaurant, { eq }) => eq(restaurant.isDisplayed, true),
      limit: 6,
      orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
      with: {
        categories: true, // <-- NEW: Include categories to satisfy the Restaurant type
        // If you later need menu items here, it would be { categories: { with: { menuItems: true } } }
      },
    },
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800">
      <HeroSection />
      <AboutHomeSection />
      <FeaturedRestaurantsSection restaurants={featuredRestaurants} />
      <ThemesHomeSection />
      <ContactHomeSection />

      <footer className="w-full bg-white py-8 text-center text-sm text-gray-600">
        <p>
          &copy; {new Date().getFullYear()} Ahmed Alhusaini. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
