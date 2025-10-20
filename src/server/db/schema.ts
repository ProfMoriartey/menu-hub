// src/server/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  integer,
  primaryKey, foreignKey,
  text, // IMPORTANT: Add 'text' import for longer string fields like description
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define ENUMs if you have them, e.g., for dietary labels
export const dietaryLabelEnum = pgEnum("dietary_label", [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
]);

// Define a TypeScript type for the values of the dietaryLabelEnum
type DietaryLabelValue = typeof dietaryLabelEnum.enumValues[number];

export const restaurants = pgTable("menu-hub_restaurants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  address: varchar("address", { length: 256 }),
  country: varchar("country", { length: 256 }),
  foodType: varchar("food_type", { length: 256 }),
  isActive: boolean("is_active").default(true).notNull(),
  isDisplayed: boolean("is_displayed").default(false).notNull(), // Added isDisplayed
  logoUrl: varchar("logo_url", { length: 256 }),

  // --- NEW FIELDS ADDED HERE ---
  currency: varchar("currency", { length: 10 }).default("USD").notNull(), // Default to 'USD', cannot be null
  phoneNumber: varchar("phone_number", { length: 50 }), // Nullable by default
  description: text("description"), // Use 'text' for potentially long descriptions, nullable by default
  theme: varchar("theme", { length: 50 }), // Nullable by default
  typeOfEstablishment: varchar("type_of_establishment", { length: 100 }), // Nullable by default
  // --- END NEW FIELDS ---

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(), // Or .default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()), if you prefer automatic update
});

// Define relations for restaurants
export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  categories: many(categories),
  usersToRestaurants: many(usersToRestaurants), // ADDED LINK
}));


export const categories = pgTable("menu-hub_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 256 }).notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations for categories
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [categories.restaurantId],
    references: [restaurants.id],
  }),
  menuItems: many(menuItems),
}));

export const menuItems = pgTable("menu-hub_menu_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 256 }).notNull(),
  description: varchar("description", { length: 512 }),
  price: varchar("price", { length: 50 }).notNull(),
  ingredients: varchar("ingredients", { length: 512 }),
  dietaryLabels: jsonb("dietary_labels").$type<DietaryLabelValue[]>().default([]),
  imageUrl: varchar("image_url", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations for menuItems
export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
}));

// 1. User Table (to reference Clerk IDs)
export const users = pgTable("menu-hub_users", {
  // Store the Clerk User ID (text, non-nullable)
  id: text("id").primaryKey(), 
  // You can add an optional email/name for debugging, but Clerk is the source of truth
  email: varchar("email", { length: 256 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Junction Table (Many-to-Many Link)
export const usersToRestaurants = pgTable(
  "menu-hub_users_to_restaurants",
  {
    // Foreign Key to the users table (Clerk ID)
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Foreign Key to the restaurants table (your UUID)
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),

    // Access Level: Use this for fine-grained permissions later (e.g., 'owner', 'editor', 'viewer')
    accessLevel: varchar("access_level", { length: 50 })
      .notNull()
      .default("editor"),
  },
  (t) => ({
    // Enforce uniqueness for the pair (user_id, restaurant_id)
    pk: primaryKey({ columns: [t.userId, t.restaurantId] }),
  })
);

// 3. Relations for Junction Table (Optional but recommended for relational queries)
export const usersToRestaurantsRelations = relations(
  usersToRestaurants,
  ({ one }) => ({
    user: one(users, {
      fields: [usersToRestaurants.userId],
      references: [users.id],
    }),
    restaurant: one(restaurants, {
      fields: [usersToRestaurants.restaurantId],
      references: [restaurants.id],
    }),
  })
);

// Update existing relations to include the new link
// Update your user relations
export const usersRelations = relations(users, ({ many }) => ({
  usersToRestaurants: many(usersToRestaurants),
}));