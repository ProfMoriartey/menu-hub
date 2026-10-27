// src/components/features/MenuDemo.tsx
"use client";

import { useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";
import {
  ClassicDish,
  CompactDish,
  PhotoDish,
} from "~/components/public/MenuItemCard";
import { DishSheetInPlaceProvider } from "~/components/public/DishSheet";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import { useTheme } from "~/context/ThemeContext";
import { PRESETS, paletteTokens, type ThemeMode } from "~/lib/color-theme";
import { DEMO_RESTAURANT } from "~/lib/demo-menu";
import {
  LANGUAGE_NAMES,
  MENU_LANGUAGES,
  isMenuLanguage,
  type MenuLanguage,
} from "~/lib/menu-languages";
import { MENU_DESIGNS, type MenuDesign } from "~/lib/menu-design";
import { cn } from "~/lib/utils";

import type { DemoMenus } from "~/server/demo-menu";

const DISHES = {
  classic: ClassicDish,
  "photo-grid": PhotoDish,
  compact: CompactDish,
} as const;

// A control row: a label and pill buttons, one of them pressed.
function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
  render,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  render: (option: T) => React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
              value === option
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {render(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * A working copy of a menu, Lokanta Demo, in a phone frame: visitors switch
 * its design, colours, light/dark and language, and tap dishes to open the
 * bottom sheet. Built from the same components as real menus.
 */
export function MenuDemo({
  menus,
  initialLanguage,
  controls = true,
}: {
  menus: DemoMenus;
  initialLanguage: string;
  // The home page shows the phone with fewer controls.
  controls?: boolean | "compact";
}) {
  const t = useTranslations("featuresPage.demo");
  const tDesign = useTranslations("MenuDesign");
  const tColors = useTranslations("ColorTheme");
  const tMenu = useTranslations("PublicMenu");

  const [design, setDesign] = useState<MenuDesign>("classic");
  const [preset, setPreset] = useState(PRESETS[0]!.id);
  // Light or dark like the page, until a visitor picks one with the controls.
  const { theme: pageTheme } = useTheme();
  const [modeChoice, setMode] = useState<ThemeMode | null>(null);
  const mode: ThemeMode = modeChoice ?? (pageTheme === "dark" ? "dark" : "light");
  const [lang, setLang] = useState<MenuLanguage>(
    isMenuLanguage(initialLanguage) ? initialLanguage : "en",
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const menu = menus[lang];
  const theme = PRESETS.find((p) => p.id === preset)!.theme;
  const style = Object.fromEntries(
    Object.entries(paletteTokens(theme[mode])).map(([token, value]) => [
      `--${token}`,
      value,
    ]),
  ) as CSSProperties;
  const Dish = DISHES[design];

  // Scroll the phone, not the page, to a category.
  const showCategory = (slug: string) => {
    setActiveCategory(slug);
    const box = scroller.current;
    const section = box?.querySelector<HTMLElement>(
      `[data-category="${slug}"]`,
    );
    if (box && section)
      box.scrollTo({ top: section.offsetTop - 52, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
      {controls && (
        <div className="w-full max-w-sm space-y-5 lg:order-2 lg:pt-6">
          <Choice
            label={t("design")}
            options={MENU_DESIGNS}
            value={design}
            onChange={setDesign}
            render={(option) => tDesign(`${option}.label`)}
          />
          {controls !== "compact" && (
            <>
              <Choice
                label={t("colors")}
                options={PRESETS.map((p) => p.id)}
                value={preset}
                onChange={setPreset}
                render={(id) => (
                  <>
                    <span
                      className="flex -space-x-1 rtl:space-x-reverse"
                      aria-hidden
                    >
                      {(["background", "primary", "secondary"] as const).map(
                        (role) => (
                          <span
                            key={role}
                            className="ring-card h-3.5 w-3.5 rounded-full ring-2"
                            style={{
                              background: PRESETS.find((p) => p.id === id)!
                                .theme[mode][role],
                            }}
                          />
                        ),
                      )}
                    </span>
                    {tColors(`presets.${id}`)}
                  </>
                )}
              />
              <Choice
                label={t("mode")}
                options={["light", "dark"] as const}
                value={mode}
                onChange={setMode}
                render={(m) => (
                  <>
                    {m === "light" ? (
                      <Sun className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <Moon className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {tColors(m)}
                  </>
                )}
              />
            </>
          )}
          <Choice
            label={t("language")}
            options={MENU_LANGUAGES}
            value={lang}
            onChange={setLang}
            render={(l) => <span lang={l}>{LANGUAGE_NAMES[l]}</span>}
          />
          <p className="text-muted-foreground text-sm">{t("hint")}</p>
        </div>
      )}

      {/* The phone. Its screen gets the chosen colours and the menu's
          language and direction; the sheet opens inside it. "isolate"
          keeps the sheet and its shade under the site's sticky navbar. */}
      <div className="border-foreground/85 relative isolate h-[620px] w-[320px] shrink-0 overflow-hidden rounded-[2.5rem] border-[10px] shadow-2xl lg:order-1">
        <div
          ref={setFrame}
          style={style}
          lang={lang}
          dir={lang === "ar" ? "rtl" : "ltr"}
          className="bg-background text-foreground relative h-full"
        >
          <DishSheetInPlaceProvider
            categories={menu.categories}
            container={frame}
          >
            <div
              ref={scroller}
              className="h-full overflow-y-auto overscroll-contain"
            >
              <header className="bg-card border-border border-b px-3 pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <RestaurantLogo
                    restaurant={{ name: DEMO_RESTAURANT.name, logoUrl: null }}
                    className="h-12 w-12 rounded-xl text-base"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-lg leading-tight font-bold">
                      {DEMO_RESTAURANT.name}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                        aria-hidden
                      />
                      {tMenu("openNow")}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mt-2 line-clamp-1 text-sm">
                  {menu.description}
                </p>
              </header>

              <nav className="bg-card border-border sticky top-0 z-10 flex gap-1.5 overflow-x-auto border-b px-2 py-2">
                {menu.categories.map((category) => {
                  const active =
                    (activeCategory ?? menu.categories[0]?.slug) ===
                    category.slug;
                  return (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => showCategory(category.slug)}
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                      aria-current={active ? "true" : undefined}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </nav>

              <div className="space-y-5 p-3">
                {menu.categories.map((category) => (
                  <section key={category.slug} data-category={category.slug}>
                    <h3 className="mb-2 text-base font-semibold">
                      {category.name}
                    </h3>
                    {design === "compact" ? (
                      <ul className="bg-card border-border divide-border divide-y overflow-hidden rounded-xl border">
                        {category.menuItems.map((item) => (
                          <li key={item.id}>
                            <Dish
                              item={item}
                              restaurantSlug={DEMO_RESTAURANT.slug}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div
                        className={cn(
                          "grid gap-2.5",
                          design === "photo-grid" && "grid-cols-2",
                        )}
                      >
                        {category.menuItems.map((item) => (
                          <Dish
                            key={item.id}
                            item={item}
                            restaurantSlug={DEMO_RESTAURANT.slug}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </DishSheetInPlaceProvider>
        </div>
      </div>
    </div>
  );
}
