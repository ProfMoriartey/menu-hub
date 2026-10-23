// src/components/admin/ConfirmDialog.tsx
"use client";

import { useState, useTransition, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import type { ActionResult } from "~/lib/action-result";

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  onConfirm: () => Promise<ActionResult>;
}

// A destructive confirmation that stays open while the action runs and
// shows its error instead of closing as if it had worked.
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  pendingLabel = "Deleting…",
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await onConfirm();
      if (result.ok) setOpen(false);
      else setError(result.error);
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p className="text-destructive flex items-start gap-1.5 text-sm" role="alert">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={isPending}>
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
