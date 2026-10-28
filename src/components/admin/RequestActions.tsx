// src/components/admin/RequestActions.tsx
"use client";

import { useState, useTransition } from "react";
import { Check, CircleAlert, X } from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { resolvePlanRequest } from "~/app/actions/plan-requests";

/** Approve or dismiss an owner's request (Requests page). */
export function RequestActions({ requestId, approveLabel }: { requestId: string; approveLabel: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const resolve = (decision: "approved" | "dismissed") => {
    setError(null);
    startTransition(async () => {
      const result = await resolvePlanRequest(requestId, decision);
      if (!result.ok) return setError(result.error);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" onClick={() => resolve("approved")} disabled={isPending}>
        <Check className="h-4 w-4" /> {approveLabel}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => resolve("dismissed")} disabled={isPending}>
        <X className="h-4 w-4" /> Dismiss
      </Button>
      {error && (
        <span className="text-destructive inline-flex items-center gap-1.5 text-sm" role="alert">
          <CircleAlert className="h-4 w-4 shrink-0" /> {error}
        </span>
      )}
    </div>
  );
}
