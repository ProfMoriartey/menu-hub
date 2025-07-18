// src/lib/schemas.ts
// Note: This file should NOT have "use client" or "use server" at the top
import { z } from "zod";
// dietaryLabelEnum is no longer needed here if ALL_DIETARY_LABELS and related schemas moved to menu-item-schemas.ts
// import { dietaryLabelEnum } from "~/server/db/schema";
// type DietaryLabel is no longer needed here
// import type { DietaryLabel } from "~/types/restaurant";

// The schemas here should NOT contain async transforms

export const restaurantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, { message: "Restaurant name is required." }),
  slug: z
    .string()
    .min(1, { message: "Restaurant slug is required." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must be lowercase, alphanumeric, and can contain hyphens.",
    }),
  address: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  foodType: z.string().nullable().optional(),
  isActive: z.coerce.boolean().default(true),
  isDisplayed: z.coerce.boolean().default(true),
  logoUrl: z.string().url("Invalid URL format.").nullable().optional(),
  currency: z.string().min(1, { message: "Currency is required." }).default("USD"),
  phoneNumber: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  theme: z.string().nullable().optional(),
  typeOfEstablishment: z.string().nullable().optional(),
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;


// Category Schemas (these do not have async transforms)
export const createCategorySchema = z.object({
  name: z.string().min(1, { message: "Category name is required." }),
  restaurantId: z.string().uuid("Invalid restaurant ID for category."),
});

export const updateCategorySchema = z.object({
  id: z.string().uuid("Category ID is required for update."),
  name: z.string().min(1, { message: "Category name is required." }),
  restaurantId: z.string().uuid("Restaurant ID is required for category update validation."),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;