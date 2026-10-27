// src/components/menus/MenuCard.tsx
import Image from "next/image";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import { VenueTypeIcon } from "~/components/shared/VenueTypeIcon";
import { cn } from "~/lib/utils";
import type { DirectoryVenue } from "~/lib/menus-directory";

/**
 * A venue on the Menus page: a strip of its own dish photos, so guests see
 * the food before they open the menu, then its name, type, place, whether
 * it's open and the languages its menu is in. The whole card is one link.
 */
export function MenuCard({
  venue,
  priority,
  hideCountry,
  className,
}: {
  venue: DirectoryVenue;
  priority?: boolean;
  // When every card shown is in the same country, the city says enough.
  hideCountry?: boolean;
  className?: string;
}) {
  const t = useTranslations("MenusPage");
  const kind = [venue.typeLabel, venue.cuisine].filter(Boolean).join(" · ");
  const place = [venue.city, hideCountry ? null : venue.country].filter(Boolean).join(", ");

  return (
    <Link
      href={`/${venue.slug}`}
      className={cn(
        "group bg-card text-card-foreground border-border flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md",
        "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="relative">
        <PhotoStrip venue={venue} priority={priority} />
        <RestaurantLogo
          restaurant={venue}
          className="border-background absolute start-3 -bottom-6 h-14 w-14 rounded-xl border-2 text-lg shadow-sm"
          imageSizes="56px"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-4 pt-8 pb-4">
        <h3 className="line-clamp-1 text-lg font-semibold group-hover:underline">{venue.name}</h3>
        {kind && (
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <VenueTypeIcon type={venue.type} className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{kind}</span>
          </p>
        )}
        {place && (
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            <span className="line-clamp-1">{place}</span>
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          {venue.open && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                venue.open.isOpen
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  venue.open.isOpen ? "bg-emerald-500" : "bg-muted-foreground/60",
                )}
                aria-hidden
              />
              {venue.open.label}
            </span>
          )}
          {venue.dishCount > 0 && (
            <span className="text-muted-foreground text-xs">
              {t("dishCount", { count: venue.dishCount })}
            </span>
          )}
          {venue.languages.length > 1 && (
            <span className="text-muted-foreground ms-auto font-mono text-[11px] tracking-wide uppercase">
              <span className="sr-only">{t("menuLanguages")}: </span>
              {venue.languages.join(" · ")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// One large photo beside two small ones; fewer photos fill the space
// between them; none shows the venue type's icon on a soft panel.
function PhotoStrip({ venue, priority }: { venue: DirectoryVenue; priority?: boolean }) {
  const photos = venue.photos.slice(0, 3);
  if (photos.length === 0) {
    return (
      <div className="bg-primary/10 text-primary/60 flex aspect-[16/9] items-center justify-center">
        <VenueTypeIcon type={venue.type} className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-muted grid aspect-[16/9] gap-0.5",
        photos.length === 3 ? "grid-cols-3 grid-rows-2" : photos.length === 2 ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      {photos.map((src, i) => (
        <div
          key={src}
          className={cn(
            "relative overflow-hidden",
            photos.length === 3 && (i === 0 ? "col-span-2 row-span-2" : "col-span-1"),
          )}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={priority && i === 0}
            sizes={
              photos.length === 3 && i > 0
                ? "(min-width: 1024px) 110px, (min-width: 640px) 25vw, 33vw"
                : "(min-width: 1024px) 330px, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
