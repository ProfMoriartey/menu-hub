// src/components/admin/DeleteRestaurantDialog.tsx
"use client";

import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "~/components/admin/ConfirmDialog";
import type { ActionResult } from "~/lib/action-result";

interface DeleteRestaurantDialogProps {
  restaurantId: string;
  restaurantName: string;
  deleteRestaurantAction: (restaurantId: string) => Promise<ActionResult>;
}

export function DeleteRestaurantDialog({
  restaurantId,
  restaurantName,
  deleteRestaurantAction,
}: DeleteRestaurantDialogProps) {
  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete ${restaurantName}`}
          title="Delete restaurant"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      title="Are you sure?"
      description={
        <>
          This will permanently delete{" "}
          <strong className="text-foreground">{restaurantName}</strong> and all its data.
        </>
      }
      confirmLabel="Delete"
      onConfirm={() => deleteRestaurantAction(restaurantId)}
    />
  );
}
