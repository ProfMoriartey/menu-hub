// src/components/public/MenuFilters.tsx
"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Search, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { DIETARY_LABEL_KEYS } from "~/lib/dietary-labels";

import type { PublicCategory } from "~/components/public/menu-types";
import type { DietaryLabel } from "~/types/restaurant";

// Short menus are quicker to scroll than to search.
const SEARCH_MIN_ITEMS = 12;

/**
 * Lower-cases and strips accents and Arabic vowel marks, and folds letters
 * guests often type interchangeably, so "cig kofte" finds "Çiğ Köfte" and
 * "احمد" finds "أحمد".
 */
export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ı/g, "i")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
}

/**
 * Search text and dietary filters for a menu. Returns the categories with
 * only the matching items, leaving out categories with none.
 */
export function useMenuFilters(categories: PublicCategory[]) {
  const [query, setQuery] = useState("");
  const [labels, setLabels] = useState<DietaryLabel[]>([]);
  // Typing stays responsive on long menus; the list catches up a beat later.
  const deferredQuery = useDeferredValue(query);

  const itemCount = useMemo(
    () => categories.reduce((sum, c) => sum + c.menuItems.length, 0),
    [categories],
  );

  // Only offer filters that would match something on this menu.
  const availableLabels = useMemo(() => {
    const present = new Set(
      categories.flatMap((c) =>
        c.menuItems.flatMap((i) => i.dietaryLabels ?? []),
      ),
    );
    return (Object.keys(DIETARY_LABEL_KEYS) as DietaryLabel[]).filter((label) =>
      present.has(label),
    );
  }, [categories]);

  // Search text for every item, built once per menu rather than per keystroke.
  const searchText = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) {
      for (const item of category.menuItems) {
        map.set(
          item.id,
          normalizeForSearch(
            [
              item.name,
              item.description,
              item.ingredients,
              category.name,
              // Main-language text, when a translation is shown.
              item.searchText,
            ]
              .filter(Boolean)
              .join(" "),
          ),
        );
      }
    }
    return map;
  }, [categories]);

  const terms = useMemo(
    () => normalizeForSearch(deferredQuery).split(/\s+/).filter(Boolean),
    [deferredQuery],
  );
  const isFiltering = terms.length > 0 || labels.length > 0;

  const filtered = useMemo(() => {
    if (terms.length === 0 && labels.length === 0) return categories;
    return categories
      .map((category) => ({
        ...category,
        menuItems: category.menuItems.filter((item) => {
          const text = searchText.get(item.id) ?? "";
          return (
            terms.every((term) => text.includes(term)) &&
            labels.every((label) => item.dietaryLabels?.includes(label))
          );
        }),
      }))
      .filter((category) => category.menuItems.length > 0);
  }, [categories, searchText, terms, labels]);

  const resultCount = filtered.reduce((sum, c) => sum + c.menuItems.length, 0);

  return {
    query,
    setQuery,
    labels,
    toggleLabel: (label: DietaryLabel) =>
      setLabels((current) =>
        current.includes(label)
          ? current.filter((l) => l !== label)
          : [...current, label],
      ),
    clear: () => {
      setQuery("");
      setLabels([]);
    },
    showSearch: itemCount >= SEARCH_MIN_ITEMS,
    availableLabels,
    isFiltering,
    filtered,
    resultCount,
  };
}

type MenuFilters = ReturnType<typeof useMenuFilters>;

export function MenuFilterBar({ filters }: { filters: MenuFilters }) {
  const t = useTranslations("PublicMenu");
  const tDietary = useTranslations("MenuEditor.dietary");
  const { showSearch, availableLabels } = filters;
  if (!showSearch && availableLabels.length === 0) return null;

  return (
    <div className="space-y-3">
      {showSearch && (
        <div role="search" className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            value={filters.query}
            onChange={(e) => filters.setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            enterKeyHint="search"
            // The native clear button differs per browser; ours is below.
            className="bg-card h-11 ps-9 pe-10 text-base [&::-webkit-search-cancel-button]:hidden"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => filters.setQuery("")}
              aria-label={t("clearSearch")}
              className="text-muted-foreground hover:text-foreground absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      )}

      {availableLabels.length > 0 && (
        <div
          role="group"
          aria-label={t("dietaryFilters")}
          className="flex flex-wrap gap-2"
        >
          {availableLabels.map((label) => {
            const on = filters.labels.includes(label);
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => filters.toggleLabel(label)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  on
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-muted",
                )}
              >
                {on && <Check className="h-3.5 w-3.5" aria-hidden />}
                {tDietary(DIETARY_LABEL_KEYS[label])}
              </button>
            );
          })}
        </div>
      )}

      {/* Announced to screen readers as the results change. */}
      <p
        aria-live="polite"
        className={cn(
          "text-muted-foreground text-sm",
          !filters.isFiltering && "sr-only",
        )}
      >
        {filters.isFiltering &&
          t("resultCount", { count: filters.resultCount })}
      </p>
    </div>
  );
}

export function NoMenuResults({ onClear }: { onClear: () => void }) {
  const t = useTranslations("PublicMenu");
  return (
    <div className="text-muted-foreground py-12 text-center">
      <p>{t("noResults")}</p>
      <button
        type="button"
        onClick={onClear}
        className="text-primary mt-2 font-medium underline underline-offset-2 hover:no-underline"
      >
        {t("clearFilters")}
      </button>
    </div>
  );
}
