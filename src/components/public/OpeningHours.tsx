// src/components/public/OpeningHours.tsx
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "~/lib/utils";
import {
  WEEK_DAYS,
  dayName,
  formatTime,
  openStatus,
  zonedTime,
  type OpeningHours,
} from "~/lib/opening-hours";

interface Props {
  hours: OpeningHours | null;
  timeZone: string | null;
}

/**
 * "Open now · until 23:00" or "Closed · opens tomorrow at 09:00", at the
 * time of the request in the restaurant's time zone. Nothing without hours.
 */
export async function OpeningStatus({
  hours,
  timeZone,
  className,
  size = "md",
}: Props & { className?: string; size?: "sm" | "md" }) {
  if (!hours || !timeZone) return null;
  const [t, locale] = await Promise.all([
    getTranslations("PublicMenu"),
    getLocale(),
  ]);
  const status = openStatus(hours, timeZone, new Date());

  let detail: string | null = null;
  if (status.open) {
    detail = t("openUntil", { time: formatTime(status.closesAt, locale) });
  } else if (status.opensAt) {
    const time = formatTime(status.opensAt, locale);
    detail =
      status.inDays === 0
        ? t("opensToday", { time })
        : status.inDays === 1
          ? t("opensTomorrow", { time })
          : t("opensOn", { day: dayName(status.opensDay, locale), time });
  }

  return (
    <p
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm"
          ? "gap-1.5 px-2 py-0.5 text-xs"
          : "gap-2 px-3 py-1 text-sm",
        status.open
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-muted text-muted-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status.open ? "bg-emerald-500" : "bg-muted-foreground/60",
        )}
        aria-hidden
      />
      <span>
        {status.open ? t("openNow") : t("closedNow")}
        {detail && <span className="font-normal"> · {detail}</span>}
      </span>
    </p>
  );
}

/** The week's hours, today highlighted, for the about page. */
export async function OpeningHoursTable({ hours, timeZone }: Props) {
  if (!hours || !timeZone) return null;
  const [t, locale] = await Promise.all([
    getTranslations("PublicMenu"),
    getLocale(),
  ]);
  const today = zonedTime(new Date(), timeZone).day;

  return (
    <table className="w-full text-start">
      <caption className="sr-only">{t("hoursHeading")}</caption>
      <tbody>
        {WEEK_DAYS.map((day) => (
          <tr
            key={day}
            className={cn(
              "border-border border-b last:border-b-0",
              day === today && "font-semibold",
            )}
            aria-current={day === today ? "date" : undefined}
          >
            <th scope="row" className="py-2 pe-4 text-start font-medium">
              {dayName(day, locale)}
              {day === today && (
                <span className="text-primary ms-2 text-xs">{t("today")}</span>
              )}
            </th>
            <td className="py-2 text-end tabular-nums" dir="ltr">
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
