// src/lib/brand-color.ts
// A restaurant's own accent colour on its public pages. Owners pick any
// colour; this adjusts it per theme so it stays readable: prices and links
// in the colour need 3:1 against the page, and button text on it 4.5:1.

const HEX = /^#[0-9a-f]{6}$/;

export const isBrandColor = (value: unknown): value is string =>
  typeof value === "string" && HEX.test(value.toLowerCase());

// The theme surfaces the colour sits on (globals.css, converted to sRGB):
// light page/cards, and the lighter of the dark surfaces (cards) as the
// harder case.
const LIGHT_SURFACE = "#fcf9f4";
const DARK_SURFACE = "#2a2315";
// Text on the colour: whichever of these reads better.
const LIGHT_TEXT = "#ffffff";
const DARK_TEXT = "#1c1917";

const MIN_SURFACE_CONTRAST = 3;
const MIN_TEXT_CONTRAST = 4.5;

const toRgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb: number[]) =>
  `#${rgb
    .map((c) =>
      Math.round(Math.min(255, Math.max(0, c)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;

function luminance(hex: string) {
  const [r, g, b] = toRgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

export const mix = (hex: string, target: string, amount: number) => {
  const from = toRgb(hex);
  const to = toRgb(target);
  return toHex(from.map((c, i) => c + (to[i]! - c) * amount));
};

export const bestText = (hex: string) =>
  contrast(hex, LIGHT_TEXT) >= contrast(hex, DARK_TEXT)
    ? LIGHT_TEXT
    : DARK_TEXT;

// The closest colour to `hex`, moving towards black or white, that meets
// both contrast rules on `surface`.
export function readableOn(hex: string, surface: string, towards: string) {
  for (let step = 0; step <= 20; step++) {
    const candidate = mix(hex, towards, step / 20);
    if (
      contrast(candidate, surface) >= MIN_SURFACE_CONTRAST &&
      contrast(candidate, bestText(candidate)) >= MIN_TEXT_CONTRAST
    ) {
      return candidate;
    }
  }
  return mix(hex, towards, 1);
}

export interface BrandPalette {
  light: { primary: string; foreground: string };
  dark: { primary: string; foreground: string };
}

/** The colour as used in light and in dark mode, each with its text colour. */
export function brandPalette(hex: string): BrandPalette {
  const color = hex.toLowerCase();
  const light = readableOn(color, LIGHT_SURFACE, "#000000");
  const dark = readableOn(color, DARK_SURFACE, "#ffffff");
  return {
    light: { primary: light, foreground: bestText(light) },
    dark: { primary: dark, foreground: bestText(dark) },
  };
}

/**
 * CSS that sets the theme's accent colour inside `.brand-scope`, for both
 * light and dark mode, hover highlights included. Only built from validated hex values.
 */
export function brandCss(hex: string): string | null {
  if (!isBrandColor(hex)) return null;
  const { light, dark } = brandPalette(hex);
  return (
    `.brand-scope,body:has(.brand-scope){--primary:${light.primary};--primary-foreground:${light.foreground};--ring:${light.primary};--accent:${light.primary};--accent-foreground:${light.foreground}}` +
    `.dark .brand-scope,.dark body:has(.brand-scope){--primary:${dark.primary};--primary-foreground:${dark.foreground};--ring:${dark.primary};--accent:${dark.primary};--accent-foreground:${dark.foreground}}`
  );
}
