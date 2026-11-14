-- Restaurants from before the tablecloth keep a plain page until their
-- owner picks one; new restaurants start on gingham.
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "menu_cloth" varchar(10) DEFAULT 'plain' NOT NULL;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ALTER COLUMN "menu_cloth" SET DEFAULT 'gingham';
