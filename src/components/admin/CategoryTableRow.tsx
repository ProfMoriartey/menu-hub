// src/components/admin/CategoryTableRow.tsx
"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { TableCell, TableRow } from "~/components/ui/table";
import { EditCategoryDialog } from "~/components/admin/EditCategoryDialog"; // Existing component
import { DeleteCategoryDialog } from "~/components/admin/DeleteCategoryDialog"; // New component

// Assuming 'Category' type is defined, e.g., from drizzle schema
import type { InferSelectModel } from "drizzle-orm";
import { categories } from "~/server/db/schema";
type CategoryType = InferSelectModel<typeof categories>;

// Import the updateCategory action as it's passed to EditCategoryDialog
import { updateCategory } from "~/app/actions/category";

interface CategoryTableRowProps {
  category: CategoryType;
  restaurantId: string;
}

export function CategoryTableRow({
  category,
  restaurantId,
}: CategoryTableRowProps) {
  return (
    <TableRow key={category.id}>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell>{category.order}</TableCell>
      <TableCell>
        {new Date(category.createdAt).toLocaleDateString("tr-TR", {
          // Ensure consistent date formatting
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}
      </TableCell>
      <TableCell className="flex items-center justify-end space-x-2 text-right">
        <Link
          href={`/admin/restaurants/${restaurantId}/categories/${category.id}/menu-items`}
          passHref
        >
          <Button variant="secondary" size="sm">
            Items
          </Button>
        </Link>

        <EditCategoryDialog
          category={category}
          restaurantId={restaurantId}
          updateCategoryAction={updateCategory}
        />

        <DeleteCategoryDialog
          categoryId={category.id}
          categoryName={category.name}
          restaurantId={restaurantId}
        />
      </TableCell>
    </TableRow>
  );
}
