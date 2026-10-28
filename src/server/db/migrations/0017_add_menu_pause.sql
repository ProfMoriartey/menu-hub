ALTER TABLE "menu-hub_restaurant_billing" ADD COLUMN "pause_reason" varchar(16);--> statement-breakpoint
ALTER TABLE "menu-hub_restaurant_billing" ADD COLUMN "pause_note" text;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "paused_at" timestamp;