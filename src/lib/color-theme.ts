// src/lib/color-theme.ts
// A restaurant's own colours on its public pages: six colours per mode
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

// The site's own colours (globals.css, converted to sRGB): what restaurants
// without custom colours look like.
export const DEFAULT_THEME: ColorTheme = {
  light: {
    background: "#fcf9f4",
    card: "#fcf9f4",
    text: "#2a2315",
    primary: "#be7721",
    secondary: "#f8dbbd",
    accent: "#be7721",
  },
  dark: {
    background: "#1c1608",
    card: "#2a2315",
    text: "#e1dcd1",
    primary: "#f6b200",
    secondary: "#433927",
    accent: "#f6b200",
  },
};

// One-click starting points for owners who'd rather not pick six colours.
export const PRESETS: { id: string; theme: ColorTheme }[] = [
  { id: "default", theme: DEFAULT_THEME },
  {
    id: "ocean",
    theme: {
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
    },
  },
  {
    id: "forest",
    theme: {
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
    },
  },
  {
    id: "berry",
    theme: {
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
    },
  },
  {
    id: "classic",
    theme: {
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
    },
  },
];

const isPalette = (value: unknown): value is Palette =>
  !!value &&
  typeof value === "object" &&
  COLOR_ROLES.every((role) =>
    isBrandColor((value as Record<string, unknown>)[role]),
  );

/** A theme sent by a form, lower-cased; null when any colour is missing or invalid. */
export function parseColorTheme(raw: unknown): ColorTheme | null {
  if (!raw || typeof raw !== "object") return null;
  const { light, dark } = raw as Record<string, unknown>;
  if (!isPalette(light) || !isPalette(dark)) return null;
  const clean = (p: Palette) =>
    Object.fromEntries(
      COLOR_ROLES.map((role) => [role, p[role].toLowerCase()]),
    ) as Palette;
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
  if (saved) return saved;
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
    primary: "#be7721",
    "primary-foreground": "#f8fafc",
    secondary: "#f8dbbd",
    "secondary-foreground": "#2a2315",
    accent: "#be7721",
    "accent-foreground": "#f8fafc",
    muted: "#f8dbbd",
    "muted-foreground": "#433927",
    border: "#e1dcd1",
    input: "#e1dcd1",
    ring: "#be7721",
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
  },
};

const samePalette = (a: Palette, b: Palette) =>
  COLOR_ROLES.every((role) => a[role] === b[role]);

/** Which of the site's default palettes this is, if it is one. */
const defaultModeOf = (p: Palette): ThemeMode | null =>
  samePalette(p, DEFAULT_THEME.light)
    ? "light"
    : samePalette(p, DEFAULT_THEME.dark)
      ? "dark"
      : null;

// Softer text (descriptions, hints): a step towards the card colour, but
// never below 4.5:1 on the cards.
function mutedText(p: Palette) {
  for (let amount = 0.4; amount > 0; amount -= 0.05) {
    const candidate = mix(p.text, p.card, amount);
    if (contrast(candidate, p.card) >= 4.5) return candidate;
  }
  return p.text;
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
    "muted-foreground": mutedText(p),
    border,
    input: border,
    ring: p.primary,
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
