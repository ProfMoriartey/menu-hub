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
  restaurantId: string; // Needed for revalidation path
}

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  restaurantId,
}: DeleteCategoryDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            <strong> {categoryName} </strong> category and all its associated
            menu items from your database.
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
                Delete
              </Button>
            </form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
