// db/schema.ts

import { pgTableCreator, serial, text, timestamp, boolean, real, uuid } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `menu-hub_${name}`);

// --- Restaurants Table ---
// This table stores information about each restaurant.
// Each restaurant will have a unique 'slug' for its URL path.
export const restaurants = createTable('restaurants', {
  id: uuid('id').defaultRandom().primaryKey(), // Unique ID for the restaurant
  name: text('name').notNull(),                 // Name of the restaurant
  slug: text('slug').unique().notNull(),        // Unique slug for URL (e.g., 'pizza-palace')
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(), // Timestamp when the record was created
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()), // Timestamp when the record was last updated
});

// Define relations for the restaurants table
// A restaurant can have many categories and many menu items
export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  categories: many(categories),
  menuItems: many(menuItems),
}));

// --- Categories Table ---
// This table stores the main categories for menu items (e.g., Appetizers, Main Courses).
// Each category belongs to a specific restaurant.
export const categories = createTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(), // Unique ID for the category
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }), // Foreign key to link to a restaurant
  name: text('name').notNull(),                 // Name of the category (e.g., 'Appetizers')
  order: serial('order').notNull(),             // Order for displaying categories (can be used for custom sorting)
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(), // Timestamp when the record was created
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()), // Timestamp when the record was last updated
});

// Define relations for the categories table
// A category belongs to one restaurant and can have many menu items
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [categories.restaurantId],
    references: [restaurants.id],
  }),
  menuItems: many(menuItems),
}));

// --- Menu Items Table ---
// This table stores individual menu items with all their details.
// Each menu item belongs to a specific category and restaurant.
export const menuItems = createTable('menu_items', {
  id: uuid('id').defaultRandom().primaryKey(), // Unique ID for the menu item
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }), // Foreign key to link to a restaurant (redundant but useful for direct queries)
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }), // Foreign key to link to a category
  name: text('name').notNull(),                 // Name of the menu item (e.g., 'Margherita Pizza')
  description: text('description').notNull(),   // Description of the item
  price: real('price').notNull(),               // Price of the item (using 'real' for floating point numbers)
  ingredients: text('ingredients').notNull(),   // Ingredients list (can be a comma-separated string or JSON string)
  isVegetarian: boolean('is_vegetarian').default(false).notNull(), // Dietary label: Vegetarian
  isGlutenFree: boolean('is_gluten_free').default(false).notNull(), // Dietary label: Gluten-Free
  imageUrl: text('image_url').notNull(),        // URL of the image from Uploadthing
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(), // Timestamp when the record was created
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()), // Timestamp when the record was last updated
});

// Define relations for the menuItems table
// A menu item belongs to one restaurant and one category
export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
}));


// // Example model schema from the Drizzle docs
// // https://orm.drizzle.team/docs/sql-schema-declaration

// import { sql } from "drizzle-orm";
// import { index, pgTableCreator } from "drizzle-orm/pg-core";

// /**
//  * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
//  * database instance for multiple projects.
//  *
//  * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
//  */
// export const createTable = pgTableCreator((name) => `menu-hub_${name}`);

// export const posts = createTable(
//   "post",
//   (d) => ({
//     id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
//     name: d.varchar({ length: 256 }),
//     createdAt: d
//       .timestamp({ withTimezone: true })
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
//   }),
//   (t) => [index("name_idx").on(t.name)],
// );
