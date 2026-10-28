CREATE TABLE "menu-hub_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid,
	"restaurant_name" varchar(256) NOT NULL,
	"paid_on" date NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"covers_from" date NOT NULL,
	"covers_until" date NOT NULL,
	"method" varchar(32) NOT NULL,
	"note" text,
	"recorded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu-hub_restaurant_billing" (
	"restaurant_id" uuid PRIMARY KEY NOT NULL,
	"plan_name" varchar(64),
	"monthly_price" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'TRY' NOT NULL,
	"notes" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "menu-hub_payments" ADD CONSTRAINT "menu-hub_payments_restaurant_id_menu-hub_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."menu-hub_restaurants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurant_billing" ADD CONSTRAINT "menu-hub_restaurant_billing_restaurant_id_menu-hub_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."menu-hub_restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payments_restaurant_idx" ON "menu-hub_payments" USING btree ("restaurant_id");