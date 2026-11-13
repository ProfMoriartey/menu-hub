// src/components/shared/LanguageSwitcher.tsx
"use client";

import { useState, useTransition } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { PlaceCard } from "~/components/table/PlaceCard";
import { tableFontVariables } from "~/components/table/fonts";
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
 * choice sticks: next-intl remembers it in a cookie. The default is a
 * select (dashboard, guest menus). On the public site, inside the table's
 * world, "card" is a place card that opens a patch of cloth with one card
 * per language, and "cards" lays those cards out in a row.
 */
export function LanguageSwitcher({
  className,
  compact = false,
  contentClassName,
  variant = "select",
}: {
  className?: string;
  variant?: "select" | "card" | "cards";
  // Just the language code ("TR") on the trigger, for tight spaces like a
  // phone-sized menu header. The list still names each language in full.
  compact?: boolean;
  /** The select's list (a portal), e.g. to give it a scope's tokens. */
  contentClassName?: string;
}) {
  const t = useTranslations("LanguageSwitcher");
  const tUnsaved = useTranslations("UnsavedChanges");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const change = (next: string) => {
    if (next === locale) return;
    // Switching reloads the page in the new language, so unsaved
    // edits would be lost. The select stays on the current language.
    if (hasUnsavedChanges() && !window.confirm(tUnsaved("confirmLeave"))) return;
    setOpen(false);
    startTransition(() => router.replace(pathname, { locale: next }));
  };

  const cards = routing.locales.map((code) => (
    <li key={code}>
      <PlaceCard
        size="sm"
        lang={code}
        label={code}
        name={LANGUAGE_NAMES[code] ?? code.toUpperCase()}
        active={code === locale}
        disabled={isPending}
        onClick={() => change(code)}
        className="w-full"
      />
    </li>
  ));

  if (variant === "cards") {
    return (
      <ul aria-label={t("label")} className="flex flex-wrap gap-x-4 gap-y-4 px-1.5 py-1.5">
        {cards}
      </ul>
    );
  }

  if (variant === "card") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <PlaceCard
            size="sm"
            aria-pressed={undefined}
            label={t("label")}
            name={LANGUAGE_NAMES[locale] ?? locale}
            className={className}
          />
        </PopoverTrigger>
        {/* The popover renders in a portal, outside the world: it brings its own scope. */}
        <PopoverContent
          align="end"
          sideOffset={12}
          data-tone="deep"
          className={cn(
            "table-world table-cloth",
            tableFontVariables,
            "bg-cloth-deep text-on-cloth w-48 rounded-xl border-white/10 p-4 shadow-[0_18px_40px_rgb(20_4_8/0.4)]",
          )}
        >
          <ul className="flex flex-col gap-4 p-1">{cards}</ul>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Select
      value={locale}
      disabled={isPending}
      onValueChange={change}
    >
      <SelectTrigger
        aria-label={t("label")}
        className={cn("h-9 gap-2", className)}
      >
        <Globe className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
        {compact ? (
          <SelectValue>
            <span className="text-xs font-semibold uppercase">{locale}</span>
          </SelectValue>
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent align="end" className={contentClassName}>
        {routing.locales.map((code) => (
          <SelectItem
            key={code}
            value={code}
            lang={code}
            dir={code === "ar" ? "rtl" : "ltr"}
          >
            {LANGUAGE_NAMES[code] ?? code.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
