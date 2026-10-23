// src/components/admin/ReorderStatus.tsx
"use client";

import { useEffect, useState } from "react";
import { Check, CircleAlert, X } from "lucide-react";

export type ReorderState = "idle" | "saving" | "saved" | "error";

// "saved" clears itself after a moment so the message doesn't linger.
export function useReorderState() {
  const [state, setState] = useState<ReorderState>("idle");

  useEffect(() => {
    if (state !== "saved") return;
    const timer = setTimeout(() => setState("idle"), 2500);
    return () => clearTimeout(timer);
  }, [state]);

  return [state, setState] as const;
}

export function ReorderStatus({
  state,
  onDismiss,
}: {
  state: ReorderState;
  onDismiss: () => void;
}) {
  return (
    <p className="text-sm" role="status" aria-live="polite">
      {state === "saving" && <span className="text-muted-foreground">Saving order…</span>}
      {state === "saved" && (
        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <Check className="h-4 w-4" /> Order saved
        </span>
      )}
      {state === "error" && (
        <span className="text-destructive inline-flex items-center gap-1.5">
          <CircleAlert className="h-4 w-4" /> Couldn&apos;t save the new order. Try again.
          <button type="button" onClick={onDismiss} aria-label="Dismiss">
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      )}
    </p>
  );
}
