// src/components/restaurant-settings/OpeningHoursSettings.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, CircleAlert, Clock, Plus, X } from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Field } from "~/components/forms/fields";
import { updateOpeningHours } from "~/app/actions/restaurant-settings";
import {
  MAX_RANGES_PER_DAY,
  WEEK_DAYS,
  dayName,
  type OpeningHours,
  type WeekDay,
} from "~/lib/opening-hours";

const DEFAULT_RANGE = { open: "09:00", close: "22:00" };

interface OpeningHoursSettingsProps {
  restaurantId: string;
  timeZone: string | null;
  hours: OpeningHours | null;
}

/**
 * Weekly opening hours and the restaurant's time zone. Shared by the admin
 * edit page and the owner's Details tab (the action checks owner or admin).
 */
export function OpeningHoursSettings({
  restaurantId,
  timeZone,
  hours,
}: OpeningHoursSettingsProps) {
  const t = useTranslations("OpeningHours");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [initial, setInitial] = useState({ timeZone: timeZone ?? "", hours });
  const [values, setValues] = useState(initial);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initial);

  // Built in the browser only: its list of zones can differ from the
  // server's, which would break hydration. Without a saved zone, suggest
  // the browser's own (most owners set this up where the restaurant is).
  const [zones, setZones] = useState<string[]>([]);
  useEffect(() => {
    setZones(Intl.supportedValuesOf("timeZone"));
    if (!timeZone) {
      const own = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setValues((v) => (v.timeZone ? v : { ...v, timeZone: own }));
    }
  }, [timeZone]);

  const update = (next: Partial<typeof values>) => {
    setSaved(false);
    setValues((v) => ({ ...v, ...next }));
  };
  const setDay = (day: WeekDay, ranges: OpeningHours[WeekDay]) =>
    values.hours && update({ hours: { ...values.hours, [day]: ranges } });
  const setRange = (
    day: WeekDay,
    index: number,
    key: "open" | "close",
    time: string,
  ) =>
    values.hours &&
    setDay(
      day,
      values.hours[day].map((range, i) =>
        i === index ? { ...range, [key]: time } : range,
      ),
    );

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateOpeningHours(restaurantId, values);
      if (!result.ok) return setError(result.error);
      setInitial(values);
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <section
      aria-labelledby="opening-hours-title"
      className="bg-card border-border space-y-5 rounded-xl border p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2
          id="opening-hours-title"
          className="flex items-center gap-2 text-base font-semibold"
        >
          <Clock className="h-4 w-4" aria-hidden /> {t("title")}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">{t("intro")}</p>
      </div>

      <Field
        label={t("timeZoneLabel")}
        htmlFor="time-zone"
        hint={t("timeZoneHint")}
      >
        <Input
          id="time-zone"
          list="time-zones"
          dir="ltr"
          autoComplete="off"
          value={values.timeZone}
          onChange={(e) => update({ timeZone: e.target.value })}
          placeholder="Europe/Istanbul"
          className="sm:max-w-xs"
        />
        <datalist id="time-zones">
          {zones.map((zone) => (
            <option key={zone} value={zone} />
          ))}
        </datalist>
      </Field>

      {values.hours === null ? (
        <div className="border-border flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-3">
          <p className="text-muted-foreground text-sm">{t("notSet")}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              update({
                hours: Object.fromEntries(
                  WEEK_DAYS.map((day) => [day, [DEFAULT_RANGE]]),
                ) as unknown as OpeningHours,
              })
            }
          >
            <Plus className="h-3.5 w-3.5" /> {t("add")}
          </Button>
        </div>
      ) : (
        <div className="space-y-1">
          <ul className="divide-border divide-y">
            {WEEK_DAYS.map((day) => {
              const ranges = values.hours![day];
              const open = ranges.length > 0;
              return (
                <li
                  key={day}
                  className="flex flex-wrap items-start gap-x-4 gap-y-2 py-2.5"
                >
                  <div className="flex w-40 shrink-0 items-center gap-3 pt-1.5">
                    <Switch
                      id={`open-${day}`}
                      checked={open}
                      onCheckedChange={(on) =>
                        setDay(day, on ? [DEFAULT_RANGE] : [])
                      }
                    />
                    <label
                      htmlFor={`open-${day}`}
                      className="text-sm font-medium"
                    >
                      {dayName(day, locale)}
                    </label>
                  </div>
                  {!open ? (
                    <p className="text-muted-foreground pt-2 text-sm">
                      {t("closed")}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {ranges.map((range, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2"
                          dir="ltr"
                        >
                          <Input
                            type="time"
                            value={range.open}
                            onChange={(e) =>
                              setRange(day, index, "open", e.target.value)
                            }
                            aria-label={t("opensLabel", {
                              day: dayName(day, locale),
                            })}
                            className="w-32"
                          />
                          <span className="text-muted-foreground" aria-hidden>
                            –
                          </span>
                          <Input
                            type="time"
                            value={range.close}
                            onChange={(e) =>
                              setRange(day, index, "close", e.target.value)
                            }
                            aria-label={t("closesLabel", {
                              day: dayName(day, locale),
                            })}
                            className="w-32"
                          />
                          {ranges.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                setDay(
                                  day,
                                  ranges.filter((_, i) => i !== index),
                                )
                              }
                              aria-label={t("removeRange")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {ranges.length < MAX_RANGES_PER_DAY && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground -ms-2"
                          onClick={() =>
                            setDay(day, [
                              ...ranges,
                              { open: "18:00", close: "22:00" },
                            ])
                          }
                        >
                          <Plus className="h-3.5 w-3.5" /> {t("addRange")}
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="text-muted-foreground text-xs">{t("overnightHint")}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={save}
          disabled={!isDirty || isPending || !values.timeZone}
        >
          {isPending ? t("saving") : t("save")}
        </Button>
        {values.hours && (
          <>
            <Button
              variant="ghost"
              onClick={() =>
                values.hours &&
                update({
                  hours: Object.fromEntries(
                    WEEK_DAYS.map((day) => [
                      day,
                      values.hours!.mon.map((r) => ({ ...r })),
                    ]),
                  ) as unknown as OpeningHours,
                })
              }
            >
              {t("sameEveryDay", { day: dayName("mon", locale) })}
            </Button>
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => update({ hours: null })}
            >
              {t("remove")}
            </Button>
          </>
        )}
        {saved && !isDirty && (
          <span
            className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400"
            role="status"
          >
            <Check className="h-4 w-4" /> {t("saved")}
          </span>
        )}
      </div>

      {error && (
        <p
          className="text-destructive inline-flex items-center gap-1.5 text-sm"
          role="alert"
        >
          <CircleAlert className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
    </section>
  );
}
