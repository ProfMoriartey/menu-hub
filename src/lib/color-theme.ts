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
    primary: "#9b1c2e",
    secondary: "#f7e1e1",
    accent: "#9b1c2e",
  },
  dark: {
    background: "#221316",
    card: "#30201f",
    text: "#f3e9e1",
    primary: "#f2a7b1",
    secondary: "#43302e",
    accent: "#f2a7b1",
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
// text on the crimson buttons, its borders and muted shades. Tokens derived
// from the six colours would differ slightly. Update with globals.css.
const SITE_TOKENS: Record<ThemeMode, Record<string, string>> = {
  light: {
    background: "#fcf9f4",
    foreground: "#2a2315",
    card: "#fcf9f4",
    "card-foreground": "#2a2315",
    popover: "#ffffff",
    "popover-foreground": "#2a2315",
    primary: "#9b1c2e",
    "primary-foreground": "#fbf8f6",
    secondary: "#f7e1e1",
    "secondary-foreground": "#2a2315",
    accent: "#9b1c2e",
    "accent-foreground": "#fbf8f6",
    muted: "#f7e1e1",
    "muted-foreground": "#433927",
    border: "#e1dcd1",
    input: "#e1dcd1",
    ring: "#b8283c",
    ...headerTokens(DEFAULT_THEME.light),
  },
  dark: {
    background: "#221316",
    foreground: "#f3e9e1",
    card: "#30201f",
    "card-foreground": "#f3e9e1",
    popover: "#30201f",
    "popover-foreground": "#f3e9e1",
    primary: "#f2a7b1",
    "primary-foreground": "#2a0e14",
    secondary: "#43302e",
    "secondary-foreground": "#f3e9e1",
    accent: "#f2a7b1",
    "accent-foreground": "#2a0e14",
    muted: "#43302e",
    "muted-foreground": "#c9b9b1",
    border: "#4a3533",
    input: "#4a3533",
    ring: "#f2a7b1",
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
