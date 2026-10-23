// src/components/public/SoldOutBadge.tsx
"use client";

import { useTranslations } from "next-intl";
import { Ban } from "lucide-react";
import type { MenuItem } from "~/types/restaurant";

// Next to the price of an item that is on the menu but sold out today.
// Hidden items never reach the public menu, so only "sold_out" shows here.
export function SoldOutBadge({ availability }: Pick<MenuItem, "availability">) {
  const t = useTranslations("Availability");
  if (availability !== "sold_out") return null;

  return (
    <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 align-middle text-xs font-semibold text-amber-800 dark:text-amber-300">
      <Ban className="h-3 w-3" aria-hidden />
      {t("soldOut")}
    </span>
  );
}
