// src/types/restaurant.ts
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas";

export interface Restaurant {
  categories: Category[]; 
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  country: string | null;
  foodType: string | null;
  isActive: boolean;
  isDisplayed: boolean;
  // Paused by an admin: hidden from guests whatever isActive says.
  pausedAt?: Date | string | null;
  logoUrl: string | null;

  currency: string; 
  phoneNumber: string | null; 
  description: string | null; 
  theme: string | null; 
  typeOfEstablishment: string | null; 

  socialMedia?: SocialMediaLinks | null;
  deliveryApps?: DeliveryAppLinks | null;
  mapUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;

  createdAt: Date;
  updatedAt: Date | null;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  order: number;
  createdAt: Date;
  updatedAt: Date | null;
  menuItems?: MenuItem[]; 
}

export type DietaryLabel = "vegetarian" | "vegan" | "gluten-free" | "dairy-free" | "nut-free";

export interface MenuItem {
  id: string;
  categoryId: string;
  restaurantId: string;
  name: string;
  slug: string;
  description: string | null;
  price: string; 
  ingredients: string | null;
  dietaryLabels: DietaryLabel[] | null;
  availability: "available" | "sold_out" | "hidden";
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}