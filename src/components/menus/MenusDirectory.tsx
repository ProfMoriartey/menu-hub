// src/components/menus/MenusDirectory.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Globe, Navigation, Search, SearchX, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { MenuCard } from "~/components/menus/MenuCard";
import { DishResults } from "~/components/menus/DishResults";
import {
  ActiveFilterPills,
  FilterSheetButton,
  InlineFilters,
  type FilterModel,
  type FilterOption,
} from "~/components/menus/DirectoryFilters";
import { searchDishes, type DishResult } from "~/app/actions/search";
import { LANGUAGE_NAMES, isMenuLanguage } from "~/lib/menu-languages";
import { VENUE_TYPES, type VenueType } from "~/lib/venue-types";
import {
  MIN_DISH_QUERY,
  type DirectoryScope,
  type DirectoryVenue,
  type LocalArea,
} from "~/lib/menus-directory";
import { foldText } from "~/lib/fold-text";
import { cn } from "~/lib/utils";

export interface DirectoryFilters {
  scope: DirectoryScope;
  query: string;
  // A venue type key, or "" for all.
  type: string;
  // A country key (countryKey), or "" for all. Only when not local.
  country: string;
  // A folded city name (foldText), or "" for all.
  city: string;
  openNow: boolean;
  inMyLanguage: boolean;
}

const NO_FILTERS = { type: "", country: "", city: "", openNow: false, inMyLanguage: false };
const SEARCH_DELAY_MS = 250;

type DishSearch =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "done"; results: DishResult[] }
  | { state: "error" };

// Countries stored as codes match by code; older typed names by their text.
const countryKey = (v: DirectoryVenue, locale: string) =>
  v.countryCode ?? (v.country ? `~${foldText(v.country, locale)}` : null);

/** Counts venues by a key, as options sorted by name in `locale`. */
function optionsBy(
  venues: DirectoryVenue[],
  pick: (v: DirectoryVenue) => { key: string; name: string } | null,
  locale: string,
): FilterOption[] {
  const found = new Map<string, FilterOption>();
  for (const v of venues) {
    const picked = pick(v);
    if (!picked) continue;
    const entry = found.get(picked.key) ?? { ...picked, count: 0 };
    entry.count++;
    found.set(picked.key, entry);
  }
  const collator = new Intl.Collator(locale);
  return [...found.values()].sort((a, b) => collator.compare(a.name, b.name));
}

/**
 * The Menus page: every live venue, filtered by type, country, city, open
 * now and menu language, with one search box that finds both places and
 * dishes across all menus. Visitors start with menus from their own
 * country (when it has any) and can switch to everywhere. Filters are kept
 * in the address, so a shared link or the back button brings them back.
 */
export function MenusDirectory({
  venues: allVenues,
  local,
  defaultScope,
  initialFilters,
}: {
  venues: DirectoryVenue[];
  // The visitor's country, when the host reports it.
  local: LocalArea | null;
  defaultScope: DirectoryScope;
  initialFilters: DirectoryFilters;
}) {
  const t = useTranslations("MenusPage");
  const locale = useLocale();
  const [filters, setFilters] = useState(initialFilters);
  const update = (patch: Partial<DirectoryFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const fold = (text: string) => foldText(text, locale);
  const byId = useMemo(() => new Map(allVenues.map((v) => [v.id, v])), [allVenues]);

  // Local only when the visitor's country has menus. Everything below,
  // filter options included, works on the venues in scope.
  const canBeLocal = local !== null && local.count > 0;
  const scope: DirectoryScope = canBeLocal ? filters.scope : "global";
  const localCode = scope === "local" ? local!.code : null;
  const venues = useMemo(
    () => (localCode ? allVenues.filter((v) => v.countryCode === localCode) : allVenues),
    [allVenues, localCode],
  );
  // Countries and cities differ from one scope to the other.
  const setScope = (next: DirectoryScope) => update({ scope: next, country: "", city: "" });

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

  const countryOptions = useMemo(
    () =>
      scope === "local"
        ? []
        : optionsBy(
            venues,
            (v) => {
              const key = countryKey(v, locale);
              return key && v.country ? { key, name: v.country } : null;
            },
            locale,
          ),
    [venues, scope, locale],
  );
  const country = countryOptions.some((o) => o.key === filters.country) ? filters.country : "";

  // Cities of the chosen country only.
  const cityOptions = useMemo(
    () =>
      optionsBy(
        country ? venues.filter((v) => countryKey(v, locale) === country) : venues,
        (v) => (v.city ? { key: foldText(v.city, locale), name: v.city } : null),
        locale,
      ),
    [venues, country, locale],
  );

  const anyHours = venues.some((v) => v.open);
  const myLanguage = isMenuLanguage(locale) ? locale : null;
  const anyInMyLanguage =
    myLanguage !== null && venues.some((v) => v.languages.includes(myLanguage));

  // A filter from an old link that no longer matches anything is ignored.
  const type = typeOptions.some((o) => o.type === filters.type) ? filters.type : "";
  const city = cityOptions.some((o) => o.key === filters.city) ? filters.city : "";
  const openNow = anyHours && filters.openNow;
  const inMyLanguage = anyInMyLanguage && filters.inMyLanguage;
  const activeCount = [type, country, city, openNow, inMyLanguage].filter(Boolean).length;
  const anyFilter = activeCount > 0;

  const passesFilters = (v: DirectoryVenue) =>
    (!type || v.type === type) &&
    (!country || countryKey(v, locale) === country) &&
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
  // Every card would name the same country.
  const hideCountry = scope === "local" || Boolean(country);

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
      searchDishes(query, localCode)
        .then((results) => {
          if (id === latest.current) setDishSearch({ state: "done", results });
        })
        .catch(() => {
          if (id === latest.current) setDishSearch({ state: "error" });
        });
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query, localCode]);

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
    set("scope", filters.scope === defaultScope ? "" : filters.scope);
    set("q", filters.query.trim());
    set("type", filters.type);
    set("country", filters.country);
    set("city", filters.city);
    set("open", filters.openNow ? "1" : "");
    set("lang", filters.inMyLanguage ? "1" : "");
    const search = params.toString();
    const url = `${window.location.pathname}${search ? `?${search}` : ""}`;
    if (url !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [filters, defaultScope]);

  if (allVenues.length === 0) {
    return <EmptyState title={t("empty")} />;
  }

  const clearFilters = () => update(NO_FILTERS);
  const searching = query.length > 0;

  const model: FilterModel = {
    types: typeOptions,
    type,
    setType: (next) => update({ type: next }),
    showOpenNow: anyHours,
    openNow,
    setOpenNow: (on) => update({ openNow: on }),
    myLanguageName: anyInMyLanguage && myLanguage ? LANGUAGE_NAMES[myLanguage] : null,
    inMyLanguage,
    setInMyLanguage: (on) => update({ inMyLanguage: on }),
    countries: countryOptions,
    country,
    // A city of another country would hide everything.
    setCountry: (next) => update({ country: next, city: "" }),
    cities: cityOptions,
    city,
    setCity: (next) => update({ city: next }),
    activeCount,
    clear: clearFilters,
    resultCount: places.length,
  };

  const searchEverywhere = (
    <Button variant="outline" onClick={() => setScope("global")}>
      <Globe className="h-4 w-4" aria-hidden /> {t("searchEverywhere")}
    </Button>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {canBeLocal ? (
          <div
            role="group"
            aria-label={t("scopeLabel")}
            className="bg-muted inline-flex max-w-full rounded-full p-1"
          >
            <ScopeButton pressed={scope === "local"} onClick={() => setScope("local")}>
              <Navigation className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{local.name}</span>
              <span className="opacity-60 tabular-nums">{local.count}</span>
            </ScopeButton>
            <ScopeButton pressed={scope === "global"} onClick={() => setScope("global")}>
              <Globe className="h-4 w-4 shrink-0" aria-hidden />
              {t("everywhere")}
              <span className="opacity-60 tabular-nums">{allVenues.length}</span>
            </ScopeButton>
          </div>
        ) : (
          local && (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 shrink-0" aria-hidden />
              {t("noLocalMenus", { country: local.name })}
            </p>
          )
        )}

        <div className="flex items-center gap-2">
          <form role="search" onSubmit={(e) => e.preventDefault()} className="relative flex-1">
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
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground absolute end-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full"
                aria-label={t("clearSearch")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          <FilterSheetButton model={model} />
        </div>

        <ActiveFilterPills model={model} />
        <InlineFilters model={model} />
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
              <CardGrid venues={places} hideCountry={hideCountry} />
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
                  scope === "local" ? (
                    searchEverywhere
                  ) : anyFilter ? (
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
                    hideCountry={hideCountry}
                    className="w-[82%] shrink-0 snap-start sm:w-80"
                  />
                ))}
              </div>
            </Section>
          )}
          <Section title={anyFilter ? t("matching") : t("allMenus")} count={places.length}>
            {places.length > 0 ? (
              <CardGrid venues={places} hideCountry={hideCountry} />
            ) : (
              <EmptyState
                title={t("noMatches")}
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="outline" onClick={clearFilters}>
                      {t("clearFilters")}
                    </Button>
                    {scope === "local" && searchEverywhere}
                  </div>
                }
              />
            )}
          </Section>
        </>
      )}
    </div>
  );
}

function ScopeButton({
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
        "inline-flex h-9 min-w-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors",
        "focus-visible:ring-ring outline-none focus-visible:ring-2",
        pressed
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
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

function CardGrid({ venues, hideCountry }: { venues: DirectoryVenue[]; hideCountry: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {venues.map((venue, i) => (
        <MenuCard key={venue.id} venue={venue} priority={i < 2} hideCountry={hideCountry} />
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
