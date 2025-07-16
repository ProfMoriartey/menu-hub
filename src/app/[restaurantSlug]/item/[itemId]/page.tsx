// app/[restaurantSlug]/item/[itemId]/page.tsx
import { db } from "~/server/db";
import { menuItems, restaurants, categories } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ResponsiveImage } from "~/components/shared/ResponsiveImage";
import Link from "next/link";
import { Button } from "~/components/ui/button"; // For a back button
import { ChevronLeft } from "lucide-react"; // Back icon

// Define the props type for this page
interface PageProps {
  params: {
    restaurantSlug: string;
    itemId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Main Menu Item Detail Page Component (Server Component)
export default async function MenuItemDetailPage({ params }: PageProps) {
  const { restaurantSlug, itemId } = params;

  // Fetch the menu item details, including its associated restaurant and category
  const itemDetails = await db.query.menuItems.findFirst({
    where: eq(menuItems.id, itemId),
    with: {
      restaurant: true, // Fetch related restaurant data
      category: true, // Fetch related category data
    },
  });

  // Check if item exists AND if its slug matches the restaurantSlug in the URL
  // This is a security/data integrity check to ensure the item belongs to the correct restaurant path
  if (!itemDetails || itemDetails.restaurant.slug !== restaurantSlug) {
    notFound(); // Show 404 if item doesn't exist or doesn't match the restaurant slug
  }

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
          <ResponsiveImage
            src={itemDetails.imageUrl}
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
          ${itemDetails.price.toFixed(2)}
        </p>

        <p className="mb-4 text-lg text-gray-700">{itemDetails.description}</p>

        <div className="mb-6">
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            Ingredients:
          </h3>
          <p className="text-gray-700">{itemDetails.ingredients}</p>
        </div>

        <div className="mb-6 flex space-x-3">
          {itemDetails.isVegetarian && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              Vegetarian
            </span>
          )}
          {itemDetails.isGlutenFree && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              Gluten-Free
            </span>
          )}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-500">
          <p>Category: {itemDetails.category.name}</p>
          <p>Restaurant: {itemDetails.restaurant.name}</p>
        </div>
      </div>
    </div>
  );
}
