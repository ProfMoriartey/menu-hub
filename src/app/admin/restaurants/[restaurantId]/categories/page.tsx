// app/admin/restaurants/[restaurantId]/categories/page.tsx
import { db } from "~/server/db";
import { categories, restaurants } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

// Import new components
import { AddCategoryForm } from "~/components/admin/AddCategoryForm";
import { CategoriesTable } from "~/components/admin/CategoriesTable";

// Import Server Actions for categories (only if needed directly in this server component)
// In this case, they are passed down to client components, so they are imported implicitly
// via those components or explicitly if the server page itself needs to call them.
// For example, if you wanted to directly call `addCategory` from this server component, you'd import it.
// Here, we're passing it to `AddCategoryForm`, which will import it.

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
    <div className="space-y-8">
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
