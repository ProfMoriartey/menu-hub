ALTER TABLE "menu-hub_restaurants" ADD COLUMN "time_zone" varchar(64);--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "opening_hours" jsonb;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "brand_color_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "brand_color" varchar(7);