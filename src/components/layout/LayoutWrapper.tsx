// src/components/layout/LayoutWrapper.tsx
"use client"; // This component must be a Client Component to use usePathname and useLocale

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl"; // CORRECTED: Import useLocale directly from 'next-intl'
import { Navbar } from "~/components/shared/Navbar"; // Import your Navbar component
import React, { useEffect } from "react"; // Explicit import React and useEffect

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
    "/restaurants",
    "/themes",
    "/about",
    // Add other base paths that should always show the navbar, e.g., "/contact"
  ];

  // Check if the current path (without locale prefix) is in the list of public paths
  // This makes the check robust to different locales (e.g., /en/restaurants, /ar/restaurants)
  const cleanPathname = pathname.startsWith(`/${locale}`)
    ? pathname.substring(`/${locale}`.length)
    : pathname;

  const isPublicNavbarVisible = basePublicPaths.includes(cleanPathname);

  // Effect to apply dir="rtl" to the <html> element for Arabic locale
  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      locale === "ar" ? "rtl" : "ltr",
    );

    // Cleanup function: Set back to ltr when component unmounts or locale changes
    return () => {
      document.documentElement.setAttribute("dir", "ltr");
    };
  }, [locale]); // Rerun effect when locale changes

  return (
    <>
      {isPublicNavbarVisible && <Navbar />}
      {children}
    </>
  );
}
