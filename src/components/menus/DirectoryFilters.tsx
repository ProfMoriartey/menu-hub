// src/components/menus/DirectoryFilters.tsx
"use client";

import { useState, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Clock, Flag, Languages, MapPin, SlidersHorizontal, X, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { VenueTypeIcon } from "~/components/shared/VenueTypeIcon";
import { cn } from "~/lib/utils";
import type { VenueType } from "~/lib/venue-types";

export interface FilterOption {
  key: string;
  name: string;
  count: number;
}

/**
 * What the Menus page can filter by and the current choice. Options are
 * only the ones some venue in view matches; empty lists hide the filter.
 */
export interface FilterModel {
  types: { type: VenueType; label: string; count: number }[];
  type: string;
  setType: (type: string) => void;
  showOpenNow: boolean;
  openNow: boolean;
  setOpenNow: (on: boolean) => void;
  // The page language's name, when some menu is in it.
  myLanguageName: string | null;
  inMyLanguage: boolean;
  setInMyLanguage: (on: boolean) => void;
  countries: FilterOption[];
  country: string;
  setCountry: (key: string) => void;
  cities: FilterOption[];
  city: string;
  setCity: (key: string) => void;
  activeCount: number;
  clear: () => void;
  // Menus matching the search and filters, for the sheet's button.
  resultCount: number;
}

// An unpressed chip; on hover it takes the accent colour and its text.
const CHIP_IDLE =
  "border-border bg-card hover:border-accent hover:bg-accent hover:text-accent-foreground";
const CHIP_PRESSED = "border-primary bg-primary text-primary-foreground";

const ALL = "all";

export function Chip({
  pressed,
  onClick,
  children,
  className,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
        "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        pressed ? CHIP_PRESSED : CHIP_IDLE,
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Wider screens: type chips in a row, the other filters below them. */
export function InlineFilters({ model }: { model: FilterModel }) {
  const t = useTranslations("MenusPage");
  const m = model;
  const hasMore =
    m.showOpenNow || m.myLanguageName !== null || m.countries.length > 1 || m.cities.length > 1;

  return (
    <div className="hidden space-y-4 sm:block">
      {m.types.length > 0 && (
        <div role="group" aria-label={t("typeFilterLabel")} className="flex flex-wrap gap-2">
          <TypeChips model={m} />
        </div>
      )}
      {hasMore && (
        <div className="flex flex-wrap items-center gap-2">
          <ToggleChips model={m} />
          {m.countries.length > 1 && (
            <FilterSelect
              icon={Flag}
              label={t("countryLabel")}
              allLabel={t("allCountries")}
              options={m.countries}
              value={m.country}
              onChange={m.setCountry}
            />
          )}
          {m.cities.length > 1 && (
            <FilterSelect
              icon={MapPin}
              label={t("cityLabel")}
              allLabel={t("allCities")}
              options={m.cities}
              value={m.city}
              onChange={m.setCity}
            />
          )}
          {m.activeCount > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={m.clear}>
              {t("clearFilters")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Phones: a Filters button beside the search opens a bottom sheet with
 * every filter, so the list starts right under the search box. Filters
 * apply as they're tapped; the button at the bottom shows how many menus
 * match and closes the sheet.
 */
export function FilterSheetButton({ model }: { model: FilterModel }) {
  const t = useTranslations("MenusPage");
  const [open, setOpen] = useState(false);
  const m = model;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors sm:hidden",
            m.activeCount > 0 ? CHIP_PRESSED : CHIP_IDLE,
          )}
          aria-label={
            m.activeCount > 0 ? t("filtersActive", { count: m.activeCount }) : t("filters")
          }
        >
          <SlidersHorizontal className="h-5 w-5" aria-hidden />
          {m.activeCount > 0 && (
            <span
              className="bg-background text-foreground border-primary absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-xs font-semibold tabular-nums"
              aria-hidden
            >
              {m.activeCount}
            </span>
          )}
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content className="bg-card text-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl shadow-xl outline-none">
          <div className="bg-muted-foreground/30 mx-auto mt-2 h-1 w-10 shrink-0 rounded-full" aria-hidden />
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <DialogPrimitive.Title className="text-xl font-bold">{t("filters")}</DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="hover:bg-accent hover:text-accent-foreground flex h-9 w-9 items-center justify-center rounded-full"
              aria-label={t("closeFilters")}
            >
              <X className="h-5 w-5" aria-hidden />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="sr-only">{t("filtersDescription")}</DialogPrimitive.Description>

          <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-3">
            {m.types.length > 0 && (
              <SheetSection title={t("typeFilterLabel")}>
                <TypeChips model={m} />
              </SheetSection>
            )}
            {(m.showOpenNow || m.myLanguageName !== null) && (
              <SheetSection title={t("showOnly")}>
                <ToggleChips model={m} />
              </SheetSection>
            )}
            {m.countries.length > 1 && (
              <SheetSection title={t("countryLabel")}>
                <OptionChips
                  allLabel={t("allCountries")}
                  options={m.countries}
                  value={m.country}
                  onChange={m.setCountry}
                />
              </SheetSection>
            )}
            {m.cities.length > 1 && (
              <SheetSection title={t("cityLabel")}>
                <OptionChips
                  allLabel={t("allCities")}
                  options={m.cities}
                  value={m.city}
                  onChange={m.setCity}
                />
              </SheetSection>
            )}
          </div>

          <div className="border-border flex items-center gap-3 border-t px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button type="button" variant="ghost" onClick={m.clear} disabled={m.activeCount === 0}>
              {t("clearAll")}
            </Button>
            <DialogPrimitive.Close asChild>
              <Button type="button" className="h-11 flex-1 rounded-full">
                {t("showResults", { count: m.resultCount })}
              </Button>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Phones: the filters in use, each with a button that removes it. */
export function ActiveFilterPills({ model }: { model: FilterModel }) {
  const t = useTranslations("MenusPage");
  const m = model;
  const pills: { key: string; label: string; remove: () => void }[] = [];
  const typeOption = m.types.find((o) => o.type === m.type);
  if (typeOption) pills.push({ key: "type", label: typeOption.label, remove: () => m.setType("") });
  if (m.openNow) pills.push({ key: "open", label: t("openNow"), remove: () => m.setOpenNow(false) });
  if (m.inMyLanguage && m.myLanguageName)
    pills.push({
      key: "lang",
      label: t("inLanguage", { language: m.myLanguageName }),
      remove: () => m.setInMyLanguage(false),
    });
  const countryOption = m.countries.find((o) => o.key === m.country);
  if (countryOption)
    pills.push({ key: "country", label: countryOption.name, remove: () => m.setCountry("") });
  const cityOption = m.cities.find((o) => o.key === m.city);
  if (cityOption) pills.push({ key: "city", label: cityOption.name, remove: () => m.setCity("") });
  if (pills.length === 0) return null;

  return (
    <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:hidden">
      {pills.map((pill) => (
        <button
          key={pill.key}
          type="button"
          onClick={pill.remove}
          className={cn(
            "inline-flex h-8 shrink-0 items-center gap-1 rounded-full border ps-3 pe-2 text-sm font-medium whitespace-nowrap",
            CHIP_PRESSED,
          )}
          aria-label={t("removeFilter", { name: pill.label })}
        >
          {pill.label}
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      ))}
    </div>
  );
}

function TypeChips({ model: m }: { model: FilterModel }) {
  const t = useTranslations("MenusPage");
  return (
    <>
      <Chip pressed={!m.type} onClick={() => m.setType("")}>
        {t("allTypes")}
      </Chip>
      {m.types.map((option) => (
        <Chip
          key={option.type}
          pressed={m.type === option.type}
          onClick={() => m.setType(m.type === option.type ? "" : option.type)}
        >
          <VenueTypeIcon type={option.type} className="h-4 w-4" />
          {option.label}
          <span className="opacity-60 tabular-nums">{option.count}</span>
        </Chip>
      ))}
    </>
  );
}

function ToggleChips({ model: m }: { model: FilterModel }) {
  const t = useTranslations("MenusPage");
  return (
    <>
      {m.showOpenNow && (
        <Chip pressed={m.openNow} onClick={() => m.setOpenNow(!m.openNow)}>
          <Clock className="h-4 w-4" aria-hidden />
          {t("openNow")}
        </Chip>
      )}
      {m.myLanguageName !== null && (
        <Chip pressed={m.inMyLanguage} onClick={() => m.setInMyLanguage(!m.inMyLanguage)}>
          <Languages className="h-4 w-4" aria-hidden />
          {t("inLanguage", { language: m.myLanguageName })}
        </Chip>
      )}
    </>
  );
}

function OptionChips({
  allLabel,
  options,
  value,
  onChange,
}: {
  allLabel: string;
  options: FilterOption[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <>
      <Chip pressed={!value} onClick={() => onChange("")}>
        {allLabel}
      </Chip>
      {options.map((option) => (
        <Chip
          key={option.key}
          pressed={value === option.key}
          onClick={() => onChange(value === option.key ? "" : option.key)}
        >
          {option.name}
          <span className="opacity-60 tabular-nums">{option.count}</span>
        </Chip>
      ))}
    </>
  );
}

function SheetSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-muted-foreground text-sm font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

// A dropdown that looks like a chip: the accent on hover, filled when set.
function FilterSelect({
  icon: Icon,
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  allLabel: string;
  options: FilterOption[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <Select value={value || ALL} onValueChange={(next) => onChange(next === ALL ? "" : next)}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          "h-9 w-auto gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
          value
            ? `${CHIP_PRESSED} dark:bg-primary dark:hover:bg-primary [&_svg]:!text-primary-foreground`
            : `${CHIP_IDLE} dark:bg-card dark:hover:bg-accent hover:[&_svg]:!text-accent-foreground`,
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.name} ({option.count})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
