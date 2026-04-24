// src/types/restaurant.ts
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas";

export interface Restaurant {
  categories: Category[]; 
  id: string;
  name: string;
  slug: string;
  address: string | null;
  country: string | null;
  foodType: string | null;
  isActive: boolean;
  isDisplayed: boolean;
  logoUrl: string | null;

  currency: string; 
  phoneNumber: string | null; 
  description: string | null; 
  theme: string | null; 
  typeOfEstablishment: string | null; 

  socialMedia: SocialMediaLinks | unknown | null;
  deliveryApps: DeliveryAppLinks | unknown | null;
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
  description: string | null;
  price: string; 
  ingredients: string | null;
  dietaryLabels: DietaryLabel[] | null; 
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}