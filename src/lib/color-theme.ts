// src/lib/color-theme.ts
// A restaurant's own colours on its public pages: seven colours per mode
// (light and dark), from which every colour token the pages use is derived.
// Browser-safe: used by the colours editor, the layout and the actions.
import {
  bestText,
  contrast,
  isBrandColor,
  mix,
  readableOn,
} from "~/lib/brand-color";

export const COLOR_ROLES = [
  "background",
  "card",
  // The menu's top section (logo, name, buttons). Themes saved before it
  // existed get headerFor()'s.
  "header",
  "text",
  "primary",
  "secondary",
  "accent",
] as const;
export type ColorRole = (typeof COLOR_ROLES)[number];

export type Palette = Record<ColorRole, string>;
export interface ColorTheme {
  light: Palette;
  dark: Palette;
}
export type ThemeMode = keyof ColorTheme;

/** A header colour to go with a palette: halfway from secondary to card. */
export const headerFor = (p: Omit<Palette, "header">) => mix(p.secondary, p.card, 0.5);

const withHeader = (theme: { light: Omit<Palette, "header">; dark: Omit<Palette, "header"> }): ColorTheme => ({
  light: { ...theme.light, header: headerFor(theme.light) },
  dark: { ...theme.dark, header: headerFor(theme.dark) },
});

// The site's own colours (globals.css, converted to sRGB): what restaurants
// without custom colours look like.
export const DEFAULT_THEME: ColorTheme = withHeader({
  light: {
    background: "#fcf9f4",
    card: "#fcf9f4",
    text: "#2a2315",
    primary: "#a0611a",
    secondary: "#f8dbbd",
    accent: "#a0611a",
  },
  dark: {
    background: "#1c1608",
    card: "#2a2315",
    text: "#e1dcd1",
    primary: "#f6b200",
    secondary: "#433927",
    accent: "#f6b200",
  },
});

// One-click starting points for owners who'd rather not pick six colours.
export const PRESETS: { id: string; theme: ColorTheme }[] = [
  { id: "default", theme: DEFAULT_THEME },
  {
    id: "ocean",
    theme: withHeader({
      light: {
        background: "#f5f9fc",
        card: "#ffffff",
        text: "#0f2a3d",
        primary: "#0e6ba8",
        secondary: "#d6e9f5",
        accent: "#b9dcf2",
      },
      dark: {
        background: "#0b1620",
        card: "#12212e",
        text: "#dbe8f1",
        primary: "#4fb3f0",
        secondary: "#1d3446",
        accent: "#2a4d66",
      },
    }),
  },
  {
    id: "forest",
    theme: withHeader({
      light: {
        background: "#f6f8f3",
        card: "#ffffff",
        text: "#1f2b1c",
        primary: "#2f7d32",
        secondary: "#dcebd5",
        accent: "#c4e0b8",
      },
      dark: {
        background: "#0f160d",
        card: "#172214",
        text: "#dde7d8",
        primary: "#6cc070",
        secondary: "#24341f",
        accent: "#33502b",
      },
    }),
  },
  {
    id: "berry",
    theme: withHeader({
      light: {
        background: "#fdf6f8",
        card: "#ffffff",
        text: "#33141f",
        primary: "#b0244f",
        secondary: "#f6d9e2",
        accent: "#f0c3d1",
      },
      dark: {
        background: "#1a0b10",
        card: "#261219",
        text: "#f1dde4",
        primary: "#f06a92",
        secondary: "#3a1c27",
        accent: "#55283a",
      },
    }),
  },
  {
    id: "classic",
    theme: withHeader({
      light: {
        background: "#ffffff",
        card: "#f5f5f5",
        text: "#111111",
        primary: "#111111",
        secondary: "#e6e6e6",
        accent: "#d4d4d4",
      },
      dark: {
        background: "#0d0d0d",
        card: "#1a1a1a",
        text: "#ededed",
        primary: "#f2f2f2",
        secondary: "#2a2a2a",
        accent: "#3d3d3d",
      },
    }),
  },
];

// Every colour but the header, which older saved themes don't have.
const isPalette = (value: unknown): value is Omit<Palette, "header"> & { header?: unknown } =>
  !!value &&
  typeof value === "object" &&
  COLOR_ROLES.every(
    (role) => role === "header" || isBrandColor((value as Record<string, unknown>)[role]),
  );

/**
 * A theme sent by a form or saved earlier, lower-cased; null when any colour
 * is invalid or missing (but the header, which headerFor() then fills in).
 */
export function parseColorTheme(raw: unknown): ColorTheme | null {
  if (!raw || typeof raw !== "object") return null;
  const { light, dark } = raw as Record<string, unknown>;
  if (!isPalette(light) || !isPalette(dark)) return null;
  const clean = (p: Omit<Palette, "header"> & { header?: unknown }) => {
    const palette = Object.fromEntries(
      COLOR_ROLES.filter((role) => role !== "header").map((role) => [role, p[role].toLowerCase()]),
    ) as Omit<Palette, "header">;
    return { ...palette, header: isBrandColor(p.header) ? p.header.toLowerCase() : headerFor(palette) };
  };
  return { light: clean(light), dark: clean(dark) };
}

/**
 * A dark version of a light palette, as a starting point: deep surfaces with
 * a trace of the light colours, light text, and primary lightened until it
 * reads on the dark cards.
 */
export function darkFromLight(light: Palette): Palette {
  const background = mix(light.background, "#000000", 0.88);
  const card = mix(light.card, "#000000", 0.82);
  return {
    background,
    card,
    header: mix(light.header, "#000000", 0.8),
    text: mix(light.text, "#ffffff", 0.88),
    primary: readableOn(light.primary, card, "#ffffff"),
    secondary: mix(light.secondary, card, 0.8),
    accent: mix(light.accent, card, 0.55),
  };
}

/**
 * The theme an editor starts from: the saved one, or one built around the
 * single brand colour a restaurant may have picked before, or the default.
 */
export function startingTheme(
  saved: ColorTheme | null,
  brandColor: string | null,
): ColorTheme {
  const valid = saved && parseColorTheme(saved);
  if (valid) return valid;
  if (!brandColor || !isBrandColor(brandColor)) return DEFAULT_THEME;
  const light = {
    ...DEFAULT_THEME.light,
    primary: brandColor,
    accent: brandColor,
  };
  return {
    light,
    dark: {
      ...darkFromLight(light),
      background: DEFAULT_THEME.dark.background,
    },
  };
}

// The site's own tokens (globals.css, in hex) for the default palette, so
// "Default" looks exactly like a restaurant without custom colours: white
// text on the amber buttons, its borders and muted shades. Tokens derived
// from the six colours would differ slightly. Update with globals.css.
const SITE_TOKENS: Record<ThemeMode, Record<string, string>> = {
  light: {
    background: "#fcf9f4",
    foreground: "#2a2315",
    card: "#fcf9f4",
    "card-foreground": "#2a2315",
    popover: "#ffffff",
    "popover-foreground": "#2a2315",
    primary: "#a0611a",
    "primary-foreground": "#f8fafc",
    secondary: "#f8dbbd",
    "secondary-foreground": "#2a2315",
    accent: "#a0611a",
    "accent-foreground": "#f8fafc",
    muted: "#f8dbbd",
    "muted-foreground": "#433927",
    border: "#e1dcd1",
    input: "#e1dcd1",
    ring: "#be7721",
    ...headerTokens(DEFAULT_THEME.light),
  },
  dark: {
    background: "#1c1608",
    foreground: "#e1dcd1",
    card: "#2a2315",
    "card-foreground": "#e1dcd1",
    popover: "#2a2315",
    "popover-foreground": "#e1dcd1",
    primary: "#f6b200",
    "primary-foreground": "#1c1608",
    secondary: "#433927",
    "secondary-foreground": "#e1dcd1",
    accent: "#f6b200",
    "accent-foreground": "#1c1608",
    muted: "#433927",
    "muted-foreground": "#aaa497",
    border: "#433927",
    input: "#433927",
    ring: "#f6b200",
    ...headerTokens(DEFAULT_THEME.dark),
  },
};

/**
 * The menu header's colour (.menu-header in globals.css) with its text: the
 * palette's text where it reads at 4.5:1, else black or white.
 */
function headerTokens(p: Palette): Record<string, string> {
  const text = contrast(p.text, p.header) >= 4.5 ? p.text : bestText(p.header);
  return {
    "menu-header": p.header,
    "menu-header-foreground": text,
    "menu-header-muted": mutedText(text, p.header),
  };
}

const samePalette = (a: Palette, b: Palette) =>
  COLOR_ROLES.every((role) => a[role] === b[role]);

/** Which of the site's default palettes this is, if it is one. */
const defaultModeOf = (p: Palette): ThemeMode | null =>
  samePalette(p, DEFAULT_THEME.light)
    ? "light"
    : samePalette(p, DEFAULT_THEME.dark)
      ? "dark"
      : null;

// Softer text (descriptions, hints): a step towards the surface colour,
// but never below 4.5:1 on it.
function mutedText(text: string, surface: string) {
  for (let amount = 0.4; amount > 0; amount -= 0.05) {
    const candidate = mix(text, surface, amount);
    if (contrast(candidate, surface) >= 4.5) return candidate;
  }
  return text;
}

/** Every colour token the public pages use, derived from one palette. */
export function paletteTokens(p: Palette): Record<string, string> {
  const siteDefault = defaultModeOf(p);
  if (siteDefault) return { ...SITE_TOKENS[siteDefault] };
  const border = mix(p.card, p.text, 0.15);
  return {
    background: p.background,
    foreground: p.text,
    card: p.card,
    "card-foreground": p.text,
    popover: p.card,
    "popover-foreground": p.text,
    primary: p.primary,
    "primary-foreground": bestText(p.primary),
    secondary: p.secondary,
    "secondary-foreground": bestText(p.secondary),
    accent: p.accent,
    "accent-foreground": bestText(p.accent),
    muted: mix(p.card, p.text, 0.08),
    "muted-foreground": mutedText(p.text, p.card),
    border,
    input: border,
    ring: p.primary,
    ...headerTokens(p),
  };
}

const declarations = (p: Palette) =>
  Object.entries(paletteTokens(p))
    .map(([token, value]) => `--${token}:${value}`)
    .join(";");

/**
 * CSS for `.brand-scope` in light and dark mode. Only built from validated
 * hex colours, so it's safe to put in a <style> tag. The <body> gets it too
 * (while a `.brand-scope` is on the page): pop-ups such as the dish sheet,
 * the filter panel and the language list are drawn at the end of <body>,
 * outside the scope.
 */
export function colorThemeCss(theme: ColorTheme): string | null {
  const valid = parseColorTheme(theme);
  if (!valid) return null;
  return `.brand-scope,body:has(.brand-scope){${declarations(valid.light)}}.dark .brand-scope,.dark body:has(.brand-scope){${declarations(valid.dark)}}`;
}

export type ContrastWarning =
  | "textOnBackground"
  | "textOnCard"
  | "primaryOnCard"
  | "textOnPrimary"
  | "textOnSecondary"
  | "textOnAccent";

/**
 * Combinations guests may struggle to read. The editor shows them; it never
 * changes an owner's choice by itself.
 */
export function contrastWarnings(
  p: Palette,
): { warning: ContrastWarning; roles: ColorRole[] }[] {
  // The site's own default is its design, not the owner's: nothing to warn
  // them about there.
  if (defaultModeOf(p)) return [];
  const checks: [ContrastWarning, ColorRole[], number, number][] = [
    [
      "textOnBackground",
      ["text", "background"],
      contrast(p.text, p.background),
      4.5,
    ],
    ["textOnCard", ["text", "card"], contrast(p.text, p.card), 4.5],
    ["primaryOnCard", ["primary", "card"], contrast(p.primary, p.card), 3],
    [
      "textOnPrimary",
      ["primary"],
      contrast(p.primary, bestText(p.primary)),
      4.5,
    ],
    [
      "textOnSecondary",
      ["secondary"],
      contrast(p.secondary, bestText(p.secondary)),
      4.5,
    ],
    ["textOnAccent", ["accent"], contrast(p.accent, bestText(p.accent)), 4.5],
  ];
  return checks
    .filter(([, , ratio, min]) => ratio < min)
    .map(([warning, roles]) => ({ warning, roles }));
}

// Guest menus are set in The Table (DESIGN.md "Guest menu pattern"): the
// world's ground, cards and ink, with the restaurant's colour for the band
// under the header, prices, the open-now line and the active category. Text
// in that colour sits on white cards by day and dimmed porcelain at night,
// so it is darkened towards the world's ink until it reads at 4.5:1 there.
const GUEST_INK = "#221a17";
const GUEST_SURFACES: Record<ThemeMode, string> = {
  light: "#f5f0e8", // the ground, the darkest light surface it is set on
  dark: "#e9e2d7", // the dimmed plate
};

/** The brand colour as text on a light surface: 4.5:1 at least. */
export function inkOn(hex: string, surface: string): string {
  for (let step = 0; step <= 20; step++) {
    const candidate = mix(hex, GUEST_INK, step / 20);
    if (contrast(candidate, surface) >= 4.5) return candidate;
  }
  return GUEST_INK;
}

/**
 * The colour a guest menu is branded with: the theme's (light) primary, or
 * its header when the theme is dark all over (a navy restaurant whose primary
 * is a light blue meant for its dark cards is branded navy).
 */
export function guestBrandColor(
  theme: ColorTheme | null,
  brandColor: string | null,
): string | null {
  const valid = theme && parseColorTheme(theme);
  if (valid) {
    const { background, header, primary } = valid.light;
    return contrast(background, "#ffffff") > contrast(background, "#000000") ? header : primary;
  }
  return isBrandColor(brandColor) ? brandColor.toLowerCase() : null;
}

/**
 * CSS for `.brand-scope` on guest menus (and <body>, for pop-ups drawn
 * outside it): --brand (the band), --brand-ink (text) and --brand-ink-fg
 * (text on a --brand-ink pill), per mode. Validated hex only.
 */
export function guestBrandCss(hex: string): string | null {
  if (!isBrandColor(hex)) return null;
  const tokens = (mode: ThemeMode) => {
    const ink = inkOn(hex, GUEST_SURFACES[mode]);
    return `--brand:${hex};--brand-ink:${ink};--brand-ink-fg:${bestText(ink)}`;
  };
  return `.brand-scope,body:has(.brand-scope){${tokens("light")}}.dark .brand-scope,.dark body:has(.brand-scope){${tokens("dark")}}`;
}
