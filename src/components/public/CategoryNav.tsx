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
 *
 * Sections are only measured when one crosses the line under the sticky bar
 * (or the end of the menu comes into view), not on every scroll frame, so
 * scrolling stays smooth on slower phones.
 */
export function useCategoryScrollSpy(categories: Pick<Category, "slug">[]) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? null);
  const lockUntilIdle = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Placed after the last section; see MenuLayout.
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let atEnd = false;

    const update = () => {
      // A requested scroll is still moving: keep its category.
      if (lockUntilIdle.current) return;
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
      // A short last section may never reach the top; once the end of the
      // menu is on screen it is the one being read.
      if (atEnd && categories.length)
        current = categories[categories.length - 1]!.slug;
      setActiveSlug(current);
    };

    // The viewport minus the strip above the line: a section enters or
    // leaves it as its top crosses ACTIVE_THRESHOLD_PX.
    const sections = new IntersectionObserver(update, {
      rootMargin: `-${ACTIVE_THRESHOLD_PX}px 0px 0px 0px`,
    });
    for (const { slug } of categories) {
      const section = document.getElementById(categorySectionId(slug));
      if (section) sections.observe(section);
    }
    const end = new IntersectionObserver(([entry]) => {
      atEnd = entry?.isIntersecting ?? false;
      update();
    });
    if (endRef.current) end.observe(endRef.current);

    // Only keeps the lock while a requested scroll is moving; cheap.
    const onScroll = () => {
      if (!lockUntilIdle.current) return;
      clearTimeout(lockUntilIdle.current);
      lockUntilIdle.current = setTimeout(
        () => (lockUntilIdle.current = null),
        150,
      );
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      sections.disconnect();
      end.disconnect();
      window.removeEventListener("scroll", onScroll);
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

  return { activeSlug, scrollToCategory, endRef };
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
        variant === "bar" && "sticky top-0 z-10 px-1.5 py-2 sm:px-2 sm:py-3",
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
