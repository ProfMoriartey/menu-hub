// src/components/public/PreviewBanner.tsx
import { getTranslations } from "next-intl/server";
import { EyeOff } from "lucide-react";
import { Link } from "~/i18n/navigation";

// Shown above a menu that isn't live yet, to the people allowed to preview it,
// so nobody mistakes the preview for the public page.
export async function PreviewBanner({ restaurantSlug }: { restaurantSlug: string }) {
  const t = await getTranslations("MenuPreview");

  return (
    <div
      role="status"
      // Fixed amber rather than a theme colour: it should read as "not the
      // real page" the same way in light and dark mode, and on every theme.
      // Not sticky, so it never covers a menu theme's own sticky header.
      className="relative z-[60] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-amber-300 px-4 py-2 text-center text-sm text-amber-950 shadow-sm"
    >
      <span className="inline-flex items-center gap-2">
        <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
        <strong className="font-semibold">{t("label")}</strong>
        <span>{t("text")}</span>
      </span>
      <Link
        href={`/dashboard/${restaurantSlug}/menu`}
        className="font-medium underline underline-offset-2 hover:no-underline"
      >
        {t("backToEditing")}
      </Link>
    </div>
  );
}
