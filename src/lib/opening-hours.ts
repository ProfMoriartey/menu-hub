// src/lib/opening-hours.ts
// Weekly opening hours and "open now". Browser-safe: used by the settings
// card, the public pages and the server actions.

export const WEEK_DAYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

/** "HH:MM", 24-hour. A range closing at or before it opens runs past midnight. */
export interface TimeRange {
  open: string;
  close: string;
}

// Every day is present; an empty list means closed that day.
export type OpeningHours = Record<WeekDay, TimeRange[]>;

// Lunch and dinner, plus one more; anything beyond is likely a mistake.
export const MAX_RANGES_PER_DAY = 3;

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;
const toMinutes = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY;

export const emptyHours = (): OpeningHours =>
  Object.fromEntries(
    WEEK_DAYS.map((day) => [day, []]),
  ) as unknown as OpeningHours;

/**
 * Checks hours sent by a form: every day, at most MAX_RANGES_PER_DAY ranges
 * of valid times. Returns null when anything is off, so nothing half-valid
 * is stored. Ranges are sorted by opening time.
 */
export function parseOpeningHours(raw: unknown): OpeningHours | null {
  if (!raw || typeof raw !== "object") return null;
  const hours = emptyHours();
  for (const day of WEEK_DAYS) {
    const ranges = (raw as Record<string, unknown>)[day];
    if (!Array.isArray(ranges) || ranges.length > MAX_RANGES_PER_DAY)
      return null;
    for (const range of ranges) {
      if (!range || typeof range !== "object") return null;
      const { open, close } = range as Record<string, unknown>;
      if (typeof open !== "string" || typeof close !== "string") return null;
      if (!TIME.test(open) || !TIME.test(close)) return null;
      hours[day].push({ open, close });
    }
    hours[day].sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
  }
  return hours;
}

export function isValidTimeZone(timeZone: unknown): timeZone is string {
  if (typeof timeZone !== "string" || !timeZone || timeZone.length > 64)
    return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** The weekday and minutes since midnight at `date` in `timeZone`. */
export function zonedTime(
  date: Date,
  timeZone: string,
): { day: WeekDay; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const day = part("weekday").slice(0, 3).toLowerCase() as WeekDay;
  return { day, minutes: Number(part("hour")) * 60 + Number(part("minute")) };
}

export type OpenStatus =
  | { open: true; closesAt: string }
  // `opensDay` is the day it opens next; `inDays` 0 = later today, 1 = tomorrow.
  | { open: false; opensAt: string; opensDay: WeekDay; inDays: number }
  // Hours are set but the restaurant never opens (every day closed).
  | { open: false; opensAt: null };

/**
 * Whether the restaurant is open at `now`, and until when, or when it opens
 * next. Ranges past midnight count on the next day too; a range opening and
 * closing at the same time means open around the clock.
 */
export function openStatus(
  hours: OpeningHours,
  timeZone: string,
  now: Date,
): OpenStatus {
  // Every range as minutes from Monday 00:00.
  const intervals = WEEK_DAYS.flatMap((day, index) =>
    hours[day].map(({ open, close }) => {
      const start = index * MINUTES_PER_DAY + toMinutes(open);
      const length =
        (toMinutes(close) - toMinutes(open) + MINUTES_PER_DAY) %
          MINUTES_PER_DAY || MINUTES_PER_DAY;
      return { start, end: start + length, close };
    }),
  );
  if (intervals.length === 0) return { open: false, opensAt: null };

  const { day, minutes } = zonedTime(now, timeZone);
  const current = WEEK_DAYS.indexOf(day) * MINUTES_PER_DAY + minutes;

  // A Sunday-night range can still be open early on Monday: check a week on.
  const openNow = intervals.find(
    ({ start, end }) =>
      (current >= start && current < end) ||
      (current + MINUTES_PER_WEEK >= start && current + MINUTES_PER_WEEK < end),
  );
  if (openNow) return { open: true, closesAt: openNow.close };

  const next = intervals
    .map((interval) => ({
      ...interval,
      wait: (interval.start - current + MINUTES_PER_WEEK) % MINUTES_PER_WEEK,
    }))
    .sort((a, b) => a.wait - b.wait)[0]!;
  const opensIndex = Math.floor(next.start / MINUTES_PER_DAY);
  return {
    open: false,
    opensAt: `${String(Math.floor((next.start % MINUTES_PER_DAY) / 60)).padStart(2, "0")}:${String(next.start % 60).padStart(2, "0")}`,
    opensDay: WEEK_DAYS[opensIndex]!,
    inDays: (opensIndex - WEEK_DAYS.indexOf(day) + 7) % 7,
  };
}

/** "09:00" in the reader's style ("9:00 AM" in English, "09:00" in Turkish). */
export function formatTime(time: string, locale: string): string {
  const date = new Date(
    Date.UTC(2000, 0, 3, toMinutes(time) / 60, toMinutes(time) % 60),
  );
  return new Intl.DateTimeFormat(`${locale}-u-nu-latn`, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

/** A weekday's name in the reader's language. */
export function dayName(
  day: WeekDay,
  locale: string,
  width: "long" | "short" = "long",
): string {
  // 3 January 2000 was a Monday.
  const date = new Date(Date.UTC(2000, 0, 3 + WEEK_DAYS.indexOf(day)));
  return new Intl.DateTimeFormat(locale, {
    weekday: width,
    timeZone: "UTC",
  }).format(date);
}

/** "YYYY-MM-DD" of `date` in `timeZone` (UTC when none is set). */
export function zonedDay(date: Date, timeZone: string | null): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone ?? "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
