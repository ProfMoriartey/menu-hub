-- Four menu designs became three (lib/menu-design.ts). Sidebar list looked
-- like Classic on phones; Accordion cards becomes Compact; Image cards
-- becomes Photo grid. Unknown or empty values fall back to Classic in code.
UPDATE "menu-hub_restaurants" SET "theme" = 'classic' WHERE "theme" = 'sidebar-list';--> statement-breakpoint
UPDATE "menu-hub_restaurants" SET "theme" = 'compact' WHERE "theme" = 'accordion-card';--> statement-breakpoint
UPDATE "menu-hub_restaurants" SET "theme" = 'photo-grid' WHERE "theme" = 'category-cards-image-dominant';
