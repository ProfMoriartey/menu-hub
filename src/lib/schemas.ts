// src/lib/schemas.ts
import { z } from "zod";
import { dietaryLabelEnum } from "~/server/db/schema";
import type { DietaryLabel } from "~/types/restaurant";

export const ALL_DIETARY_LABELS: DietaryLabel[] = dietaryLabelEnum.enumValues;

export const createMenuItemSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().nullable().optional(),
  price: z.string().min(1, "Price is required."),
  ingredients: z.string().nullable().optional(),
  dietaryLabels: z
    .string()
    .optional()
    .transform(async (val) => { // This transform needs to remain async because `safeParseAsync` is used inside it.
      if (!val) return null;

      const dietaryLabelsArraySchema = z.array(
        z.enum(ALL_DIETARY_LABELS as [DietaryLabel, ...DietaryLabel[]]),
      );

      try {
        const parsed: unknown = JSON.parse(val);
        const result = await dietaryLabelsArraySchema.safeParseAsync(parsed);
        return result.success ? result.data : null;
      } catch {
        return null;
      }
    })
    .nullable()
    .optional(),
  imageUrl: z.string().url("Invalid URL format.").nullable().optional(),
  restaurantId: z.string().uuid("Invalid restaurant ID format."),
  categoryId: z.string().uuid("Invalid category ID format."),
});

export const updateMenuItemSchema = createMenuItemSchema.extend({
  id: z.string().uuid("Invalid menu item ID format."),
});

export type CreateMenuItemData = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemData = z.infer<typeof updateMenuItemSchema>;