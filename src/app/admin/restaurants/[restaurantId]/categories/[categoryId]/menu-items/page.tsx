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
    <div className="space-y-8">
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
          {/* Use the new MenuItemsTable component */}
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
