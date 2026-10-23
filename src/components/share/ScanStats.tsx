// src/components/share/ScanStats.tsx
"use client";

import { useState, type KeyboardEvent } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ScanLine } from "lucide-react";
import type { ScanStats as ScanStatsData } from "~/server/qr-scans";
import { cn } from "~/lib/utils";

// Validated against both theme surfaces (light #FAFAF9, dark #44403C): the
// theme's lighter dark-mode amber falls outside the chart lightness band.
const BAR_COLOR = "#D97706";
const CHART_HEIGHT = 128;

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border rounded-lg border px-4 py-3">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function ScanStats({ stats }: { stats: ScanStatsData }) {
  const t = useTranslations("Share");
  const format = useFormatter();
  const [active, setActive] = useState<number | null>(null);

  const max = Math.max(...stats.days.map((d) => d.count));
  // A clean top value for the scale (1, 2, 5, 10, 20, 50…).
  const top =
    max <= 0
      ? 1
      : (() => {
          const step = 10 ** Math.floor(Math.log10(max));
          return [1, 2, 5, 10].map((m) => m * step).find((v) => v >= max)!;
        })();

  const dayLabel = (day: string, long = false) =>
    format.dateTime(new Date(`${day}T00:00:00Z`), {
      day: "numeric",
      month: long ? "long" : "short",
      timeZone: "UTC",
    });
  const compact = (n: number) =>
    format.number(n, { notation: n >= 10_000 ? "compact" : "standard" });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const forward = e.key === "ArrowRight";
    setActive((i) => {
      const current = i ?? stats.days.length - 1;
      return Math.min(
        stats.days.length - 1,
        Math.max(0, current + (forward ? 1 : -1)),
      );
    });
  };

  const activeDay = active !== null ? stats.days[active] : null;

  return (
    <section
      aria-labelledby="scans-title"
      className="bg-card border-border rounded-xl border shadow-sm"
    >
      <header className="border-border border-b px-5 py-4 sm:px-6">
        <h2 id="scans-title" className="text-base font-semibold">
          {t("scansTitle")}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {t("scansDescription")}
        </p>
      </header>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div className="grid grid-cols-3 gap-3">
          <StatTile label={t("last7")} value={compact(stats.last7)} />
          <StatTile label={t("last30")} value={compact(stats.last30)} />
          <StatTile label={t("allTime")} value={compact(stats.total)} />
        </div>

        {stats.total === 0 ? (
          <div className="border-border flex flex-col items-center rounded-lg border border-dashed px-6 py-8 text-center">
            <ScanLine
              className="text-muted-foreground mb-2 h-7 w-7"
              aria-hidden
            />
            <p className="text-muted-foreground max-w-sm text-sm">
              {t("noScans")}
            </p>
          </div>
        ) : (
          <figure className="space-y-2">
            <figcaption className="text-muted-foreground text-sm">
              {t("chartTitle")}
            </figcaption>

            {/* Time runs left to right in every language, oldest day first. */}
            <div
              className="relative"
              dir="ltr"
              style={{ height: CHART_HEIGHT }}
            >
              {/* Recessive scale: a hairline at the top value and the baseline. */}
              <span className="text-muted-foreground absolute start-0 -top-2 text-xs tabular-nums">
                {compact(top)}
              </span>
              <div
                className="border-border absolute inset-x-0 top-0 ms-8 border-t"
                aria-hidden
              />
              <div
                className="border-border absolute inset-x-0 bottom-0 ms-8 border-t"
                aria-hidden
              />

              <div
                role="img"
                aria-label={t("chartLabel", { total: stats.last30 })}
                tabIndex={0}
                onKeyDown={onKeyDown}
                onBlur={() => setActive(null)}
                onPointerLeave={() => setActive(null)}
                className="focus-visible:ring-ring/50 absolute inset-0 ms-8 flex items-end gap-[2px] rounded-sm outline-none focus-visible:ring-[3px]"
              >
                {stats.days.map((d, i) => (
                  // The whole column is the hover target, not just the bar.
                  <div
                    key={d.day}
                    onPointerEnter={() => setActive(i)}
                    className="flex h-full flex-1 items-end justify-center"
                  >
                    <div
                      className={cn(
                        "w-full max-w-6 rounded-t-[4px] transition-opacity",
                        active !== null && active !== i && "opacity-40",
                      )}
                      style={{
                        height:
                          d.count === 0
                            ? 0
                            : Math.max(2, (d.count / top) * CHART_HEIGHT),
                        backgroundColor: BAR_COLOR,
                      }}
                    />
                  </div>
                ))}
              </div>

              {activeDay && active !== null && (
                <div
                  role="status"
                  className="bg-popover text-popover-foreground border-border pointer-events-none absolute -top-12 z-10 rounded-md border px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md"
                  style={{
                    left: `calc(2rem + (100% - 2rem) * ${(active + 0.5) / stats.days.length})`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <span dir="auto">
                    <strong className="font-semibold">
                      {t("scanCount", { count: activeDay.count })}
                    </strong>{" "}
                    <span className="text-muted-foreground">
                      {dayLabel(activeDay.day, true)}
                    </span>
                  </span>
                </div>
              )}
            </div>

            <div
              className="text-muted-foreground ms-8 flex justify-between text-xs"
              dir="ltr"
              aria-hidden
            >
              <span>{dayLabel(stats.days[0]!.day)}</span>
              <span>{dayLabel(stats.days[stats.days.length - 1]!.day)}</span>
            </div>

            {/* Every value, for screen readers. */}
            <table className="sr-only">
              <caption>{t("chartTitle")}</caption>
              <thead>
                <tr>
                  <th scope="col">{t("dayColumn")}</th>
                  <th scope="col">{t("scansColumn")}</th>
                </tr>
              </thead>
              <tbody>
                {stats.days.map((d) => (
                  <tr key={d.day}>
                    <td>{dayLabel(d.day, true)}</td>
                    <td>{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
        )}

        <p className="text-muted-foreground text-xs">{t("scansNote")}</p>
      </div>
    </section>
  );
}
