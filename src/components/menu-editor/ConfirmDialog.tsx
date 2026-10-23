// src/components/menu-editor/ConfirmDialog.tsx
"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CircleAlert } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
  // For the most destructive actions: the button stays disabled until this
  // exact text (e.g. the restaurant's name) is typed.
  confirmText?: string;
  onConfirm: () => Promise<ActionResult>;
}

// A destructive confirmation that stays open while the action runs and
// shows its error instead of closing as if it had worked.
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  pendingLabel,
  confirmText,
  onConfirm,
}: ConfirmDialogProps) {
  const t = useTranslations("ConfirmDialog");
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const typedMatches = !confirmText || typed.trim() === confirmText.trim();

  const confirm = () => {
    if (!typedMatches) return;
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
        if (!next) {
          setError(null);
          setTyped("");
        }
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {confirmText && (
          <form
            className="space-y-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              confirm();
            }}
          >
            <Label htmlFor="confirm-text" className="font-normal">
              {t.rich("typeToConfirm", {
                text: confirmText,
                b: (chunks) => <strong className="font-semibold">{chunks}</strong>,
              })}
            </Label>
            <Input
              id="confirm-text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoFocus
              disabled={isPending}
            />
          </form>
        )}
        {error && (
          <p className="text-destructive flex items-start gap-1.5 text-sm" role="alert">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t("cancel")}</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={isPending || !typedMatches}>
            {isPending ? (pendingLabel ?? t("deleting")) : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
