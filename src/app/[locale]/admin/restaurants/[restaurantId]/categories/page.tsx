// app/admin/restaurants/[restaurantId]/categories/page.tsx
import { db } from "~/server/db";
import { categories, restaurants } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link"; // Import Link
import { Button } from "~/components/ui/button"; // Import Button
import { ChevronLeft } from "lucide-react"; // Import the back arrow icon

// Import new components
import { AddCategoryForm } from "~/components/admin/AddCategoryForm";
import { CategoriesTable } from "~/components/admin/CategoriesTable";

// Main Categories Page Component (Server Component)
export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;

  // Fetch the restaurant details to display its name
  const restaurantDetails = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantId),
  });

  if (!restaurantDetails) {
    notFound();
  }

  // Fetch categories for this specific restaurant
  const allCategories = await db.query.categories.findMany({
    where: eq(categories.restaurantId, restaurantId),
    orderBy: (categories, { asc }) => [asc(categories.order)],
  });

  return (
    <div className="space-y-8 p-4">
      {" "}
      {/* Added padding to the main div */}
      {/* Back Button to Restaurants Page */}
      <Link href="/admin/restaurants" passHref>
        <Button variant="outline" className="flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Restaurants
        </Button>
      </Link>
      <h1 className="text-3xl font-bold">
        Manage Categories for {restaurantDetails.name}
      </h1>
      <p className="text-lg text-gray-600">Restaurant ID: {restaurantId}</p>
      {/* Use the new AddCategoryForm component */}
      <AddCategoryForm
        restaurantId={restaurantId}
        restaurantName={restaurantDetails.name}
      />
      {/* Use the new CategoriesTable component */}
      <CategoriesTable
        allCategories={allCategories}
        restaurantId={restaurantId}
        restaurantName={restaurantDetails.name}
      />
    </div>
  );
}
