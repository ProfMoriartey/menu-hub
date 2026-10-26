// src/components/menu-languages/MenuLanguagesSettings.tsx
"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, CircleAlert, Languages } from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Field, ToggleRow } from "~/components/forms/fields";
import {
  setMultilingualEnabled,
  updateMenuLanguages,
} from "~/app/actions/menu-languages";
import {
  LANGUAGE_NAMES,
  MENU_LANGUAGES,
  isMenuLanguage,
  type MenuLanguage,
  type RestaurantTranslations,
} from "~/lib/menu-languages";
import { cn } from "~/lib/utils";

interface MenuLanguagesSettingsProps {
  restaurantId: string;
  // Only admins see the on/off switch; owners see the languages once it's on.
  isAdmin: boolean;
  enabled: boolean;
  mainLanguage: string | null;
  extraLanguages: string[];
  description: string | null;
  translations: RestaurantTranslations | null;
}

/**
 * Menus in several languages for one restaurant. Shared by the admin edit
 * page and the owner's Details tab; the server actions check who may change
 * what (admins switch it on, owners and admins pick languages).
 */
export function MenuLanguagesSettings({
  restaurantId,
  isAdmin,
  enabled,
  mainLanguage,
  extraLanguages,
  description,
  translations,
}: MenuLanguagesSettingsProps) {
  const t = useTranslations("MenuLanguages");
  const router = useRouter();
  const [isToggling, startToggle] = useTransition();
  const [isSaving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const initial = {
    main: isMenuLanguage(mainLanguage) ? mainLanguage : null,
    extra: extraLanguages.filter(isMenuLanguage),
    // Missing = not translated: shows the main description, saved as nothing.
    descriptions: Object.fromEntries(
      MENU_LANGUAGES.flatMap((lang) => {
        const text = translations?.[lang]?.description;
        return text ? [[lang, text]] : [];
      }),
    ) as Partial<Record<MenuLanguage, string>>,
  };
  const [values, setValues] = useState(initial);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initial);

  const toggle = (next: boolean) => {
    setError(null);
    startToggle(async () => {
      const result = await setMultilingualEnabled(restaurantId, next);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  };

  const toggleExtra = (lang: MenuLanguage) => {
    setSaved(false);
    setValues((v) => ({
      ...v,
      extra: v.extra.includes(lang)
        ? v.extra.filter((l) => l !== lang)
        : [...v.extra, lang],
    }));
  };

  const save = () => {
    if (!values.main) return;
    setError(null);
    startSave(async () => {
      const extra = values.extra.filter((l) => l !== values.main);
      const result = await updateMenuLanguages(restaurantId, {
        mainLanguage: values.main!,
        extraLanguages: extra,
        descriptions: Object.fromEntries(
          extra.map((lang) => [
            lang,
            { description: values.descriptions[lang] },
          ]),
        ),
      });
      if (!result.ok) return setError(result.error);
      setSaved(true);
      router.refresh();
    });
  };

  const extraChoices = MENU_LANGUAGES.filter((lang) => lang !== values.main);
  const activeExtra = values.extra.filter((lang) => lang !== values.main);

  return (
    <section
      aria-labelledby="menu-languages-title"
      className="bg-card border-border space-y-5 rounded-xl border p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2
          id="menu-languages-title"
          className="flex items-center gap-2 text-base font-semibold"
        >
          <Languages className="h-4 w-4" aria-hidden /> {t("title")}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">{t("intro")}</p>
      </div>

      {isAdmin && (
        <ToggleRow
          id="multilingual-enabled"
          title={t("enableTitle")}
          description={t("enableText")}
          checked={enabled}
          onCheckedChange={(next) => !isToggling && toggle(next)}
        />
      )}

      {!enabled ? (
        !isAdmin && (
          <p className="text-muted-foreground text-sm">{t("notEnabled")}</p>
        )
      ) : (
        <div className="space-y-5">
          <Field
            label={t("mainLabel")}
            htmlFor="main-language"
            hint={t("mainHint")}
          >
            <Select
              value={values.main ?? undefined}
              onValueChange={(lang) => {
                setSaved(false);
                if (isMenuLanguage(lang))
                  setValues((v) => ({ ...v, main: lang }));
              }}
            >
              <SelectTrigger id="main-language" className="w-full sm:w-64">
                <SelectValue placeholder={t("mainPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {MENU_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang} lang={lang}>
                    {LANGUAGE_NAMES[lang]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {values.main && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">{t("extraLabel")}</legend>
              <p className="text-muted-foreground text-sm">{t("extraHint")}</p>
              <div className="flex flex-wrap gap-2">
                {extraChoices.map((lang) => {
                  const on = values.extra.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      lang={lang}
                      aria-pressed={on}
                      onClick={() => toggleExtra(lang)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                        "focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-accent",
                      )}
                    >
                      {on && <Check className="h-3.5 w-3.5" aria-hidden />}
                      {LANGUAGE_NAMES[lang]}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {activeExtra.map((lang) => (
            <Field
              key={lang}
              label={t("descriptionIn", { language: LANGUAGE_NAMES[lang] })}
              htmlFor={`description-${lang}`}
            >
              <Textarea
                id={`description-${lang}`}
                lang={lang}
                dir={lang === "ar" ? "rtl" : "ltr"}
                rows={3}
                maxLength={2000}
                value={values.descriptions[lang] ?? description ?? ""}
                className={cn(
                  values.descriptions[lang] === undefined &&
                    "text-muted-foreground",
                )}
                onChange={(e) => {
                  setSaved(false);
                  const text = e.target.value;
                  setValues((v) => ({
                    ...v,
                    descriptions: { ...v.descriptions, [lang]: text },
                  }));
                }}
              />
            </Field>
          ))}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={save}
              disabled={!values.main || !isDirty || isSaving}
            >
              {isSaving ? t("saving") : t("save")}
            </Button>
            {saved && !isDirty && (
              <span
                className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400"
                role="status"
              >
                <Check className="h-4 w-4" /> {t("saved")}
              </span>
            )}
            {!values.main && (
              <span className="text-muted-foreground text-sm">
                {t("chooseMainFirst")}
              </span>
            )}
          </div>
        </div>
      )}

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
