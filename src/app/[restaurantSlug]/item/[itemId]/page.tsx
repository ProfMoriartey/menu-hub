// app/[restaurantSlug]/item/[itemId]/page.tsx
import { db } from "~/server/db";
import { menuItems } from "~/server/db/schema"; // Import dietaryLabelEnum
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
// REMOVED: import { ResponsiveImage } from "~/components/shared/ResponsiveImage"; // No longer needed
import Image from "next/image"; // Import Next.js Image
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ChevronLeft } from "lucide-react";

// Import shared types (especially MenuItem for clarity, though not strictly required for server component)
// Import shared types (especially MenuItem for clarity, though not strictly required for server component)
import type { DietaryLabel } from "~/types/restaurant"; // Import DietaryLabel for display logic
// Import DietaryLabel for display logic

// Define the props type for this page
interface PageProps {
  params: Promise<{
    restaurantSlug: string;
    itemId: string;
  }>;
  searchParams?: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}

// Main Menu Item Detail Page Component (Server Component)
export default async function MenuItemDetailPage({ params }: PageProps) {
  const { restaurantSlug, itemId } = await params; // params is already an object, no await needed

  // Fetch the menu item details, including its associated restaurant and category
  // Drizzle will automatically fetch dietaryLabels if defined in schema
  const itemDetails = await db.query.menuItems.findFirst({
    where: eq(menuItems.id, itemId),
    with: {
      restaurant: true, // Fetch related restaurant data
      category: true, // Fetch related category data
    },
  });

  // Check if item exists AND if its slug matches the restaurantSlug in the URL
  if (!itemDetails || itemDetails.restaurant.slug !== restaurantSlug) {
    notFound(); // Show 404 if item doesn't exist or doesn't match the restaurant slug
  }

  // Fallback image URL for display
  const fallbackImageUrl = `https://placehold.co/800x600/E0E0E0/333333?text=No+Image`;

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-800 sm:p-8">
      <div className="container mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-lg sm:p-8">
        {/* Back Button */}
        <Link href={`/${restaurantSlug}`} passHref>
          <Button variant="outline" className="mb-6 flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Menu
          </Button>
        </Link>

        {/* Item Image */}
        <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg shadow-md sm:h-96">
          <Image // Use Next.js Image component
            src={itemDetails.imageUrl ?? fallbackImageUrl} // Use nullish coalescing for fallback
            alt={itemDetails.name}
            width={800} // Larger width for detail page
            height={600} // Larger height for detail page
            className="h-full w-full object-cover"
          />
        </div>

        {/* Item Details */}
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          {itemDetails.name}
        </h1>
        <p className="mb-4 text-2xl font-bold text-blue-700">
          {itemDetails.price} {itemDetails.restaurant.currency}
        </p>

        {itemDetails.description && ( // Conditionally render description
          <p className="mb-4 text-lg text-gray-700">
            {itemDetails.description}
          </p>
        )}

        {itemDetails.ingredients && ( // Conditionally render ingredients
          <div className="mb-6">
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Ingredients:
            </h3>
            <p className="text-gray-700">{itemDetails.ingredients}</p>
          </div>
        )}

        {/* NEW: Display Dietary Labels */}
        {itemDetails.dietaryLabels && itemDetails.dietaryLabels.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <h3 className="sr-only">Dietary Labels:</h3>{" "}
            {/* Screen reader only heading */}
            {itemDetails.dietaryLabels.map((label: DietaryLabel) => (
              <span
                key={label}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800"
              >
                {label.charAt(0).toUpperCase() +
                  label.slice(1).replace(/-/g, " ")}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-500">
          <p>Category: {itemDetails.category.name}</p>
          <p>Restaurant: {itemDetails.restaurant.name}</p>
        </div>
      </div>
    </div>
  );
}
