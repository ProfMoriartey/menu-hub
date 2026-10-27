ALTER TABLE "menu-hub_restaurants" ADD COLUMN "city" varchar(128);--> statement-breakpoint
-- Venue types became a fixed list (lib/venue-types.ts). Typed values that
-- clearly name one become its key; the rest stay as typed and are shown as
-- they are until an admin picks a type.
UPDATE "menu-hub_restaurants" AS r SET "type_of_establishment" = CASE
  WHEN s.t ~ '(coffee|kahve|espresso|roaster|قهوة|кофе)' THEN 'coffee_shop'
  WHEN s.t ~ '(caf[eé]|kafe|مقهى|кафе)' THEN 'cafe'
  WHEN s.t ~ '(baker|pastane|patisser|pastry|f[ıi]r[ıi]n|مخبز)' THEN 'bakery'
  WHEN s.t ~ '(dessert|tatl[ıi]|ice cream|dondurma|حلويات)' THEN 'dessert'
  WHEN s.t ~ '(\mbar\M|\mpub\M|meyhane)' THEN 'bar'
  WHEN s.t ~ '(\mfast|burger|b[üu]fe|d[öo]ner|d[üu]r[üu]m|sandv|\mtost)' THEN 'fast_food'
  WHEN s.t ~ '(lokanta|ev yemek|home)' THEN 'home_cooking'
  WHEN s.t ~ '(restaurant|restoran|مطعم|ресторан|zincir|chain|dining)' THEN 'restaurant'
  ELSE r."type_of_establishment"
END
FROM (
  SELECT "id", lower(coalesce("type_of_establishment", '') || ' ' || coalesce("food_type", '')) AS t
  FROM "menu-hub_restaurants"
) AS s
WHERE s."id" = r."id";--> statement-breakpoint
-- Countries became ISO codes (lib/countries.ts). Common typed names become
-- their code; anything else stays as typed.
UPDATE "menu-hub_restaurants" SET "country" = CASE
  WHEN lower("country") ~ '(t[üu]rk|تركيا|турц)' THEN 'TR'
  WHEN lower("country") ~ '(\muae\M|emirates|إمارات|امارات|dubai|دبي)' THEN 'AE'
  WHEN lower("country") ~ '(alban|albain)' THEN 'AL'
  WHEN lower("country") ~ '(iraq|عراق)' THEN 'IQ'
  WHEN lower("country") ~ '(saudi|سعودية)' THEN 'SA'
  WHEN lower("country") ~ '(colombia)' THEN 'CO'
  WHEN lower("country") ~ '(germany|deutschland)' THEN 'DE'
  WHEN lower("country") ~ '(united kingdom|britain|england|^uk$)' THEN 'GB'
  WHEN lower("country") ~ '(united states|^usa$|^us$)' THEN 'US'
  ELSE "country"
END
WHERE "country" IS NOT NULL;
