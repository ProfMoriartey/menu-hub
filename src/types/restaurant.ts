export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string | null; // Make sure these are consistent
  country: string | null; // Make sure these are consistent
  foodType: string | null; // Make sure these are consistent
  isActive: boolean; // Assuming this is always boolean, not null from DB, based on your Zod. If it can be null, make it boolean | null.
  logoUrl: string | null; // Add this
  galleryUrls: string[] | null; // Add this
  createdAt: Date;
  updatedAt: Date | null;
}