ALTER TABLE "menu-hub_restaurants" ADD COLUMN "currency" varchar(10) DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "phone_number" varchar(50);--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "theme" varchar(50);--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "type_of_establishment" varchar(100);