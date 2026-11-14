// src/lib/brand-color.ts
// A restaurant's own accent colour on its public pages. Owners pick any
// colour; this adjusts it per theme so it stays readable: prices and links
// in the colour need 3:1 against the page, and button text on it 4.5:1.

const HEX = /^#[0-9a-f]{6}$/;

export const isBrandColor = (value: unknown): value is string =>
  typeof value === "string" && HEX.test(value.toLowerCase());

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
