// src/components/admin/CategoriesTable.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { CategoryTableRow } from "~/components/admin/CategoryTableRow"; // Import the new row component

// Assuming 'Category' type is defined, e.g., from drizzle schema
import type { InferSelectModel } from "drizzle-orm";
import { categories } from "~/server/db/schema";
type CategoryType = InferSelectModel<typeof categories>;

interface CategoriesTableProps {
  allCategories: CategoryType[];
  restaurantId: string;
  restaurantName: string;
}

export function CategoriesTable({
  allCategories,
  restaurantId,
  restaurantName,
}: CategoriesTableProps) {
  if (allCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
          <CardDescription>
            A list of all categories for {restaurantName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            No categories added yet for this restaurant. Use the form above to
            add one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing Categories</CardTitle>
        <CardDescription>
          A list of all categories for {restaurantName}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCategories.map((category) => (
                <CategoryTableRow
                  key={category.id}
                  category={category}
                  restaurantId={restaurantId}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
