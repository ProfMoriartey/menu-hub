// src/components/menus/MenusDirectory.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Globe, Navigation, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Plate, Platter } from "~/components/table/Plate";
import { MenuCard } from "~/components/menus/MenuCard";
import { DishResults } from "~/components/menus/DishResults";
import {
  ActiveFilterPills,
  Chip,
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
  venueWithBranches,
  type DirectoryBranch,
  type DirectoryScope,
  type DirectoryVenue,
  type LocalArea,
} from "~/lib/menus-directory";
import { foldText } from "~/lib/fold-text";

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
const countryKey = (b: DirectoryBranch, locale: string) =>
  b.countryCode ?? (b.country ? `~${foldText(b.country, locale)}` : null);

/**
 * Counts venues by a key of their branches (a chain counts once in each
 * country or city it's in), as options sorted by name in `locale`.
 */
function optionsBy(
  venues: DirectoryVenue[],
  pick: (b: DirectoryBranch) => { key: string; name: string } | null,
  locale: string,
): FilterOption[] {
  const found = new Map<string, FilterOption>();
  for (const v of venues) {
    const picked = new Map<string, string>();
    for (const b of v.branches) {
      const option = pick(b);
      if (option && !picked.has(option.key)) picked.set(option.key, option.name);
    }
    for (const [key, name] of picked) {
      const entry = found.get(key) ?? { key, name, count: 0 };
      entry.count++;
      found.set(key, entry);
    }
  }
  const collator = new Intl.Collator(locale);
  return [...found.values()].sort((a, b) => collator.compare(a.name, b.name));
}

/**
 * The Menus page: every live venue, filtered by type, country, city, open
 * now and menu language (a chain matches by any of its branches, and its
 * card then covers only those), with one search box that finds both places and
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
    () =>
      localCode
        ? allVenues.flatMap((v) => venueWithBranches(v, (b) => b.countryCode === localCode) ?? [])
        : allVenues,
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
            (b) => {
              const key = countryKey(b, locale);
              return key && b.country ? { key, name: b.country } : null;
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
        country
          ? venues.flatMap((v) => venueWithBranches(v, (b) => countryKey(b, locale) === country) ?? [])
          : venues,
        (b) => (b.city ? { key: foldText(b.city, locale), name: b.city } : null),
        locale,
      ),
    [venues, country, locale],
  );

  const anyHours = venues.some((v) => v.branches.some((b) => b.open));
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

  // The venue with only the branches the filters accept, or null.
  const filtered = (v: DirectoryVenue) => {
    if (type && v.type !== type) return null;
    if (inMyLanguage && !(myLanguage !== null && v.languages.includes(myLanguage))) return null;
    return venueWithBranches(
      v,
      (b) =>
        (!country || countryKey(b, locale) === country) &&
        (!city || (b.city !== null && fold(b.city) === city)) &&
        (!openNow || Boolean(b.open?.isOpen)),
    );
  };

  const query = filters.query.trim();
  const folded = fold(query);
  const matchesQuery = (v: DirectoryVenue) =>
    [v.name, v.typeLabel, v.cuisine, ...v.branches.flatMap((b) => [b.city, b.country])].some(
      (text) => text && fold(text).includes(folded),
    );

  const places = venues
    .flatMap((v) => {
      const kept = filtered(v);
      return kept && (!query || matchesQuery(kept)) ? [kept] : [];
    })
    .sort((a, b) => Number(b.featured) - Number(a.featured));
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
          return venue !== undefined && filtered(venue) !== null;
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
    return (
      <EmptyState
        title={t("empty")}
        action={
          <Button variant="table" size="pill" asChild>
            <Link href="/">{t("backHome")}</Link>
          </Button>
        }
      />
    );
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
    <Button variant="table" size="pill" onClick={() => setScope("global")}>
      <Globe aria-hidden /> {t("searchEverywhere")}
    </Button>
  );

  return (
    <div className="space-y-12">
      <div className="space-y-5">
        {canBeLocal ? (
          <div role="group" aria-label={t("scopeLabel")} className="flex flex-wrap gap-3">
            <Chip pressed={scope === "local"} onClick={() => setScope("local")}>
              <Navigation className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{local.name}</span>
              <span className="opacity-70 tabular-nums">{local.count}</span>
            </Chip>
            <Chip pressed={scope === "global"} onClick={() => setScope("global")}>
              <Globe className="size-4 shrink-0" aria-hidden />
              {t("everywhere")}
              <span className="opacity-70 tabular-nums">{allVenues.length}</span>
            </Chip>
          </div>
        ) : (
          local && (
            <p className="text-on-cloth-muted flex items-center gap-2 text-sm">
              <Globe className="size-4 shrink-0" aria-hidden />
              {t("noLocalMenus", { country: local.name })}
            </p>
          )
        )}

        <div className="flex items-center gap-3">
          <Platter className="flex-1 rounded-full p-2 sm:p-2">
            <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
              <Search
                className="text-ink-muted pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2"
                aria-hidden
              />
              <Input
                type="search"
                value={filters.query}
                onChange={(e) => update({ query: e.target.value })}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchLabel")}
                enterKeyHint="search"
                className="text-ink placeholder:text-ink-muted h-11 rounded-full border-0 bg-transparent ps-12 pe-12 text-base shadow-none focus-visible:ring-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[var(--table-focus)] dark:bg-transparent [&::-webkit-search-cancel-button]:hidden"
              />
              {filters.query && (
                <button
                  type="button"
                  onClick={() => update({ query: "" })}
                  className="text-ink hover:bg-plate-rim absolute end-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full"
                  aria-label={t("clearSearch")}
                >
                  <X className="size-4" aria-hidden />
                </button>
              )}
            </form>
          </Platter>
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
                <p className="text-on-cloth-muted text-sm">{t("searchingDishes")}</p>
              ) : dishSearch.state === "error" ? (
                <p className="text-on-cloth text-sm font-bold">{t("dishSearchFailed")}</p>
              ) : dishes.length > 0 ? (
                <DishResults dishes={dishes} venues={byId} />
              ) : (
                places.length > 0 && (
                  <p className="text-on-cloth-muted text-sm">{t("noDishes", { query })}</p>
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
                    <Button variant="table" size="pill" onClick={clearFilters}>
                      {t("clearFilters")}
                    </Button>
                  ) : undefined
                }
              />
            )}
        </>
      ) : (
        <>
          <Section title={anyFilter ? t("matching") : t("allMenus")} count={places.length}>
            {places.length > 0 ? (
              <CardGrid venues={places} hideCountry={hideCountry} />
            ) : (
              <EmptyState
                title={t("noMatches")}
                action={
                  <>
                    <Button variant="table" size="pill" onClick={clearFilters}>
                      {t("clearFilters")}
                    </Button>
                    {scope === "local" && searchEverywhere}
                  </>
                }
              />
            )}
          </Section>
        </>
      )}
    </div>
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
    <section className="space-y-6">
      <h2 className="text-on-cloth flex items-baseline gap-2 text-2xl font-extrabold tracking-tight rtl:tracking-normal">
        {title}
        {count !== undefined && (
          <span className="text-on-cloth-muted text-base font-normal tabular-nums">{count}</span>
        )}
      </h2>
      {children}
    </section>
  );
}

// Plates in one column on phones, two and three as the container widens.
function CardGrid({ venues, hideCountry }: { venues: DirectoryVenue[]; hideCountry: boolean }) {
  return (
    <div className="@container">
      <ul className="grid grid-cols-1 justify-items-center gap-12 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {venues.map((venue, i) => (
          <MenuCard key={venue.id} venue={venue} priority={i < 3} hideCountry={hideCountry} />
        ))}
      </ul>
    </div>
  );
}

// A bare plate: one line and a way back.
function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex justify-center py-4">
      <Plate size="fluid" className="max-w-80 @container">
        <div className="flex w-[66%] flex-col items-center gap-3 text-center">
          <p className="text-[clamp(0.9375rem,5.5cqw,1.125rem)] leading-snug font-bold">{title}</p>
          {action}
        </div>
      </Plate>
    </div>
  );
}
