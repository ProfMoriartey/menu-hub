CREATE TABLE "menu-hub_qr_scan_days" (
	"restaurant_id" uuid NOT NULL,
	"day" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "menu-hub_qr_scan_days_restaurant_id_day_pk" PRIMARY KEY("restaurant_id","day")
);
--> statement-breakpoint
ALTER TABLE "menu-hub_qr_scan_days" ADD CONSTRAINT "menu-hub_qr_scan_days_restaurant_id_menu-hub_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."menu-hub_restaurants"("id") ON DELETE cascade ON UPDATE no action;