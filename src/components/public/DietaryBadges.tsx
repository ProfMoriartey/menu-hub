// src/components/public/DietaryBadges.tsx
"use client";

import { useTranslations } from "next-intl";
import { cn } from "~/lib/utils";
import { DIETARY_LABEL_KEYS } from "~/lib/dietary-labels";

import type { DietaryLabel } from "~/types/restaurant";

export function DietaryBadges({
  labels,
  className,
}: {
  labels: DietaryLabel[] | null;
  className?: string;
}) {
  const t = useTranslations("MenuEditor.dietary");
  if (!labels?.length) return null;

  return (
    <ul className={cn("flex flex-wrap gap-1", className)}>
      {labels.map((label) => (
        <li
          key={label}
          className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-semibold"
        >
          {t(DIETARY_LABEL_KEYS[label])}
        </li>
      ))}
    </ul>
  );
}
