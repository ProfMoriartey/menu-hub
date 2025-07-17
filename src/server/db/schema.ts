import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  integer,
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations for restaurants
export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  categories: many(categories),
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


// // db/schema.ts

// import { pgTableCreator, serial, text, timestamp, boolean, real, uuid } from 'drizzle-orm/pg-core';
// import { relations, sql } from 'drizzle-orm';

// /**
//  * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
//  * database instance for multiple projects.
//  *
//  * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
//  */
// export const createTable = pgTableCreator((name) => `menu-hub_${name}`);

// // --- Restaurants Table ---
// // This table stores information about each restaurant.
// // Each restaurant will have a unique 'slug' for its URL path.
// export const restaurants = createTable('restaurants', {
//   id: uuid('id').defaultRandom().primaryKey(),
//   name: text('name').notNull(),
//   slug: text('slug').unique().notNull(),

//   // New Fields
//   logoUrl: text('logo_url'),                       // Uploadthing single image
//   galleryUrls: text('gallery_urls').array(),       // Uploadthing multiple images
//   address: text('address'),
//   country: text('country').default("Not Set").notNull(),
//   foodType: text('food_type').default("Not Set").notNull(),
//   isActive: boolean('is_active').default(true).notNull(),

//   createdAt: timestamp('created_at', { withTimezone: true })
//     .default(sql`CURRENT_TIMESTAMP`).notNull(),

//   updatedAt: timestamp('updated_at', { withTimezone: true })
//     .default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()),
// });

// // old schema
// // export const restaurants = createTable('restaurants', {
// //   id: uuid('id').defaultRandom().primaryKey(), // Unique ID for the restaurant
// //   name: text('name').notNull(),                 // Name of the restaurant
// //   slug: text('slug').unique().notNull(),        // Unique slug for URL (e.g., 'pizza-palace')
// //   createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(), // Timestamp when the record was created
// //   updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()), // Timestamp when the record was last updated
// // });

// // Define relations for the restaurants table
// // A restaurant can have many categories and many menu items
// export const restaurantsRelations = relations(restaurants, ({ many }) => ({
//   categories: many(categories),
//   menuItems: many(menuItems),
// }));

// // --- Categories Table ---
// // This table stores the main categories for menu items (e.g., Appetizers, Main Courses).
// // Each category belongs to a specific restaurant.
// export const categories = createTable('categories', {
//   id: uuid('id').defaultRandom().primaryKey(), // Unique ID for the category
//   restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }), // Foreign key to link to a restaurant
//   name: text('name').notNull(),                 // Name of the category (e.g., 'Appetizers')
//   order: serial('order').notNull(),             // Order for displaying categories (can be used for custom sorting)
//   createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(), // Timestamp when the record was created
//   updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()), // Timestamp when the record was last updated
// });

// // Define relations for the categories table
// // A category belongs to one restaurant and can have many menu items
// export const categoriesRelations = relations(categories, ({ one, many }) => ({
//   restaurant: one(restaurants, {
//     fields: [categories.restaurantId],
//     references: [restaurants.id],
//   }),
//   menuItems: many(menuItems),
// }));

// // --- Menu Items Table ---
// // This table stores individual menu items with all their details.
// // Each menu item belongs to a specific category and restaurant.
// export const menuItems = createTable('menu_items', {
//   id: uuid('id').defaultRandom().primaryKey(), // Unique ID for the menu item
//   restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }), // Foreign key to link to a restaurant (redundant but useful for direct queries)
//   categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }), // Foreign key to link to a category
//   name: text('name').notNull(),                 // Name of the menu item (e.g., 'Margherita Pizza')
//   description: text('description').notNull(),   // Description of the item
//   price: real('price').notNull(),               // Price of the item (using 'real' for floating point numbers)
//   ingredients: text('ingredients').notNull(),   // Ingredients list (can be a comma-separated string or JSON string)
//   isVegetarian: boolean('is_vegetarian').default(false).notNull(), // Dietary label: Vegetarian
//   isGlutenFree: boolean('is_gluten_free').default(false).notNull(), // Dietary label: Gluten-Free
//   imageUrl: text('image_url').notNull(),        // URL of the image from Uploadthing
//   createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(), // Timestamp when the record was created
//   updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()), // Timestamp when the record was last updated
// });

// // Define relations for the menuItems table
// // A menu item belongs to one restaurant and one category
// export const menuItemsRelations = relations(menuItems, ({ one }) => ({
//   restaurant: one(restaurants, {
//     fields: [menuItems.restaurantId],
//     references: [restaurants.id],
//   }),
//   category: one(categories, {
//     fields: [menuItems.categoryId],
//     references: [categories.id],
//   }),
// }));

