// src/lib/menu-item-schemas.ts
import { z } from "zod";
import { dietaryLabelEnum, itemAvailabilityEnum } from "~/server/db/schema";
import type { DietaryLabel } from "~/types/restaurant";

export const ALL_DIETARY_LABELS: DietaryLabel[] = dietaryLabelEnum.enumValues;

export const ITEM_AVAILABILITY = itemAvailabilityEnum.enumValues;
export type ItemAvailability = (typeof ITEM_AVAILABILITY)[number];

// Forms submit "" for untouched optional inputs; store those as null.
const optionalText = z
  .string()
  .nullable()
  .optional()
  .transform((val) => (val?.trim() ? val.trim() : null));

export const createMenuItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  description: optionalText,
  price: z.string().trim().min(1, "Price is required."),
  // Free text, e.g. "beef, cheese, lettuce".
  ingredients: optionalText,
  dietaryLabels: z
    .array(z.enum(ALL_DIETARY_LABELS as [DietaryLabel, ...DietaryLabel[]]))
    .default([]),
  // Forms that don't send it (older clients) get "available".
  availability: z.enum(ITEM_AVAILABILITY).default("available"),
  imageUrl: z
    .union([z.string().url("Invalid URL format."), z.literal("")])
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : (val ?? null))),
  restaurantId: z.string().uuid("Invalid restaurant ID format."),
  categoryId: z.string().uuid("Invalid category ID format."),
});

export const updateMenuItemSchema = createMenuItemSchema.extend({
  id: z.string().uuid("Invalid menu item ID format."),
});

export type CreateMenuItemData = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemData = z.infer<typeof updateMenuItemSchema>;
