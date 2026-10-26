// src/components/public/DishSheet.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ExternalLink, X } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { DietaryBadges } from "~/components/public/DietaryBadges";
import { SoldOutBadge } from "~/components/public/SoldOutBadge";

import type {
  PublicCategory,
  PublicMenuItem,
} from "~/components/public/menu-types";

// The dish open in the sheet lives in the address (?dish=<slug>): the phone's
// back button closes it, and a copied link opens the menu with it showing.
const PARAM = "dish";

const DishSheetContext = createContext<{
  open: (item: PublicMenuItem) => void;
} | null>(null);

/** Opens dishes in the bottom sheet; null outside a menu (e.g. previews). */
export const useDishSheet = () => useContext(DishSheetContext);

export function DishSheetProvider({
  categories,
  restaurantSlug,
  children,
}: {
  // Every category, not just the filtered ones, so a shared link always works.
  categories: PublicCategory[];
  restaurantSlug: string;
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const openSlug = searchParams.get(PARAM);
  // Whether the open dish added a history entry, so closing can go back.
  const pushed = useRef(false);

  const found = useMemo(() => {
    for (const category of categories) {
      const item = category.menuItems.find((i) => i.slug === openSlug);
      if (item) return { item, category };
    }
    return null;
  }, [categories, openSlug]);

  useEffect(() => {
    if (!openSlug) pushed.current = false;
  }, [openSlug]);

  const open = useCallback((item: PublicMenuItem) => {
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM, item.slug);
    url.hash = "";
    // Next.js keeps its router in step with the native history API.
    window.history.pushState(null, "", url);
    pushed.current = true;
  }, []);

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
      return;
    }
    // Opened from a shared link: drop the parameter in place.
    const url = new URL(window.location.href);
    url.searchParams.delete(PARAM);
    window.history.replaceState(null, "", url);
  }, []);

  const context = useMemo(() => ({ open }), [open]);

  return (
    <DishSheetContext.Provider value={context}>
      {children}
      <DialogPrimitive.Root
        open={Boolean(found)}
        onOpenChange={(next) => !next && close()}
      >
        {found && (
          <DishSheetContent {...found} restaurantSlug={restaurantSlug} />
        )}
      </DialogPrimitive.Root>
    </DishSheetContext.Provider>
  );
}

/**
 * The same sheet without the address: it opens inside `container` (e.g. the
 * phone on the Features page) and keeps the open dish in state. For demos,
 * where changing the page's address would be wrong.
 */
export function DishSheetInPlaceProvider({
  categories,
  container,
  children,
}: {
  categories: PublicCategory[];
  container: HTMLElement | null;
  children: React.ReactNode;
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const found = useMemo(() => {
    for (const category of categories) {
      const item = category.menuItems.find((i) => i.slug === openSlug);
      if (item) return { item, category };
    }
    return null;
  }, [categories, openSlug]);
  const context = useMemo(
    () => ({ open: (item: PublicMenuItem) => setOpenSlug(item.slug) }),
    [],
  );

  return (
    <DishSheetContext.Provider value={context}>
      {children}
      {/* Not modal: a modal dialog locks scrolling on the whole page, but
          this sheet only covers the phone it opens in. Tapping outside the
          sheet (its backdrop, or anywhere on the page) still closes it. */}
      <DialogPrimitive.Root
        modal={false}
        open={Boolean(found)}
        onOpenChange={(next) => !next && setOpenSlug(null)}
      >
        {found && container && (
          <DishSheetContent
            {...found}
            restaurantSlug={null}
            container={container}
          />
        )}
      </DialogPrimitive.Root>
    </DishSheetContext.Provider>
  );
}

function DishSheetContent({
  item,
  category,
  restaurantSlug,
  container,
}: {
  item: PublicMenuItem;
  category: PublicCategory;
  // Null for demos: there's no dish page to link to.
  restaurantSlug: string | null;
  // Where the sheet opens: the page (default) or inside an element.
  container?: HTMLElement;
}) {
  const t = useTranslations("PublicMenu");
  const contained = Boolean(container);

  return (
    <DialogPrimitive.Portal container={container}>
      {contained ? (
        // Non-modal dialogs get no overlay from Radix: dim the phone ourselves.
        <div
          className="animate-in fade-in-0 absolute inset-0 z-50 bg-black/50"
          aria-hidden
        />
      ) : (
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
      )}
      <DialogPrimitive.Content
        className={[
          "bg-card text-foreground z-50 flex flex-col overflow-hidden shadow-xl outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
          contained
            ? // Inside a phone-sized frame: always the phone's bottom sheet.
              "absolute inset-x-0 bottom-0 max-h-[85%] rounded-t-2xl"
            : // Phones: a sheet from the bottom edge. Wider screens: a centred panel.
              "sm:data-[state=open]:slide-in-from-bottom-4 sm:data-[state=open]:fade-in-0 fixed inset-x-0 bottom-0 max-h-[90dvh] rounded-t-2xl sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
        ].join(" ")}
      >
        {/* The grab handle says "this can be closed" on phones. */}
        <div
          className={[
            "bg-muted-foreground/30 absolute top-2 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full",
            contained ? "" : "sm:hidden",
          ].join(" ")}
          aria-hidden
        />
        <DialogPrimitive.Close
          className="bg-card/90 text-foreground hover:bg-card absolute end-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur"
          aria-label={t("closeDish")}
        >
          <X className="h-4 w-4" aria-hidden />
        </DialogPrimitive.Close>

        <div className="overflow-y-auto overscroll-contain">
          {item.imageUrl && (
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(min-width: 640px) 512px, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="space-y-3 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className={item.imageUrl ? "" : "pe-10 pt-4"}>
              <p className="text-muted-foreground text-sm">
                <span lang={category.lang} dir="auto">
                  {category.name}
                </span>
              </p>
              <DialogPrimitive.Title className="text-2xl leading-tight font-bold">
                <span lang={item.lang} dir="auto">
                  {item.name}
                </span>
              </DialogPrimitive.Title>
            </div>
            <p className="text-primary text-xl font-bold tabular-nums">
              {item.displayPrice}
              <SoldOutBadge availability={item.availability} />
            </p>
            {item.description ? (
              <DialogPrimitive.Description className="text-muted-foreground leading-relaxed">
                <span lang={item.lang} dir="auto">
                  {item.description}
                </span>
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">
                {item.name}
              </DialogPrimitive.Description>
            )}
            <DietaryBadges labels={item.dietaryLabels} />
            {item.ingredients && (
              <div className="border-border border-t pt-3">
                <h3 className="mb-1 text-sm font-semibold">
                  {t("ingredients")}
                </h3>
                <p
                  className="text-muted-foreground text-sm"
                  lang={item.lang}
                  dir="auto"
                >
                  {item.ingredients}
                </p>
              </div>
            )}
            {restaurantSlug && (
              <Link
                href={`/${restaurantSlug}/item/${item.slug}`}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 pt-1 text-sm underline underline-offset-2"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />{" "}
                {t("dishPage")}
              </Link>
            )}
          </div>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
