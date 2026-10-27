// src/components/menus/MenusDirectory.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Clock, Languages, MapPin, Search, SearchX, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { VenueTypeIcon } from "~/components/shared/VenueTypeIcon";
import { MenuCard } from "~/components/menus/MenuCard";
import { DishResults } from "~/components/menus/DishResults";
import { searchDishes, type DishResult } from "~/app/actions/search";
import { LANGUAGE_NAMES, isMenuLanguage } from "~/lib/menu-languages";
import { VENUE_TYPES, type VenueType } from "~/lib/venue-types";
import { MIN_DISH_QUERY, foldText, type DirectoryVenue } from "~/lib/menus-directory";
import { cn } from "~/lib/utils";

export interface DirectoryFilters {
  query: string;
  // A venue type key, or "" for all.
  type: string;
  // A folded city name (foldText), or "" for all.
  city: string;
  openNow: boolean;
  inMyLanguage: boolean;
}

const NO_FILTERS = { type: "", city: "", openNow: false, inMyLanguage: false };
const ALL_CITIES = "all";
const SEARCH_DELAY_MS = 250;

type DishSearch =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "done"; results: DishResult[] }
  | { state: "error" };

/**
 * The Menus page: every live venue, filtered by type, city, open now and
 * menu language, with one search box that finds both places and dishes
 * across all menus. Filters are kept in the address, so a shared link or
 * the back button brings them back.
 */
export function MenusDirectory({
  venues,
  initialFilters,
}: {
  venues: DirectoryVenue[];
  initialFilters: DirectoryFilters;
}) {
  const t = useTranslations("MenusPage");
  const locale = useLocale();
  const [filters, setFilters] = useState(initialFilters);
  const update = (patch: Partial<DirectoryFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const fold = (text: string) => foldText(text, locale);
  const byId = useMemo(() => new Map(venues.map((v) => [v.id, v])), [venues]);

  // Only filters that match at least one venue are offered.
  const typeOptions = useMemo(() => {
    const found = new Map<VenueType, { label: string; count: number }>();
    for (const v of venues) {
      if (!v.type) continue;
      const entry = found.get(v.type) ?? { label: v.typeLabel ?? v.type, count: 0 };
      entry.count++;
      found.set(v.type, entry);
    }
    return VENUE_TYPES.filter((type) => found.has(type)).map((type) => ({
      type,
      ...found.get(type)!,
    }));
  }, [venues]);

  const cityOptions = useMemo(() => {
    const found = new Map<string, { name: string; count: number }>();
    for (const v of venues) {
      if (!v.city) continue;
      const key = foldText(v.city, locale);
      const entry = found.get(key) ?? { name: v.city, count: 0 };
      entry.count++;
      found.set(key, entry);
    }
    const collator = new Intl.Collator(locale);
    return [...found.entries()]
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => collator.compare(a.name, b.name));
  }, [venues, locale]);

  const anyHours = venues.some((v) => v.open);
  const myLanguage = isMenuLanguage(locale) ? locale : null;
  const anyInMyLanguage =
    myLanguage !== null && venues.some((v) => v.languages.includes(myLanguage));

  // A filter from an old link that no longer matches anything is ignored.
  const type = typeOptions.some((o) => o.type === filters.type) ? filters.type : "";
  const city = cityOptions.some((o) => o.key === filters.city) ? filters.city : "";
  const openNow = anyHours && filters.openNow;
  const inMyLanguage = anyInMyLanguage && filters.inMyLanguage;
  const anyFilter = Boolean(type || city || openNow || inMyLanguage);

  const passesFilters = (v: DirectoryVenue) =>
    (!type || v.type === type) &&
    (!city || (v.city !== null && fold(v.city) === city)) &&
    (!openNow || Boolean(v.open?.isOpen)) &&
    (!inMyLanguage || (myLanguage !== null && v.languages.includes(myLanguage)));

  const query = filters.query.trim();
  const folded = fold(query);
  const matchesQuery = (v: DirectoryVenue) =>
    [v.name, v.typeLabel, v.cuisine, v.city, v.country].some(
      (text) => text && fold(text).includes(folded),
    );

  const places = venues.filter((v) => passesFilters(v) && (!query || matchesQuery(v)));
  const featured = venues.filter((v) => v.featured);

  // Dishes come from the server, a moment after typing stops. Only the
  // answer to the latest query is shown.
  const [dishSearch, setDishSearch] = useState<DishSearch>({ state: "idle" });
  const latest = useRef(0);
  useEffect(() => {
    const id = ++latest.current;
    if (query.length < MIN_DISH_QUERY) {
      setDishSearch({ state: "idle" });
      return;
    }
    setDishSearch({ state: "loading" });
    const timer = setTimeout(() => {
      searchDishes(query)
        .then((results) => {
          if (id === latest.current) setDishSearch({ state: "done", results });
        })
        .catch(() => {
          if (id === latest.current) setDishSearch({ state: "error" });
        });
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const dishes =
    dishSearch.state === "done"
      ? dishSearch.results.filter((d) => {
          const venue = byId.get(d.restaurantId);
          return venue !== undefined && passesFilters(venue);
        })
      : [];

  // Keep the address in step, without a navigation or a history entry each.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const set = (key: string, value: string) =>
      value ? params.set(key, value) : params.delete(key);
    set("q", filters.query.trim());
    set("type", filters.type);
    set("city", filters.city);
    set("open", filters.openNow ? "1" : "");
    set("lang", filters.inMyLanguage ? "1" : "");
    const search = params.toString();
    const url = `${window.location.pathname}${search ? `?${search}` : ""}`;
    if (url !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [filters]);

  if (venues.length === 0) {
    return <EmptyState title={t("empty")} />;
  }

  const clearFilters = () => update(NO_FILTERS);
  const searching = query.length > 0;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            value={filters.query}
            onChange={(e) => update({ query: e.target.value })}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            enterKeyHint="search"
            className="bg-card h-12 rounded-full ps-12 pe-12 text-base shadow-sm [&::-webkit-search-cancel-button]:hidden"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => update({ query: "" })}
              className="text-muted-foreground hover:text-foreground hover:bg-accent absolute end-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full"
              aria-label={t("clearSearch")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {typeOptions.length > 0 && (
          <div
            role="group"
            aria-label={t("typeFilterLabel")}
            className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
          >
            <Chip pressed={!type} onClick={() => update({ type: "" })}>
              {t("allTypes")}
            </Chip>
            {typeOptions.map((option) => (
              <Chip
                key={option.type}
                pressed={type === option.type}
                onClick={() => update({ type: type === option.type ? "" : option.type })}
              >
                <VenueTypeIcon type={option.type} className="h-4 w-4" />
                {option.label}
                <span className="opacity-60 tabular-nums">{option.count}</span>
              </Chip>
            ))}
          </div>
        )}

        {(anyHours || anyInMyLanguage || cityOptions.length > 1) && (
          <div className="flex flex-wrap items-center gap-2">
            {anyHours && (
              <Chip pressed={openNow} onClick={() => update({ openNow: !openNow })}>
                <Clock className="h-4 w-4" aria-hidden />
                {t("openNow")}
              </Chip>
            )}
            {anyInMyLanguage && myLanguage && (
              <Chip pressed={inMyLanguage} onClick={() => update({ inMyLanguage: !inMyLanguage })}>
                <Languages className="h-4 w-4" aria-hidden />
                {t("inLanguage", { language: LANGUAGE_NAMES[myLanguage] })}
              </Chip>
            )}
            {cityOptions.length > 1 && (
              <Select
                value={city || ALL_CITIES}
                onValueChange={(value) => update({ city: value === ALL_CITIES ? "" : value })}
              >
                <SelectTrigger
                  aria-label={t("cityLabel")}
                  className={cn(
                    "h-9 w-auto gap-1.5 rounded-full px-3.5 text-sm font-medium",
                    city && "border-primary bg-primary text-primary-foreground [&_svg]:!text-primary-foreground",
                  )}
                >
                  <MapPin className="h-4 w-4" aria-hidden />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CITIES}>{t("allCities")}</SelectItem>
                  {cityOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.name} ({option.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {anyFilter && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                {t("clearFilters")}
              </Button>
            )}
          </div>
        )}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {searching
          ? t("searchStatus", {
              places: places.length,
              dishes: dishSearch.state === "done" ? dishes.length : 0,
            })
          : t("count", { count: places.length })}
      </p>

      {searching ? (
        <>
          {places.length > 0 && (
            <Section title={t("places")} count={places.length}>
              <CardGrid venues={places} />
            </Section>
          )}
          {query.length >= MIN_DISH_QUERY && (
            <Section
              title={t("dishes")}
              count={dishSearch.state === "done" ? dishes.length : undefined}
            >
              {dishSearch.state === "loading" ? (
                <p className="text-muted-foreground text-sm">{t("searchingDishes")}</p>
              ) : dishSearch.state === "error" ? (
                <p className="text-destructive text-sm">{t("dishSearchFailed")}</p>
              ) : dishes.length > 0 ? (
                <DishResults dishes={dishes} venues={byId} />
              ) : (
                places.length > 0 && (
                  <p className="text-muted-foreground text-sm">{t("noDishes", { query })}</p>
                )
              )}
            </Section>
          )}
          {places.length === 0 &&
            (query.length < MIN_DISH_QUERY ||
              (dishSearch.state === "done" && dishes.length === 0)) && (
              <EmptyState
                title={t("noResults", { query })}
                action={
                  anyFilter ? (
                    <Button variant="outline" onClick={clearFilters}>
                      {t("clearFilters")}
                    </Button>
                  ) : undefined
                }
              />
            )}
        </>
      ) : (
        <>
          {!anyFilter && featured.length > 0 && featured.length < venues.length && (
            <Section title={t("featured")}>
              <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2">
                {featured.map((venue, i) => (
                  <MenuCard
                    key={venue.id}
                    venue={venue}
                    priority={i < 2}
                    className="w-[82%] shrink-0 snap-start sm:w-80"
                  />
                ))}
              </div>
            </Section>
          )}
          <Section title={anyFilter ? t("matching") : t("allMenus")} count={places.length}>
            {places.length > 0 ? (
              <CardGrid venues={places} />
            ) : (
              <EmptyState
                title={t("noMatches")}
                action={
                  <Button variant="outline" onClick={clearFilters}>
                    {t("clearFilters")}
                  </Button>
                }
              />
            )}
          </Section>
        </>
      )}
    </div>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
        "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-baseline gap-2 text-xl font-bold">
        {title}
        {count !== undefined && (
          <span className="text-muted-foreground text-base font-normal tabular-nums">{count}</span>
        )}
      </h2>
      {children}
    </section>
  );
}

function CardGrid({ venues }: { venues: DirectoryVenue[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {venues.map((venue, i) => (
        <MenuCard key={venue.id} venue={venue} priority={i < 2} />
      ))}
    </div>
  );
}

function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="border-border flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-14 text-center">
      <SearchX className="text-muted-foreground h-8 w-8" aria-hidden />
      <p className="text-muted-foreground max-w-sm">{title}</p>
      {action}
    </div>
  );
}
