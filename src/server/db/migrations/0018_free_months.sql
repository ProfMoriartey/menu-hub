ALTER TABLE "menu-hub_restaurant_billing" ADD COLUMN "offline_when_unpaid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "menu-hub_restaurants" ADD COLUMN "live_until" date;--> statement-breakpoint
-- Sign-ups no longer wait for an admin: those still waiting get Standard
-- (the only plan offered) with 6 free months from today, after which the
-- menu goes offline until a payment is recorded.
UPDATE "menu-hub_restaurant_billing" SET
  "tier" = 'standard',
  "starts_on" = COALESCE("starts_on", (((now() AT TIME ZONE 'Europe/Istanbul')::date) + interval '6 months')::date),
  "offline_when_unpaid" = true,
  "updated_at" = now()
WHERE "restaurant_id" IN (
  SELECT "restaurant_id" FROM "menu-hub_plan_requests" WHERE "kind" = 'signup' AND "resolution" IS NULL
);--> statement-breakpoint
UPDATE "menu-hub_restaurants" r SET "live_until" = b."starts_on" - 1
FROM "menu-hub_restaurant_billing" b
WHERE b."restaurant_id" = r."id" AND b."offline_when_unpaid" AND b."starts_on" IS NOT NULL;--> statement-breakpoint
UPDATE "menu-hub_plan_requests" SET "resolution" = 'approved', "resolved_at" = now()
WHERE "kind" = 'signup' AND "resolution" IS NULL;--> statement-breakpoint
-- Standard now includes branches, languages and colours (lib/plans), as do
-- restaurants without a plan; an admin's overrides still win.
UPDATE "menu-hub_restaurants" r SET
  "brand_color_enabled" = COALESCE(b."colors_override", true),
  "max_extra_languages" = b."languages_override",
  "multilingual_enabled" = COALESCE(b."languages_override", 1) > 0,
  "max_branches" = b."branches_override"
FROM (
  SELECT r2."id", b2."colors_override", b2."languages_override", b2."branches_override"
  FROM "menu-hub_restaurants" r2
  LEFT JOIN "menu-hub_restaurant_billing" b2 ON b2."restaurant_id" = r2."id"
  WHERE b2."tier" IS NULL OR b2."tier" = 'standard'
) b
WHERE b."id" = r."id";
