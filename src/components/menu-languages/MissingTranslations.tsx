// src/components/menu-languages/MissingTranslations.tsx
"use client";

import { useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { LANGUAGE_NAMES, type MenuLanguage } from "~/lib/menu-languages";

// "Not translated: English, العربية" under an item or category in the
// editor, so the team can see what's left. Guests see the main language
// for these meanwhile.
export function MissingTranslations({
  languages,
}: {
  languages: MenuLanguage[];
}) {
  const t = useTranslations("MenuLanguages");
  if (languages.length === 0) return null;
  return (
    <p className="text-attention mt-0.5 inline-flex items-center gap-1 text-xs">
      <Languages className="h-3 w-3 shrink-0" aria-hidden />
      {t("notTranslated", {
        languages: languages.map((lang) => LANGUAGE_NAMES[lang]).join(", "),
      })}
    </p>
  );
}
