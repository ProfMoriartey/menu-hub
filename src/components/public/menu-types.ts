// src/components/public/menu-types.ts
import type { Category, MenuItem } from "~/types/restaurant";

// An item as the public menu shows it: `displayPrice` is formatted on the
// server for the guest's language (see lib/format-price).
export type PublicMenuItem = MenuItem & { displayPrice: string };

export type PublicCategory = Omit<Category, "menuItems"> & {
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
