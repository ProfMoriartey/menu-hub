ALTER TABLE "menu-hub_restaurant_billing" ALTER COLUMN "currency" SET DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "menu-hub_restaurant_billing" ADD COLUMN "tier" varchar(16);--> statement-breakpoint
ALTER TABLE "menu-hub_restaurant_billing" ADD COLUMN "billing_cycle" varchar(8) DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurant_billing" ADD COLUMN "colors_override" boolean;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurant_billing" ADD COLUMN "languages_override" integer;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurant_billing" ADD COLUMN "branches_override" integer;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "max_extra_languages" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "max_branches" integer DEFAULT 1;--> statement-breakpoint
-- Plans named before tiers existed become the tier their name says.
UPDATE "menu-hub_restaurant_billing" SET "tier" = CASE
  WHEN lower("plan_name") ~ '(business|franchise|chain)' THEN 'business'
  WHEN lower("plan_name") ~ 'pro' THEN 'pro'
  ELSE 'standard'
END
WHERE "plan_name" IS NOT NULL AND trim("plan_name") <> '';--> statement-breakpoint
-- Nothing a restaurant has now goes away: colours or languages an admin
-- switched on, and branches beyond one, become overrides (lib/plans).
INSERT INTO "menu-hub_restaurant_billing" ("restaurant_id", "colors_override", "languages_override", "branches_override")
SELECT r."id",
  CASE WHEN r."brand_color_enabled" THEN true END,
  CASE WHEN r."multilingual_enabled" THEN 4 END,
  CASE WHEN b.n > 1 THEN b.n END
FROM "menu-hub_restaurants" r
LEFT JOIN (
  SELECT "restaurant_id", count(*)::int AS n FROM "menu-hub_branches" GROUP BY "restaurant_id"
) b ON b."restaurant_id" = r."id"
WHERE r."brand_color_enabled" OR r."multilingual_enabled" OR b.n > 1
ON CONFLICT ("restaurant_id") DO UPDATE SET
  "colors_override" = EXCLUDED."colors_override",
  "languages_override" = EXCLUDED."languages_override",
  "branches_override" = EXCLUDED."branches_override";--> statement-breakpoint
-- What each restaurant may use, as lib/plans entitlements() works it out:
-- the override, else the tier's (Standard's without a plan).
UPDATE "menu-hub_restaurants" r SET
  "brand_color_enabled" = coalesce(b."colors_override", b."tier" IN ('pro', 'business'), false),
  "max_extra_languages" = CASE
    WHEN b."languages_override" IS NOT NULL THEN b."languages_override"
    WHEN b."tier" = 'pro' THEN 2
    WHEN b."tier" = 'business' THEN NULL
    ELSE 0
  END,
  "max_branches" = CASE
    WHEN b."branches_override" IS NOT NULL THEN b."branches_override"
    WHEN b."tier" = 'pro' THEN 5
    WHEN b."tier" = 'business' THEN NULL
    ELSE 1
  END
FROM (
  SELECT r2."id", x."tier", x."colors_override", x."languages_override", x."branches_override"
  FROM "menu-hub_restaurants" r2
  LEFT JOIN "menu-hub_restaurant_billing" x ON x."restaurant_id" = r2."id"
) b
WHERE b."id" = r."id";--> statement-breakpoint
UPDATE "menu-hub_restaurants" SET "multilingual_enabled" = coalesce("max_extra_languages", 1) > 0;
