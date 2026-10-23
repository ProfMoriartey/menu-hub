-- Add URL slugs to categories and menu items, unique within each restaurant.
-- Existing rows get a slug made from their name: lowercased, Turkish and
-- common accented letters mapped to ASCII, everything else turned into "-".
-- Repeated names in the same restaurant get "-2", "-3"… in creation order.
-- Names with no Latin letters or digits become "category" / "item".

ALTER TABLE "menu-hub_categories" ADD COLUMN "slug" varchar(256);--> statement-breakpoint
ALTER TABLE "menu-hub_menu_items" ADD COLUMN "slug" varchar(256);--> statement-breakpoint

WITH base AS (
  SELECT
    id,
    restaurant_id,
    created_at,
    coalesce(
      nullif(trim(both '-' from left(regexp_replace(
        translate(lower(name), 'çğıöşüâîûéèêëàáäíìïóòúùñ' || chr(775), 'cgiosuaiueeeeaaaiiioouun'),
        '[^a-z0-9]+', '-', 'g'
      ), 240)), ''),
      'category'
    ) AS slug
  FROM "menu-hub_categories"
),
ranked AS (
  SELECT id, slug, row_number() OVER (PARTITION BY restaurant_id, slug ORDER BY created_at, id) AS n
  FROM base
)
UPDATE "menu-hub_categories" AS c
SET slug = CASE WHEN r.n = 1 THEN r.slug ELSE r.slug || '-' || r.n END
FROM ranked AS r
WHERE c.id = r.id;--> statement-breakpoint

WITH base AS (
  SELECT
    id,
    restaurant_id,
    created_at,
    coalesce(
      nullif(trim(both '-' from left(regexp_replace(
        translate(lower(name), 'çğıöşüâîûéèêëàáäíìïóòúùñ' || chr(775), 'cgiosuaiueeeeaaaiiioouun'),
        '[^a-z0-9]+', '-', 'g'
      ), 240)), ''),
      'item'
    ) AS slug
  FROM "menu-hub_menu_items"
),
ranked AS (
  SELECT id, slug, row_number() OVER (PARTITION BY restaurant_id, slug ORDER BY created_at, id) AS n
  FROM base
)
UPDATE "menu-hub_menu_items" AS m
SET slug = CASE WHEN r.n = 1 THEN r.slug ELSE r.slug || '-' || r.n END
FROM ranked AS r
WHERE m.id = r.id;--> statement-breakpoint

ALTER TABLE "menu-hub_categories" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "menu-hub_menu_items" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_restaurant_slug_idx" ON "menu-hub_categories" USING btree ("restaurant_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "menu_items_restaurant_slug_idx" ON "menu-hub_menu_items" USING btree ("restaurant_id","slug");
