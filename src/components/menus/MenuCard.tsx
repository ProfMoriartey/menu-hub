// src/components/menus/MenuCard.tsx
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { Plate, PlatePhoto } from "~/components/table/Plate";
import { LANGUAGE_NAMES } from "~/lib/menu-languages";
import { venueHref, type DirectoryVenue } from "~/lib/menus-directory";
import { cn } from "~/lib/utils";

/**
 * A venue on the Menus page, set as a plate (the same plate as the home
 * page's example menus): its dish photo, name and type, labelled as an
 * example, and the plate is the link. Under it, on the cloth: its place,
 * whether it's open and the languages its menu is in, as small place cards.
 * A chain's card covers the branches in view: "2 branches · Bursa, Ankara"
 * and "Open now at 1 branch", or one branch's own place, hours and page.
 */
export function MenuCard({
  venue,
  priority,
  hideCountry,
}: {
  venue: DirectoryVenue;
  priority?: boolean;
  // When every card shown is in the same country, the city says enough.
  hideCountry?: boolean;
}) {
  const t = useTranslations("MenusPage");
  const kind = [venue.typeLabel, venue.cuisine].filter(Boolean).join(" · ");
  const { branches } = venue;
  const single = branches.length === 1 ? branches[0]! : null;
  const unique = (values: (string | null)[]) => [...new Set(values.filter((v): v is string => !!v))];

  let place: string;
  let open: { isOpen: boolean; label: string } | null;
  if (single) {
    place = [single.city, hideCountry ? null : single.country].filter(Boolean).join(", ");
    open = single.open;
  } else {
    // Their cities, or their countries when no city is set.
    const cities = unique(branches.map((b) => b.city));
    const names = cities.length > 0 ? cities : hideCountry ? [] : unique(branches.map((b) => b.country));
    place = names.length
      ? t("branchesPlace", { count: branches.length, places: names.slice(0, 3).join(", ") })
      : t("branchesCount", { count: branches.length });
    const withHours = branches.filter((b) => b.open);
    const openCount = withHours.filter((b) => b.open!.isOpen).length;
    open =
      withHours.length === 0
        ? null
        : openCount > 0
          ? { isOpen: true, label: t("openAtBranches", { count: openCount }) }
          : { isOpen: false, label: t("closedAtBranches") };
  }

  return (
    <li className="flex w-full max-w-80 flex-col items-center gap-4 text-center">
      <Link
        href={venueHref(venue)}
        className="block w-full rounded-full outline-none focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-solid focus-visible:outline-[var(--table-focus)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-1"
      >
        <Plate size="fluid" className="@container">
          <div className="flex w-[66%] flex-col items-center text-center">
            <PlatePhoto src={venue.photos[0]} alt="" size={72} priority={priority} />
            <h3 className="mt-2.5 line-clamp-2 text-[clamp(1rem,6cqw,1.25rem)] leading-tight font-extrabold">
              {venue.name}
            </h3>
            {kind && <p className="text-ink-muted mt-1 line-clamp-1 text-sm">{kind}</p>}
            <p className="text-cloth-ink mt-1.5 text-[0.6875rem] font-bold tracking-[0.12em] uppercase rtl:tracking-normal">
              {t("exampleLabel")}
            </p>
          </div>
        </Plate>
      </Link>

      <div className="text-on-cloth-muted flex flex-col items-center gap-1 text-sm">
        {place && <p className="line-clamp-2">{place}</p>}
        {open && (
          <p className={cn("flex items-center gap-1.5 font-bold", open.isOpen && "text-on-cloth")}>
            <span
              aria-hidden
              className={cn("size-2 rounded-full", open.isOpen ? "bg-brass" : "border-on-cloth-muted border")}
            />
            {open.label}
          </p>
        )}
        {venue.dishCount > 0 && <p>{t("dishCount", { count: venue.dishCount })}</p>}
      </div>

      {venue.languages.length > 1 && (
        <ul className="flex flex-wrap justify-center gap-2" aria-label={t("menuLanguages")}>
          {venue.languages.map((lang, i) => (
            <li
              key={lang}
              lang={lang}
              style={{ "--tilt": `${[-2, 1.5, -1, 2][i % 4]}deg` } as React.CSSProperties}
              className="bg-place-card text-place-card-ink rotate-[var(--tilt)] [[dir=rtl]_&]:rotate-[calc(var(--tilt)*-1)] rounded-[4px] px-2.5 py-1 text-sm font-bold shadow-[0_6px_10px_rgb(20_4_8/0.3)] "
            >
              {LANGUAGE_NAMES[lang]}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
