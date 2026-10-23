// src/components/admin/DeleteUserButton.tsx
"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { ConfirmDialog } from "~/components/admin/ConfirmDialog";
import { deleteUser } from "~/app/[locale]/admin/actions";

interface DeleteUserButtonProps {
  userId: string;
  userLabel: string;
  restaurantCount: number;
}

export function DeleteUserButton({ userId, userLabel, restaurantCount }: DeleteUserButtonProps) {
  const router = useRouter();

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-4 w-4" /> Delete user
        </Button>
      }
      title={`Delete ${userLabel}?`}
      description={
        <>
          This deletes their account in Clerk, so they can no longer sign in
          {restaurantCount > 0 &&
            `, and removes their access to ${restaurantCount === 1 ? "1 restaurant" : `${restaurantCount} restaurants`}`}
          . The restaurants themselves are not affected. This can&apos;t be undone.
        </>
      }
      confirmLabel="Delete user"
      onConfirm={async () => {
        const result = await deleteUser(userId);
        if (result.ok) {
          router.replace("/admin/users");
          router.refresh();
        }
        return result;
      }}
    />
  );
}
