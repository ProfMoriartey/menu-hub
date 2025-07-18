// src/types/restaurant.ts

export interface Restaurant {
  categories: Category[]; // Remains the same, includes nested categories
  id: string;
  name: string;
  slug: string;
  address: string | null;
  country: string | null;
  foodType: string | null;
  isActive: boolean;
  isDisplayed: boolean;
  logoUrl: string | null;

  // --- NEW PROPERTIES ADDED HERE ---
  currency: string; // Not nullable because you set a NOT NULL DEFAULT 'USD' in schema
  phoneNumber: string | null; // Nullable as per schema
  description: string | null; // Nullable as per schema
  theme: string | null; // Nullable as per schema
  typeOfEstablishment: string | null; // Nullable as per schema
  // --- END NEW PROPERTIES ---

  createdAt: Date;
  updatedAt: Date | null;
}

// You might also want to define types for Category and MenuItem if they are not already.
// This is good practice for strict typing throughout your application.

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date | null;
  // Add relations if you fetch them with categories
  menuItems?: MenuItem[]; // Optional, as it might not always be included in the query
}

export type DietaryLabel = "vegetarian" | "vegan" | "gluten-free" | "dairy-free" | "nut-free";

export interface MenuItem {
  id: string;
  categoryId: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: string; // Assuming varchar for price
  ingredients: string | null;
  dietaryLabels: DietaryLabel[] | null; // Matches the Drizzle type
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}