// src/components/admin/DeleteCategoryDialog.tsx
"use client";

import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

// Import the deleteCategory action
import { deleteCategory } from "~/app/actions/category";

interface DeleteCategoryDialogProps {
  categoryId: string;
  categoryName: string;
  itemCount: number;
  restaurantId: string; // Needed for revalidation path
}

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  itemCount,
  restaurantId,
}: DeleteCategoryDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete ${categoryName}`}
          title="Delete category"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{categoryName}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            {itemCount === 0
              ? "This category is empty. This can't be undone."
              : `This also deletes the ${itemCount === 1 ? "1 item" : `${itemCount} items`} in it. This can't be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <form
              action={async () => {
                await deleteCategory(categoryId, restaurantId);
              }}
            >
              <Button variant="destructive" type="submit">
                {itemCount === 0 ? "Delete category" : "Delete category and items"}
              </Button>
            </form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
