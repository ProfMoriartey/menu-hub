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

// Restaurant pages live at /[locale]/[restaurantSlug], next to these fixed
// routes. A restaurant using one of these slugs could never be reached.
export const RESERVED_SLUGS = [
  "about",
  "admin",
  "api",
  "dashboard",
  "demo",
  "features",
  // Admin pages live at /admin/restaurants/new and /admin/restaurants/[slug].
  "new",
  // Team invitation links live at /invite/<token>.
  "invite",
  // Permanent menu links (QR codes) live at /r/<id>.
  // The Menus page, and its old address.
  "menus",
  "r",
  "restaurants",
  "sign-in",
  "sign-up",
  // Signing up and creating a restaurant.
  "start",
  // The KVKK privacy notice.
  "kvkk",
  "themes",
];

export const restaurantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, { message: "Restaurant name is required." }),
  slug: z
    .string()
    .min(1, { message: "Restaurant slug is required." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must be lowercase, alphanumeric, and can contain hyphens.",
    })
    .refine((slug) => !RESERVED_SLUGS.includes(slug), {
      message: `This slug is reserved by the site. Avoid: ${RESERVED_SLUGS.join(", ")}.`,
    }),
  foodType: z.string().nullable().optional(),
  isActive: z.coerce.boolean().default(true),
  isDisplayed: z.coerce.boolean().default(true),
  logoUrl: z.string().url("Invalid URL format.").nullable().optional().or(z.literal("")),
  currency: z.string().min(1, { message: "Currency is required." }).default("USD"),
  description: z.string().nullable().optional(),
  theme: z.string().nullable().optional(),
  typeOfEstablishment: z.string().nullable().optional(),

  socialMedia: socialMediaSchema.nullable().optional(),
  metaTitle: z.string().max(256).nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  ogImage: z.string().url("Invalid URL format.").nullable().optional().or(z.literal("")),
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;

// Branch pages will live at /[restaurantSlug]/[branchSlug], next to these.
export const RESERVED_BRANCH_SLUGS = ["about", "item"];

// A branch's own details (server/branches). The country is an ISO code
// (lib/countries); owners can't change it.
export const branchSchema = z.object({
  name: z.string().trim().max(128).nullable(),
  address: z.string().trim().max(256).nullable(),
  city: z.string().trim().max(128).nullable(),
  country: z.string().max(256).nullable(),
  phoneNumber: z.string().trim().max(50).nullable(),
  mapUrl: z.string().url("Invalid URL format.").max(512).nullable().or(z.literal("")),
  deliveryApps: deliveryAppsSchema.nullable(),
});

export type BranchFields = z.infer<typeof branchSchema>;


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