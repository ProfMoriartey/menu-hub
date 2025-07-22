// app/[restaurantSlug]/item/[itemId]/page.tsx
import { db } from "~/server/db";
import { menuItems } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { MenuItemDisplayClient } from "~/components/public/MenuItemDisplayClient"; // Import the new client component

import type { DietaryLabel } from "~/types/restaurant"; // Still needed if you use it directly here, otherwise remove

interface PageProps {
  params: {
    // Removed Promise as params is already an object
    restaurantSlug: string;
    itemId: string;
  };
  searchParams?: Readonly<Record<string, string | string[] | undefined>>; // Removed Promise
}

export default async function MenuItemDetailPage({ params }: PageProps) {
  const { restaurantSlug, itemId } = params; // No await needed

  const itemDetails = await db.query.menuItems.findFirst({
    where: eq(menuItems.id, itemId),
    with: {
      restaurant: true,
      category: true,
    },
  });

  if (!itemDetails || itemDetails.restaurant.slug !== restaurantSlug) {
    notFound();
  }

  // Pass all necessary item details and the restaurant's theme to the client component
  // Ensure 'theme' is available from restaurantDetails if it's in your schema
  return (
    <MenuItemDisplayClient
      item={itemDetails}
      restaurantSlug={restaurantSlug}
      theme={itemDetails.restaurant.theme || "default"} // Assuming theme is on the restaurant object
    />
  );
}
