// src/components/colors/ColorThemeEditor.tsx
"use client";

import { useRef, useState, useTransition, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  CircleAlert,
  Moon,
  Palette,
  Sun,
  TriangleAlert,
  Wand2,
} from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ToggleRow } from "~/components/forms/fields";
import {
  MenuColorPreview,
  type PreviewMenu,
} from "~/components/colors/MenuColorPreview";
import {
  setBrandColorEnabled,
  updateColorTheme,
} from "~/app/actions/restaurant-settings";
import { isBrandColor } from "~/lib/brand-color";
import {
  COLOR_ROLES,
  DEFAULT_THEME,
  PRESETS,
  contrastWarnings,
  darkFromLight,
  paletteTokens,
  type ColorRole,
  type ColorTheme,
  type ThemeMode,
} from "~/lib/color-theme";
import { useUnsavedChangesGuard } from "~/lib/unsaved-changes";
import { cn } from "~/lib/utils";

interface ColorThemeEditorProps {
  restaurantId: string;
  // Only admins see the on/off switch; owners get the editor once it's on.
  isAdmin: boolean;
  enabled: boolean;
  // What the editor starts from (saved theme, or built from the old brand colour).
  startTheme: ColorTheme;
  hasSavedTheme: boolean;
  menu: PreviewMenu;
}

const copy = (theme: ColorTheme): ColorTheme => ({
  light: { ...theme.light },
  dark: { ...theme.dark },
});

// One colour: a swatch picker and its hex code, highlighted while its part
// of the preview is hovered or after that part was clicked.
function ColorControl({
  role,
  value,
  active,
  onChange,
}: {
  role: ColorRole;
  value: string;
  active: boolean;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("ColorTheme.roles");
  const [draft, setDraft] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  // Follow outside changes (presets, the other mode, discarding).
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  return (
    <div
      id={`color-${role}`}
      className={cn(
        "rounded-lg border p-3 transition-colors",
        active
          ? "border-sky-500 bg-sky-500/5 ring-2 ring-sky-500/30"
          : "border-border",
      )}
    >
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={t(`${role}.label`)}
          className="border-border h-10 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
        />
        <div className="min-w-0 flex-1">
          <label
            htmlFor={`color-${role}-hex`}
            className="block text-sm font-medium"
          >
            {t(`${role}.label`)}
          </label>
          <p className="text-muted-foreground text-xs">{t(`${role}.hint`)}</p>
        </div>
        <Input
          id={`color-${role}-hex`}
          dir="ltr"
          value={draft}
          maxLength={7}
          onChange={(e) => {
            const next = e.target.value.trim();
            setDraft(next);
            if (isBrandColor(next)) onChange(next.toLowerCase());
          }}
          aria-invalid={!isBrandColor(draft) ? true : undefined}
          className="h-8 w-24 shrink-0 font-mono text-xs"
        />
      </div>
    </div>
  );
}

/**
 * The colours page: a live preview of the restaurant's menu next to its six
 * colours, for light and dark mode. Hovering a part of the preview
 * highlights the colour behind it; clicking jumps to that colour.
 */
export function ColorThemeEditor({
  restaurantId,
  isAdmin,
  enabled,
  startTheme,
  hasSavedTheme,
  menu,
}: ColorThemeEditorProps) {
  const t = useTranslations("ColorTheme");
  const tUnsaved = useTranslations("UnsavedChanges");
  const router = useRouter();
  const [isToggling, startToggle] = useTransition();
  const [isSaving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [initial, setInitial] = useState(() => copy(startTheme));
  const [theme, setTheme] = useState(() => copy(startTheme));
  const [mode, setMode] = useState<ThemeMode>("light");
  const isDirty = JSON.stringify(theme) !== JSON.stringify(initial);
  useUnsavedChangesGuard(isDirty && !isSaving, tUnsaved("confirmLeave"));

  // Which colours the pointer is over in the preview, and the last clicked.
  const [hovered, setHovered] = useState<ColorRole[]>([]);
  const [selected, setSelected] = useState<ColorRole | null>(null);
  const hoveredEl = useRef<HTMLElement | null>(null);

  const markHovered = (el: HTMLElement | null) => {
    if (hoveredEl.current === el) return;
    hoveredEl.current?.removeAttribute("data-hovered");
    hoveredEl.current = el;
    el?.setAttribute("data-hovered", "");
    setHovered(el ? ((el.dataset.role ?? "").split(" ") as ColorRole[]) : []);
  };

  const select = (role: ColorRole) => {
    setSelected(role);
    const control = document.getElementById(`color-${role}`);
    control?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    document
      .getElementById(`color-${role}-hex`)
      ?.focus({ preventScroll: true });
  };

  const setColor = (role: ColorRole, value: string) => {
    setSaved(false);
    setTheme((current) => ({
      ...current,
      [mode]: { ...current[mode], [role]: value },
    }));
  };

  const palette = theme[mode];
  const previewStyle = Object.fromEntries(
    Object.entries(paletteTokens(palette)).map(([token, value]) => [
      `--${token}`,
      value,
    ]),
  ) as CSSProperties;
  const warnings = contrastWarnings(palette);

  const toggle = (next: boolean) => {
    setError(null);
    startToggle(async () => {
      const result = await setBrandColorEnabled(restaurantId, next);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  };

  const save = (next: ColorTheme | null) => {
    setError(null);
    startSave(async () => {
      const result = await updateColorTheme(restaurantId, next);
      if (!result.ok) return setError(result.error);
      const kept = copy(next ?? DEFAULT_THEME);
      setInitial(kept);
      setTheme(kept);
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <section className="bg-card border-border space-y-4 rounded-xl border p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Palette className="h-4 w-4" aria-hidden /> {t("title")}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">{t("intro")}</p>
        </div>
        {isAdmin && (
          <ToggleRow
            id="custom-colors-enabled"
            title={t("enableTitle")}
            description={t("enableText")}
            checked={enabled}
            onCheckedChange={(next) => !isToggling && toggle(next)}
          />
        )}
        {!enabled && !isAdmin && (
          <p className="text-muted-foreground text-sm">{t("notEnabled")}</p>
        )}
      </section>

      {enabled && (
        <>
          <section aria-labelledby="presets-title" className="space-y-2">
            <h3 id="presets-title" className="text-sm font-medium">
              {t("presetsLabel")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSaved(false);
                    setTheme(copy(preset.theme));
                  }}
                  className="border-border hover:bg-accent bg-card inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
                >
                  <span
                    className="flex -space-x-1 rtl:space-x-reverse"
                    aria-hidden
                  >
                    {(
                      ["background", "primary", "secondary", "accent"] as const
                    ).map((role) => (
                      <span
                        key={role}
                        className="ring-card h-4 w-4 rounded-full ring-2"
                        style={{ background: preset.theme[mode][role] }}
                      />
                    ))}
                  </span>
                  {t(`presets.${preset.id}`)}
                </button>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label={t("modeLabel")}
              className="bg-muted inline-flex rounded-lg p-1"
            >
              {(["light", "dark"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    mode === m
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "light" ? (
                    <Sun className="h-4 w-4" aria-hidden />
                  ) : (
                    <Moon className="h-4 w-4" aria-hidden />
                  )}
                  {t(m)}
                </button>
              ))}
            </div>
            {mode === "dark" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSaved(false);
                  setTheme((current) => ({
                    ...current,
                    dark: darkFromLight(current.light),
                  }));
                }}
              >
                <Wand2 className="h-4 w-4" /> {t("generateDark")}
              </Button>
            )}
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section aria-labelledby="preview-title" className="space-y-2">
              <h3 id="preview-title" className="text-sm font-medium">
                {t("previewLabel")}
              </h3>
              <p className="text-muted-foreground text-xs">
                {t("previewHint")}
              </p>
              <div
                style={previewStyle}
                // Mouse and touch only: the controls on the side do the same
                // job from the keyboard.
                onMouseOver={(e) =>
                  markHovered(
                    (e.target as Element).closest<HTMLElement>("[data-role]"),
                  )
                }
                onMouseLeave={() => markHovered(null)}
                onClickCapture={(e) => {
                  e.preventDefault();
                  const el = (e.target as Element).closest<HTMLElement>(
                    "[data-role]",
                  );
                  const role = el?.dataset.role?.split(" ")[0] as
                    | ColorRole
                    | undefined;
                  if (role) select(role);
                }}
                className="border-border cursor-pointer overflow-hidden rounded-xl border shadow-sm [&_[data-hovered]]:outline-2 [&_[data-hovered]]:outline-offset-2 [&_[data-hovered]]:outline-sky-500 [&_[data-hovered]]:outline-dashed"
              >
                <MenuColorPreview menu={menu} />
              </div>
            </section>

            <section
              aria-labelledby="colors-title"
              className="space-y-2 lg:sticky lg:top-20"
            >
              <h3 id="colors-title" className="text-sm font-medium">
                {t("colorsLabel", { mode: t(mode) })}
              </h3>
              {COLOR_ROLES.map((role) => (
                <ColorControl
                  key={`${mode}-${role}`}
                  role={role}
                  value={palette[role]}
                  active={hovered.includes(role) || selected === role}
                  onChange={(value) => setColor(role, value)}
                />
              ))}

              {warnings.length > 0 && (
                <ul className="space-y-1 pt-1" aria-live="polite">
                  {warnings.map(({ warning, roles }) => (
                    <li key={warning}>
                      <button
                        type="button"
                        onClick={() => select(roles[0]!)}
                        className="text-attention inline-flex items-start gap-1.5 text-start text-xs hover:underline"
                      >
                        <TriangleAlert
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden
                        />
                        {t(`warnings.${warning}`)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="bg-card border-border sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t px-4 py-3 sm:mx-0 sm:rounded-xl sm:border">
            <Button onClick={() => save(theme)} disabled={!isDirty || isSaving}>
              {isSaving ? t("saving") : t("save")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setTheme(copy(initial))}
              disabled={!isDirty || isSaving}
            >
              {t("discard")}
            </Button>
            {hasSavedTheme && (
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive ms-auto"
                disabled={isSaving}
                onClick={() =>
                  window.confirm(t("useDefaultConfirm")) && save(null)
                }
              >
                {t("useDefault")}
              </Button>
            )}
            {saved && !isDirty && (
              <span
                className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400"
                role="status"
              >
                <Check className="h-4 w-4" /> {t("saved")}
              </span>
            )}
            {error && (
              <span
                className="text-destructive inline-flex items-center gap-1.5 text-sm"
                role="alert"
              >
                <CircleAlert className="h-4 w-4 shrink-0" /> {error}
              </span>
            )}
          </div>
        </>
      )}

      {!enabled && error && (
        <p
          className="text-destructive inline-flex items-center gap-1.5 text-sm"
          role="alert"
        >
          <CircleAlert className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
