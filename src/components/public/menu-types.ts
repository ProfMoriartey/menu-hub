// src/components/public/menu-types.ts
import type { Category, MenuItem } from "~/types/restaurant";

// An item as the public menu shows it: only the fields guests see, plus
// `displayPrice`, formatted on the server for the guest's language (see
// lib/format-price). Keeping it narrow keeps the page small.
export type PublicMenuItem = Pick<
  MenuItem,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "price"
  | "ingredients"
  | "dietaryLabels"
  | "availability"
  | "imageUrl"
> & { displayPrice: string };

export type PublicCategory = Pick<Category, "id" | "name" | "slug"> & {
  menuItems: PublicMenuItem[];
};

export interface PublicMenuData {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    description: string | null;
  };
  categories: PublicCategory[];
}
