// src/components/admin/DeleteRestaurantDialog.tsx
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
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

interface DeleteRestaurantDialogProps {
  restaurantId: string;
  restaurantName: string;
  deleteRestaurantAction: (restaurantId: string) => Promise<void>;
}

export function DeleteRestaurantDialog({
  restaurantId,
  restaurantName,
  deleteRestaurantAction,
}: DeleteRestaurantDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/* Button with destructive variant. Should pick up theme colors (bg-destructive, text-destructive-foreground). */}
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      {/* AlertDialogContent and its children (Header, Title, Description, Footer)
          typically inherit their colors from Shadcn's default styling, which
          should be based on your globals.css variables (bg-popover, text-popover-foreground, etc.). */}
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* AlertDialogTitle should pick up text-popover-foreground */}
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          {/* AlertDialogDescription should pick up text-muted-foreground or text-popover-foreground */}
          <AlertDialogDescription>
            This will permanently delete{" "}
            <strong className="text-foreground">{restaurantName}</strong> and
            all its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* AlertDialogCancel Button (default styling should be theme-aware, often secondary-like) */}
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <form
              action={async () => await deleteRestaurantAction(restaurantId)}
            >
              {/* Button with destructive variant inside the form. Should also pick up theme colors. */}
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
