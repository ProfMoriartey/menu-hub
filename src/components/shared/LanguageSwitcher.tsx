// src/components/shared/LanguageSwitcher.tsx
"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "~/i18n/navigation";
import { routing } from "~/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { hasUnsavedChanges } from "~/lib/unsaved-changes";
import { cn } from "~/lib/utils";

// Each language in its own name, so people can find theirs whatever the
// page is currently shown in.
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  tr: "Türkçe",
  ar: "العربية",
  es: "Español",
  ru: "Русский",
};

/**
 * Switches the page to another language, staying on the same page. The
 * choice sticks: next-intl remembers it in a cookie.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("LanguageSwitcher");
  const tUnsaved = useTranslations("UnsavedChanges");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={locale}
      disabled={isPending}
      onValueChange={(next) => {
        if (next === locale) return;
        // Switching reloads the page in the new language, so unsaved
        // edits would be lost. The select stays on the current language.
        if (hasUnsavedChanges() && !window.confirm(tUnsaved("confirmLeave"))) return;
        startTransition(() => router.replace(pathname, { locale: next }));
      }}
    >
      <SelectTrigger aria-label={t("label")} className={cn("h-9 gap-2", className)}>
        <Globe className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {routing.locales.map((code) => (
          <SelectItem key={code} value={code} lang={code} dir={code === "ar" ? "rtl" : "ltr"}>
            {LANGUAGE_NAMES[code] ?? code.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
