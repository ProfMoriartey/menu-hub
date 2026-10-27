// src/components/layout/LayoutWrapper.tsx
"use client"; // This component must be a Client Component to use usePathname and useLocale

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl"; // CORRECTED: Import useLocale directly from 'next-intl'
import { Navbar } from "~/components/shared/Navbar"; // Import your Navbar component
import type React from "react";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const locale = useLocale(); // Get the current locale from next-intl

  // Define paths where the Navbar SHOULD be visible (locale-agnostic)
  const basePublicPaths = [
    "/", // For the root path accessed directly (e.g., example.com/)
    "", // For the root path when locale prefix is removed (e.g., example.com/en -> "")
    "/menus",
    "/features",
    "/about",
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
      {isPublicNavbarVisible && <Navbar />}
      {children}
    </>
  );
}
