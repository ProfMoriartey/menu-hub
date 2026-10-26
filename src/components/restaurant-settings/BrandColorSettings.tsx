// src/components/restaurant-settings/BrandColorSettings.tsx
"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, CircleAlert, Palette } from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Field, ToggleRow } from "~/components/forms/fields";
import {
  setBrandColorEnabled,
  updateBrandColor,
} from "~/app/actions/restaurant-settings";
import { brandPalette, isBrandColor } from "~/lib/brand-color";

// Shown before an owner has picked one; the theme's own accent.
const THEME_ACCENT = "#d97706";

interface BrandColorSettingsProps {
  restaurantId: string;
  // Only admins see the on/off switch.
  isAdmin: boolean;
  enabled: boolean;
  color: string | null;
}

// A sample of how guests will see the colour: a button and a price, on the
// light and the dark page, after it has been adjusted to stay readable.
function Preview({ color }: { color: string }) {
  const t = useTranslations("BrandColor");
  const palette = brandPalette(color);
  return (
    <div className="grid gap-2 sm:grid-cols-2" aria-hidden>
      {(
        [
          ["light", "#fcf9f4", "#1c1917", palette.light],
          ["dark", "#2a2315", "#fafaf9", palette.dark],
        ] as const
      ).map(([mode, surface, text, { primary, foreground }]) => (
        <div
          key={mode}
          className="border-border flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
          style={{ background: surface, color: text }}
        >
          <span className="text-sm">{t(mode)}</span>
          <span className="flex items-center gap-3">
            <span className="text-lg font-bold" style={{ color: primary }}>
              12.50
            </span>
            <span
              className="rounded-md px-3 py-1.5 text-sm font-medium"
              style={{ background: primary, color: foreground }}
            >
              {t("sampleButton")}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * The restaurant's accent colour on its public pages. Shared by the admin
 * edit page and the owner's Details tab; only admins can switch it on.
 */
export function BrandColorSettings({
  restaurantId,
  isAdmin,
  enabled,
  color,
}: BrandColorSettingsProps) {
  const t = useTranslations("BrandColor");
  const router = useRouter();
  const [isToggling, startToggle] = useTransition();
  const [isSaving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [initial, setInitial] = useState(color);
  const [value, setValue] = useState(color);
  const [draft, setDraft] = useState(color ?? "");

  const pick = (next: string) => {
    setSaved(false);
    setDraft(next);
    if (isBrandColor(next)) setValue(next.toLowerCase());
  };

  const toggle = (next: boolean) => {
    setError(null);
    startToggle(async () => {
      const result = await setBrandColorEnabled(restaurantId, next);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  };

  const save = (next: string | null) => {
    setError(null);
    startSave(async () => {
      const result = await updateBrandColor(restaurantId, next);
      if (!result.ok) return setError(result.error);
      setInitial(next);
      setValue(next);
      setDraft(next ?? "");
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <section
      aria-labelledby="brand-color-title"
      className="bg-card border-border space-y-5 rounded-xl border p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2
          id="brand-color-title"
          className="flex items-center gap-2 text-base font-semibold"
        >
          <Palette className="h-4 w-4" aria-hidden /> {t("title")}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">{t("intro")}</p>
      </div>

      {isAdmin && (
        <ToggleRow
          id="brand-color-enabled"
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
        <div className="space-y-4">
          <Field
            label={t("colorLabel")}
            htmlFor="brand-color-hex"
            hint={t("colorHint")}
          >
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value ?? THEME_ACCENT}
                onChange={(e) => pick(e.target.value)}
                aria-label={t("colorLabel")}
                className="border-border h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1"
              />
              <Input
                id="brand-color-hex"
                dir="ltr"
                value={draft}
                onChange={(e) => pick(e.target.value.trim())}
                placeholder={THEME_ACCENT}
                maxLength={7}
                aria-invalid={
                  draft !== "" && !isBrandColor(draft) ? true : undefined
                }
                className="w-32 font-mono"
              />
            </div>
          </Field>
          <Preview color={value ?? THEME_ACCENT} />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => value && save(value)}
              disabled={!value || value === initial || isSaving}
            >
              {isSaving ? t("saving") : t("save")}
            </Button>
            {initial && (
              <Button
                variant="ghost"
                onClick={() => save(null)}
                disabled={isSaving}
              >
                {t("useTheme")}
              </Button>
            )}
            {saved && value === initial && (
              <span
                className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400"
                role="status"
              >
                <Check className="h-4 w-4" /> {t("saved")}
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
