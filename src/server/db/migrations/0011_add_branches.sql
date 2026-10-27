CREATE TABLE "menu-hub_branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"name" varchar(128),
	"slug" varchar(128) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"address" varchar(256),
	"city" varchar(128),
	"country" varchar(256),
	"phone_number" varchar(50),
	"map_url" varchar(512),
	"delivery_apps" jsonb,
	"time_zone" varchar(64),
	"opening_hours" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "menu-hub_branches" ADD CONSTRAINT "menu-hub_branches_restaurant_id_menu-hub_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."menu-hub_restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "branches_restaurant_slug_idx" ON "menu-hub_branches" USING btree ("restaurant_id","slug");--> statement-breakpoint
-- Every restaurant gets its first (main) branch, holding its location,
-- contact and hours as they are now.
INSERT INTO "menu-hub_branches" ("restaurant_id", "slug", "order", "address", "city", "country", "phone_number", "map_url", "delivery_apps", "time_zone", "opening_hours")
SELECT "id", 'main', 0, "address", "city", "country", "phone_number", "map_url", "delivery_apps", "time_zone", "opening_hours"
FROM "menu-hub_restaurants";
-- The restaurant's own copies of these columns are no longer read or
-- written. They stay for now as a backup and are dropped in a later
-- migration, once the branches are confirmed.
