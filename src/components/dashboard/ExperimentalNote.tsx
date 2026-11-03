// src/components/dashboard/ExperimentalNote.tsx
import { getTranslations } from "next-intl/server";
import { FlaskConical } from "lucide-react";

/**
 * Above an experimental dashboard tab (lib/plans: open to every plan for
 * now): it may change, and may later come with some plans only.
 */
export async function ExperimentalNote() {
  const t = await getTranslations("DashboardRestaurant");
  return (
    <p className="bg-attention/10 border-attention/30 mb-6 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm">
      <FlaskConical className="text-attention mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      {t("experimentalNote")}
    </p>
  );
}

/** The small "Experimental" label beside a tab's name. */
export function ExperimentalBadge({ label }: { label: string }) {
  return (
    <span className="bg-attention/15 text-foreground ms-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
      {label}
    </span>
  );
}
