// src/components/public/CategoryNav.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "~/lib/utils";
import { categorySectionId } from "~/lib/category-section";

import type { Category } from "~/types/restaurant";

// How far below the top of the screen a section's heading must be scrolled
// before it counts as the one being read. Clears the sticky category bar.
const ACTIVE_THRESHOLD_PX = 120;

/**
 * Tracks which category section is on screen, and scrolls to one on request.
 * While a requested scroll is running the highlight stays on the requested
 * category, so it doesn't flicker through every section passed on the way.
 */
export function useCategoryScrollSpy(categories: Pick<Category, "slug">[]) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? null);
  const lockUntilIdle = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      let current = categories[0]?.slug ?? null;
      for (const { slug } of categories) {
        const section = document.getElementById(categorySectionId(slug));
        if (
          section &&
          section.getBoundingClientRect().top <= ACTIVE_THRESHOLD_PX
        ) {
          current = slug;
        }
      }
      // A short last section may never reach the top; at the very bottom of
      // the page it is the one being read.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom && categories.length)
        current = categories[categories.length - 1]!.slug;
      setActiveSlug(current);
    };

    const onScroll = () => {
      if (lockUntilIdle.current) {
        // A requested scroll is still moving: wait until it stops.
        clearTimeout(lockUntilIdle.current);
        lockUntilIdle.current = setTimeout(
          () => (lockUntilIdle.current = null),
          150,
        );
        return;
      }
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [categories]);

  const scrollToCategory = useCallback((slug: string) => {
    const section = document.getElementById(categorySectionId(slug));
    if (!section) return;
    setActiveSlug(slug);
    if (lockUntilIdle.current) clearTimeout(lockUntilIdle.current);
    lockUntilIdle.current = setTimeout(
      () => (lockUntilIdle.current = null),
      150,
    );
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    section.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  return { activeSlug, scrollToCategory };
}

/**
 * The category list above (bar) or beside (sidebar) a scrolling menu. The
 * bar keeps the highlighted category in view by scrolling itself sideways.
 */
export function CategoryNav({
  categories,
  activeSlug,
  onSelect,
  variant,
  className,
}: {
  categories: (Pick<Category, "id" | "slug" | "name"> & { lang?: string })[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
  variant: "bar" | "sidebar";
  className?: string;
}) {
  const t = useTranslations("PublicMenu");
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (variant !== "bar" || !list || !activeSlug) return;
    const button = list.querySelector<HTMLElement>(
      `[data-slug="${CSS.escape(activeSlug)}"]`,
    );
    if (!button) return;
    // Measured on screen rather than with offsetLeft, so it works the same
    // way in right-to-left languages.
    const listBox = list.getBoundingClientRect();
    const buttonBox = button.getBoundingClientRect();
    const offset =
      buttonBox.left + buttonBox.width / 2 - (listBox.left + listBox.width / 2);
    list.scrollBy({ left: offset, behavior: "smooth" });
  }, [activeSlug, variant]);

  return (
    <nav
      aria-label={t("categoriesNav")}
      className={cn(
        "bg-card rounded-lg shadow-md",
        variant === "bar" && "sticky top-0 z-10 px-2 py-3",
        variant === "sidebar" &&
          "sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto p-4",
        className,
      )}
    >
      <ul
        ref={listRef}
        className={cn(
          variant === "bar" &&
            "scrollbar-hide flex gap-2 overflow-x-auto px-2 whitespace-nowrap",
          variant === "sidebar" && "space-y-2",
        )}
      >
        {categories.map((category) => {
          const active = category.slug === activeSlug;
          return (
            <li key={category.id}>
              <button
                type="button"
                data-slug={category.slug}
                aria-current={active ? "true" : undefined}
                onClick={() => onSelect(category.slug)}
                className={cn(
                  "font-medium transition-colors duration-200",
                  variant === "bar" && "rounded-full px-4 py-2 text-sm",
                  variant === "sidebar" &&
                    "w-full rounded-md px-4 py-2 text-start text-base",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : variant === "bar"
                      ? "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                      : "bg-background text-foreground hover:bg-muted-foreground/10",
                )}
              >
                <span lang={category.lang} dir="auto">
                  {category.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
