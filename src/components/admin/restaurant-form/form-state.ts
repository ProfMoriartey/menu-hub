// src/components/admin/restaurant-form/form-state.ts
import { restaurantSchema, type SocialMediaLinks } from "~/lib/schemas";
import type { Restaurant } from "~/types/restaurant";

export interface RestaurantFormValues {
  name: string;
  slug: string;
  typeOfEstablishment: string;
  foodType: string;
  description: string;
  isActive: boolean;
  isDisplayed: boolean;
  logoUrl: string;
  theme: string;
  currency: string;
  socialMedia: SocialMediaLinks;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

export type FormErrors = Partial<Record<string, string>>;

export const EMPTY_VALUES: RestaurantFormValues = {
  name: "",
  slug: "",
  typeOfEstablishment: "",
  foodType: "",
  description: "",
  isActive: true,
  isDisplayed: true,
  logoUrl: "",
  theme: "classic",
  currency: "USD",
  socialMedia: {},
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
};

export function valuesFromRestaurant(restaurant: Restaurant): RestaurantFormValues {
  return {
    name: restaurant.name,
    slug: restaurant.slug,
    typeOfEstablishment: restaurant.typeOfEstablishment ?? "",
    foodType: restaurant.foodType ?? "",
    description: restaurant.description ?? "",
    isActive: restaurant.isActive,
    isDisplayed: restaurant.isDisplayed,
    logoUrl: restaurant.logoUrl ?? "",
    theme: restaurant.theme ?? "classic",
    currency: restaurant.currency,
    socialMedia: restaurant.socialMedia ?? {},
    metaTitle: restaurant.metaTitle ?? "",
    metaDescription: restaurant.metaDescription ?? "",
    ogImage: restaurant.ogImage ?? "",
  };
}

// The server actions read checkboxes as "on" and the links as JSON.
export function toFormData(values: RestaurantFormValues, id?: string): FormData {
  const formData = new FormData();
  if (id) formData.set("id", id);

  const { socialMedia, isActive, isDisplayed, ...strings } = values;
  for (const [key, value] of Object.entries(strings)) {
    formData.set(key, value);
  }
  formData.set("isActive", isActive ? "on" : "");
  formData.set("isDisplayed", isDisplayed ? "on" : "");
  formData.set("socialMedia", JSON.stringify(socialMedia));
  return formData;
}

// Returns errors keyed by field path, e.g. "slug" or "socialMedia.instagram".
export function validate(values: RestaurantFormValues): FormErrors {
  const result = restaurantSchema.safeParse(values);
  if (result.success) return {};

  const errors: FormErrors = {};
  for (const issue of result.error.errors) {
    const key = issue.path.join(".") || "general";
    const isUrlIssue =
      issue.code === "invalid_string" && issue.validation === "url";
    errors[key] ??= isUrlIssue
      ? "Enter a full link, starting with https://"
      : issue.message;
  }
  return errors;
}

// Lets people paste "instagram.com/place" without typing the protocol.
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "" || /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const SECTIONS = [
  { id: "basics", label: "Basics", fields: ["name", "slug", "typeOfEstablishment", "foodType", "description"] },
  { id: "visibility", label: "Visibility", fields: ["isActive", "isDisplayed"] },
  { id: "branding", label: "Branding", fields: ["logoUrl", "theme", "currency"] },
  { id: "links", label: "Website & social", fields: ["socialMedia"] },
  { id: "seo", label: "Search & sharing", fields: ["metaTitle", "metaDescription", "ogImage"] },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export function sectionHasError(section: (typeof SECTIONS)[number], errors: FormErrors) {
  return Object.keys(errors).some((key) =>
    (section.fields as readonly string[]).includes(key.split(".")[0]!),
  );
}

// The menu designs (lib/menu-design); owners can also pick one on the
// Appearance page.
export const THEMES = [
  { value: "classic", label: "Classic", description: "Cards with the photo beside the text. Suits most menus." },
  { value: "photo-grid", label: "Photo grid", description: "Two columns of large photos on phones. For photo-rich menus." },
  { value: "compact", label: "Compact", description: "A text list like a printed menu. For long menus without photos." },
];

export const CURRENCIES = [
  { value: "TRY", label: "TRY — Turkish lira" },
  { value: "USD", label: "USD — US dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British pound" },
  { value: "AED", label: "AED — UAE dirham" },
  { value: "SAR", label: "SAR — Saudi riyal" },
];

export const FOOD_TYPE_SUGGESTIONS = ["Turkish", "Italian", "Burgers", "Pizza", "Seafood", "Kebab", "Asian", "Desserts", "Coffee"];
