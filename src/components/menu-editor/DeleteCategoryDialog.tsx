// src/components/menu-editor/DeleteCategoryDialog.tsx
"use client";

import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "~/components/menu-editor/ConfirmDialog";

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
  const t = useTranslations("MenuEditor.categories");

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={t("deleteLabel", { name: categoryName })}
          title={t("deleteTitle")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      title={t("deleteConfirmTitle", { name: categoryName })}
      description={
        itemCount === 0 ? t("deleteEmpty") : t("deleteWithItems", { count: itemCount })
      }
      confirmLabel={itemCount === 0 ? t("deleteButton") : t("deleteWithItemsButton")}
      onConfirm={() => deleteCategory(categoryId, restaurantId)}
    />
  );
}
