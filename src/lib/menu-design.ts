// src/lib/menu-design.ts
// How a public menu lays out its dishes. Every design is the same single
// scrolling page (compact header, search, sticky category bar), made for
// phones first; they differ in how each dish is shown.

export const MENU_DESIGNS = ["classic", "photo-grid", "compact"] as const;
export type MenuDesign = (typeof MENU_DESIGNS)[number];

export const isMenuDesign = (value: unknown): value is MenuDesign =>
  typeof value === "string" &&
  (MENU_DESIGNS as readonly string[]).includes(value);

// The four designs before 2026-10-26, as stored in restaurants.theme.
// Migration 0009 rewrites them; this keeps rows written by older code safe.
const LEGACY: Record<string, MenuDesign> = {
  "sidebar-list": "classic",
  "accordion-card": "compact",
  "category-cards-image-dominant": "photo-grid",
};

/** The design to render for a stored `theme` value; Classic by default. */
export function menuDesignOf(theme: string | null | undefined): MenuDesign {
  if (isMenuDesign(theme)) return theme;
  return (theme ? LEGACY[theme] : undefined) ?? "classic";
}
