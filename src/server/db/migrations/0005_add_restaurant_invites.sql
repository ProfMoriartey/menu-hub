CREATE TABLE "menu-hub_restaurant_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"email" varchar(256) NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"invited_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "menu-hub_restaurant_invites_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "menu-hub_restaurant_invites" ADD CONSTRAINT "menu-hub_restaurant_invites_restaurant_id_menu-hub_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."menu-hub_restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurant_invites" ADD CONSTRAINT "menu-hub_restaurant_invites_invited_by_menu-hub_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."menu-hub_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "restaurant_invites_restaurant_email_idx" ON "menu-hub_restaurant_invites" USING btree ("restaurant_id","email");