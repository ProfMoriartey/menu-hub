// src/lib/access.ts

// What an assigned user may do in their dashboard:
// - owner: restaurant details and the menu
// - editor: the menu only (categories and items)
// System admins can do everything, everywhere.
export const ACCESS_LEVELS = ["owner", "editor"] as const;

export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export type RestaurantRole = "admin" | AccessLevel;

export const ACCESS_LEVEL_INFO: Record<AccessLevel, { label: string; description: string }> = {
  owner: { label: "Owner", description: "Can edit restaurant details and the menu." },
  editor: { label: "Editor", description: "Can edit the menu only." },
};

// Older rows may hold other values (e.g. "viewer"); treat them as the
// smaller role so nobody gains detail-editing rights by accident.
export function toAccessLevel(value: string | null | undefined): AccessLevel {
  return value === "owner" ? "owner" : "editor";
}

export const canEditDetails = (role: RestaurantRole | null) =>
  role === "admin" || role === "owner";

/**
 * Whether guests see the menu: put live (isActive) and not paused by an
 * admin (pausedAt). Cached rows may hold the date as a string.
 */
export const isLive = (restaurant: { isActive: boolean; pausedAt?: Date | string | null }) =>
  restaurant.isActive && !restaurant.pausedAt;
