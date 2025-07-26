// src/app/admin/restaurants/[restaurantId]/categories/[categoryId]/menu-items/page.tsx
import { db } from "~/server/db";
import { menuItems, categories, restaurants } from "~/server/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AddMenuItemForm } from "~/components/admin/AddMenuItemForm";
import { MenuItemsTable } from "~/components/admin/MenuItemsTable"; // Import the new component
import Link from "next/link"; // Import Link
import { Button } from "~/components/ui/button"; // Import Button
import { ChevronLeft } from "lucide-react"; // Import the back arrow icon

// Import your server actions (still needed for AddMenuItemForm)
import { addMenuItem } from "~/app/actions/menu-item";

export default async function AdminMenuItemsPage({
  params,
}: {
  params: Promise<{ restaurantId: string; categoryId: string }>;
}) {
  const { restaurantId, categoryId } = await params;

  const restaurantDetails = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantId),
  });

  const categoryDetails = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, categoryId),
      eq(categories.restaurantId, restaurantId),
    ),
  });

  if (!restaurantDetails || !categoryDetails) notFound();

  const allMenuItems = await db.query.menuItems.findMany({
    where: and(
      eq(menuItems.categoryId, categoryId),
      eq(menuItems.restaurantId, restaurantId),
    ),
    orderBy: (menuItems, { asc }) => [asc(menuItems.name)],
  });

  return (
    <div className="space-y-8 p-4">
      {" "}
      {/* Added padding to the main div for consistency */}
      {/* Back Button to Categories Page */}
      <Link href={`/admin/restaurants/${restaurantId}/categories`} passHref>
        <Button variant="outline" className="flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Categories
        </Button>
      </Link>
      <h1 className="text-3xl font-bold">
        Manage Menu Items for {categoryDetails.name}
      </h1>
      <p className="text-lg text-gray-600">
        Restaurant: {restaurantDetails.name} (ID: {restaurantId}) <br />
        Category: {categoryDetails.name} (ID: {categoryId})
      </p>
      <AddMenuItemForm
        restaurantId={restaurantId}
        categoryId={categoryId}
        categoryName={categoryDetails.name}
        addMenuItemAction={addMenuItem}
      />
      <Card>
        <CardHeader>
          <CardTitle>Existing Menu Items</CardTitle>
          <CardDescription>
            A list of all dishes in the &quot;{categoryDetails.name}&quot;
            category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MenuItemsTable
            menuItems={allMenuItems}
            restaurantId={restaurantId}
            categoryId={categoryId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
