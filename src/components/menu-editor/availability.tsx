// src/components/menu-editor/availability.tsx
"use client";

import { useTranslations } from "next-intl";
import { Ban, CircleCheck, EyeOff, type LucideIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { ItemAvailability } from "~/lib/menu-item-schemas";
import { cn } from "~/lib/utils";

export const AVAILABILITY_OPTIONS: { value: ItemAvailability; key: string; icon: LucideIcon }[] = [
  { value: "available", key: "available", icon: CircleCheck },
  { value: "sold_out", key: "soldOut", icon: Ban },
  { value: "hidden", key: "hidden", icon: EyeOff },
];

/** "Sold out" or "Hidden" next to an item's name; nothing when available. */
export function AvailabilityBadge({ availability }: { availability: ItemAvailability }) {
  const t = useTranslations("Availability");
  if (availability === "available") return null;

  const isHidden = availability === "hidden";
  const Icon = isHidden ? EyeOff : Ban;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        isHidden ? "bg-muted text-muted-foreground" : "bg-amber-500/15 text-amber-800 dark:text-amber-300",
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {t(isHidden ? "hidden" : "soldOut")}
    </span>
  );
}

/** A compact picker for an item's availability, with what each choice means. */
export function AvailabilitySelect({
  id,
  value,
  onChange,
  disabled,
  label,
  className,
}: {
  id?: string;
  value: ItemAvailability;
  onChange: (value: ItemAvailability) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  const t = useTranslations("Availability");

  return (
    <Select value={value} onValueChange={(v) => onChange(v as ItemAvailability)} disabled={disabled}>
      <SelectTrigger id={id} aria-label={label} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {AVAILABILITY_OPTIONS.map(({ value: option, key, icon: Icon }) => (
          <SelectItem key={option} value={option} title={t(`${key}Hint`)}>
            <Icon className="h-4 w-4" aria-hidden />
            {t(key)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
