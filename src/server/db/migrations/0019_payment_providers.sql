CREATE TABLE "menu-hub_billing_details" (
	"restaurant_id" uuid PRIMARY KEY NOT NULL,
	"kind" varchar(16) NOT NULL,
	"legal_name" varchar(256) NOT NULL,
	"tax_number" varchar(32),
	"tax_office" varchar(128),
	"address" text NOT NULL,
	"city" varchar(128) NOT NULL,
	"postal_code" varchar(16),
	"country" varchar(2) NOT NULL,
	"invoice_email" varchar(256) NOT NULL,
	"phone" varchar(50),
	"updated_by" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu-hub_payments" ADD COLUMN "provider" varchar(32) DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "menu-hub_payments" ADD COLUMN "provider_payment_id" varchar(128);--> statement-breakpoint
ALTER TABLE "menu-hub_billing_details" ADD CONSTRAINT "menu-hub_billing_details_restaurant_id_menu-hub_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."menu-hub_restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_payment_idx" ON "menu-hub_payments" USING btree ("provider","provider_payment_id");