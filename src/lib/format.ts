// src/lib/format.ts

// Fixed locale and time zone so server and browser render the same date.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const formatDate = (date: Date | string) => dateFormat.format(new Date(date));
