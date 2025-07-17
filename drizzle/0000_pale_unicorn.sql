CREATE TYPE "public"."dietary_label" AS ENUM('vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free');--> statement-breakpoint
CREATE TABLE "menu-hub_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"name" varchar(256) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "menu-hub_menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar(512),
	"price" varchar(50) NOT NULL,
	"ingredients" varchar(512),
	"dietary_labels" jsonb DEFAULT '[]'::jsonb,
	"image_url" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "menu-hub_restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"address" varchar(256),
	"country" varchar(256),
	"food_type" varchar(256),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_displayed" boolean DEFAULT false NOT NULL,
	"logo_url" varchar(256),
	"gallery_urls" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "menu-hub_restaurants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "menu-hub_categories" ADD CONSTRAINT "menu-hub_categories_restaurant_id_menu-hub_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."menu-hub_restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu-hub_menu_items" ADD CONSTRAINT "menu-hub_menu_items_category_id_menu-hub_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu-hub_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu-hub_menu_items" ADD CONSTRAINT "menu-hub_menu_items_restaurant_id_menu-hub_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."menu-hub_restaurants"("id") ON DELETE cascade ON UPDATE no action;