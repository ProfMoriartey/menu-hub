// src/components/public/OpeningHours.tsx
"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "~/lib/utils";
import {
  WEEK_DAYS,
  dayName,
  describeOpenStatus,
  formatTime,
  zonedTime,
  type OpeningHours,
} from "~/lib/opening-hours";

interface Props {
  hours: OpeningHours | null;
  timeZone: string | null;
}

/**
 * The time now, in the browser. Null until the page has loaded: public pages
 * are cached and shared by every guest, so the server can't know it. Moves
 * on every minute, so "Open now" turns to "Closed" on a page left open.
 */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

/**
 * "Open now · until 23:00" or "Closed · opens tomorrow at 09:00", now in the
 * restaurant's time zone. Nothing without hours.
 */
export function OpeningStatus({
  hours,
  timeZone,
  className,
  size = "md",
}: Props & { className?: string; size?: "sm" | "md" }) {
  const t = useTranslations("PublicMenu");
  const locale = useLocale();
  const now = useNow();
  if (!hours || !timeZone) return null;
  const status = now && describeOpenStatus(hours, timeZone, now, t, locale);

  return (
    <p
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm"
          ? "gap-1.5 px-2 py-0.5 text-xs"
          : "gap-2 px-3 py-1 text-sm",
        status?.isOpen
          ? "bg-card text-primary"
          : "bg-muted text-muted-foreground",
        // Holds its place until the time is known, so nothing moves.
        !status && "invisible",
        className,
      )}
      aria-hidden={!status}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status?.isOpen ? "bg-primary" : "bg-muted-foreground/60",
        )}
        aria-hidden
      />
      {status ? (
        <span>
          {status.label}
          {status.detail && (
            <span className="font-normal"> · {status.detail}</span>
          )}
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </p>
  );
}

/** "Open now · until 23:00" as a line of text, for lists of branches. */
export function OpenStatusText({
  hours,
  timeZone,
  className,
}: Props & { className?: string }) {
  const t = useTranslations("PublicMenu");
  const locale = useLocale();
  const now = useNow();
  if (!hours || !timeZone) return null;
  // Worked out in the browser: hold the line's place until then, so the
  // header doesn't shift when it appears.
  if (!now) return <span aria-hidden className={cn("block", className)}>&nbsp;</span>;
  const status = describeOpenStatus(hours, timeZone, now, t, locale);

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 font-medium",
        // The restaurant's colour, darkened to 4.5:1 (lib/color-theme).
        status.isOpen ? "text-primary" : "text-muted-foreground",
        className,
      )}
    >
      {/* The dot is drawn, not a glyph: "●" pulls in symbol font subsets. */}
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-current" />
      {[status.label, status.detail].filter(Boolean).join(" · ")}
    </span>
  );
}

export function OpeningHoursTable({ hours, timeZone }: Props) {
  const t = useTranslations("PublicMenu");
  const locale = useLocale();
  const now = useNow();
  if (!hours || !timeZone) return null;
  const today = now && zonedTime(now, timeZone).day;

  return (
    <table className="w-full text-start">
      <caption className="sr-only">{t("hoursHeading")}</caption>
      <tbody>
        {WEEK_DAYS.map((day) => (
          <tr
            key={day}
            className={cn(
              "border-border border-b last:border-b-0",
              day === today && "bg-muted font-semibold",
            )}
            aria-current={day === today ? "date" : undefined}
          >
            <th scope="row" className="px-2 py-2 text-start font-medium">
              {dayName(day, locale)}
              {day === today && (
                <span className="text-primary ms-2 text-xs">{t("today")}</span>
              )}
            </th>
            <td className="px-2 py-2 text-end tabular-nums" dir="ltr">
              {hours[day].length === 0 ? (
                <span className="text-muted-foreground" dir="auto">
                  {t("closedDay")}
                </span>
              ) : (
                hours[day]
                  .map(
                    (range) =>
                      `${formatTime(range.open, locale)} – ${formatTime(range.close, locale)}`,
                  )
                  .join(", ")
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
