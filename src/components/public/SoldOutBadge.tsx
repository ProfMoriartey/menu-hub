// src/components/public/SoldOutBadge.tsx
"use client";

import { useTranslations } from "next-intl";
import { Stamp } from "~/components/table/Stamp";
import type { MenuItem } from "~/types/restaurant";

// The red SOLD OUT stamp on a dish that is on the menu but sold out today.
// It sits in the flow (its own line under the name), so it never covers the
// name, in any language. Hidden items never reach the public menu.
export function SoldOutBadge({
  availability,
  className,
}: Pick<MenuItem, "availability"> & { className?: string }) {
  const t = useTranslations("Availability");
  if (availability !== "sold_out") return null;
  return <Stamp className={className}>{t("soldOut")}</Stamp>;
}
