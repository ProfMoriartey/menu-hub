CREATE TABLE "menu-hub_plan_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"kind" varchar(16) NOT NULL,
	"tier" varchar(16) NOT NULL,
	"billing_cycle" varchar(8) NOT NULL,
	"payment_method" varchar(32),
	"contact_phone" varchar(50),
	"note" text,
	"requested_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolution" varchar(16),
	"resolved_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "menu-hub_plan_requests" ADD CONSTRAINT "menu-hub_plan_requests_restaurant_id_menu-hub_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."menu-hub_restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu-hub_plan_requests" ADD CONSTRAINT "menu-hub_plan_requests_requested_by_menu-hub_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."menu-hub_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plan_requests_restaurant_idx" ON "menu-hub_plan_requests" USING btree ("restaurant_id");