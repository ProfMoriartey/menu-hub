// src/lib/schemas.ts
import { z } from "zod";
import { dietaryLabelEnum } from "~/server/db/schema";
import type { DietaryLabel } from "~/types/restaurant";

// ... (other schemas like createMenuItemSchema, updateMenuItemSchema, etc.)

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
  isActive: z.coerce.boolean().default(true), // Handles "on" string from FormData
  isDisplayed: z.coerce.boolean().default(true), // Handles "on" string from FormData
  logoUrl: z.string().url("Invalid URL format.").nullable().optional(),

  // --- NEW ZOD FIELDS ADDED HERE ---
  currency: z.string().min(1, { message: "Currency is required." }).default("USD"), // Matches NOT NULL DEFAULT 'USD' in DB
  phoneNumber: z.string().nullable().optional(), // Matches nullable in DB
  description: z.string().nullable().optional(), // Matches nullable in DB
  theme: z.string().nullable().optional(), // Matches nullable in DB
  typeOfEstablishment: z.string().nullable().optional(), // Matches nullable in DB
  // --- END NEW ZOD FIELDS ---
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;