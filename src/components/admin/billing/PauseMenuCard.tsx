// src/components/admin/billing/PauseMenuCard.tsx
"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { PauseCircle, PlayCircle } from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Field } from "~/components/forms/fields";
import { SaveState } from "~/components/admin/billing/billing-fields";
import { setMenuPaused } from "~/app/actions/billing";

const REASONS = [
  { value: "unpaid", label: "Payment overdue" },
  { value: "other", label: "Other reason" },
] as const;

/**
 * Admin only, on the Plan tab: pausing the menu outranks its live switch.
 * Guests can't see a paused menu and its owners can't put it live; they
 * see the reason (not the note) and are asked to get in touch.
 */
export function PauseMenuCard({
  restaurantId,
  pausedAt,
  reason,
  note,
}: {
  restaurantId: string;
  pausedAt: Date | null;
  reason: string | null;
  note: string | null;
}) {
  const router = useRouter();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    reason: reason === "other" ? "other" : "unpaid",
    note: note ?? "",
  });
  const [error, setError] = useState<string | null>(null);

  const save = (paused: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await setMenuPaused(restaurantId, { paused, ...values });
      if (!result.ok) return setError(result.error);
      router.refresh();
    });
  };

  return (
    <section
      aria-labelledby="pause-title"
      className={
        pausedAt
          ? "max-w-3xl space-y-4 rounded-xl border border-red-500/40 bg-red-500/5 p-6 shadow-sm"
          : "bg-card border-border max-w-3xl space-y-4 rounded-xl border p-6 shadow-sm"
      }
    >
      <div>
        <h2 id="pause-title" className="flex items-center gap-2 text-base font-semibold">
          <PauseCircle className="h-4 w-4" aria-hidden />
          {pausedAt
            ? `Paused since ${new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(pausedAt)}`
            : "Pause menu"}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {pausedAt
            ? "Guests can't see this menu and its owners can't put it live, whatever its live switch says. They see the reason and are asked to get in touch."
            : "For example when a payment is overdue. It overrides the menu's live switch: guests can't see it, and the owner can't put it live until you resume it."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-[14rem_minmax(0,1fr)]">
        <Field label="Reason (the owner sees it)" htmlFor="pause-reason">
          <Select value={values.reason} onValueChange={(v) => setValues((x) => ({ ...x, reason: v as "unpaid" | "other" }))}>
            <SelectTrigger id="pause-reason" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Note (only admins see it)" htmlFor="pause-note">
          <Input
            id="pause-note"
            value={values.note}
            onChange={(e) => setValues((x) => ({ ...x, note: e.target.value }))}
            placeholder="e.g. November not paid, called on the 5th"
            maxLength={1000}
          />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {pausedAt ? (
          <>
            <Button onClick={() => save(false)} disabled={isPending}>
              <PlayCircle className="h-4 w-4" /> Resume menu
            </Button>
            <Button variant="ghost" onClick={() => save(true)} disabled={isPending}>
              Update reason
            </Button>
          </>
        ) : (
          <Button variant="destructive" onClick={() => save(true)} disabled={isPending}>
            <PauseCircle className="h-4 w-4" /> Pause menu
          </Button>
        )}
        <SaveState error={error} saved={false} />
      </div>
    </section>
  );
}
