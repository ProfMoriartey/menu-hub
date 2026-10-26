ALTER TABLE "menu-hub_categories" ADD COLUMN "translations" jsonb;--> statement-breakpoint
ALTER TABLE "menu-hub_menu_items" ADD COLUMN "translations" jsonb;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "multilingual_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "main_language" varchar(8);--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "extra_languages" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "translations" jsonb;