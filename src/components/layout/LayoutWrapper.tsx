// src/components/layout/LayoutWrapper.tsx
"use client"; // This component must be a Client Component to use usePathname and useLocale

import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { TableWorld } from "~/components/table/TableWorld";
import { Navbar } from "~/components/shared/Navbar";
import { SiteFooter } from "~/components/shared/SiteFooter";
import type React from "react";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const locale = useLocale(); // Get the current locale from next-intl
  const t = useTranslations("navbar");

  // Define paths where the Navbar SHOULD be visible (locale-agnostic)
  const basePublicPaths = [
    "/", // For the root path accessed directly (e.g., example.com/)
    "", // For the root path when locale prefix is removed (e.g., example.com/en -> "")
    "/menus",
    "/features",
    "/pricing",
    "/multilingual-menu",
    "/faq",
    "/about",
    // Signing up and creating a restaurant.
    "/start",
    // The KVKK privacy notice.
    "/kvkk",
    // Sign in sits on a plate, on the cloth.
    "/sign-in",
    // Add other base paths that should always show the navbar, e.g., "/contact"
  ];

  // Check if the current path (without locale prefix) is in the list of public paths
  // This makes the check robust to different locales (e.g., /en/menus, /ar/menus)
  const cleanPathname = pathname.startsWith(`/${locale}`)
    ? pathname.substring(`/${locale}`.length)
    : pathname;

  const isPublicNavbarVisible = basePublicPaths.includes(cleanPathname);

  // Text direction (rtl for Arabic) is set on <html> by the server in [locale]/layout.tsx.

  return (
    <>
      {isPublicNavbarVisible ? (
        // The public site lives in The Table: its colours, type and focus
        // rings apply to the bar, the page and the footer.
        <TableWorld className="relative isolate">
          <a
            href="#main"
            className="bg-place-card text-place-card-ink absolute start-3 top-3 z-[60] -translate-y-24 rounded-full px-5 py-3 font-bold shadow-lg focus:translate-y-0"
          >
            {t("skip")}
          </a>
          <Navbar />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter />
        </TableWorld>
      ) : (
        children
      )}
    </>
  );
}
