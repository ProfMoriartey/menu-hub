// src/lib/schemas.ts
import { z } from "zod";

export const socialMediaSchema = z.object({
  instagram: z.string().url().optional().or(z.literal("")),
  facebook: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  tiktok: z.string().url().optional().or(z.literal("")),
  // --- NEW FIELD ---
  website: z.string().url().optional().or(z.literal("")), 
});

export const deliveryAppsSchema = z.object({
  yemeksepeti: z.string().url().optional().or(z.literal("")),
  getir: z.string().url().optional().or(z.literal("")),
  trendyolYemek: z.string().url().optional().or(z.literal("")),
  migrosYemek: z.string().url().optional().or(z.literal("")),
  uberEats: z.string().url().optional().or(z.literal("")),
  deliveroo: z.string().url().optional().or(z.literal("")),
  // --- NEW FIELD ---
  customLink: z.string().url().optional().or(z.literal("")), 
});

export type SocialMediaLinks = z.infer<typeof socialMediaSchema>;
export type DeliveryAppLinks = z.infer<typeof deliveryAppsSchema>;

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
  logoUrl: z.string().url("Invalid URL format.").nullable().optional().or(z.literal("")),
  currency: z.string().min(1, { message: "Currency is required." }).default("USD"),
  phoneNumber: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  theme: z.string().nullable().optional(),
  typeOfEstablishment: z.string().nullable().optional(),

  socialMedia: socialMediaSchema.nullable().optional(),
  deliveryApps: deliveryAppsSchema.nullable().optional(),
  mapUrl: z.string().url("Invalid URL format.").nullable().optional().or(z.literal("")),
  metaTitle: z.string().max(256).nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  ogImage: z.string().url("Invalid URL format.").nullable().optional().or(z.literal("")),
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;


// Category Schemas
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