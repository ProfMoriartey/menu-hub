// src/components/layout/LayoutWrapper.tsx
// This component must be a Client Component to use usePathname and useLocale.

"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "~/components/shared/Navbar"; // Import your Navbar component
import React from "react"; // Explicit import React
import { useLocale } from "next-intl"; // ADDED: Import useLocale

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const locale = useLocale(); // ADDED: Get the current locale dynamically

  // Define paths where the Navbar SHOULD be visible, WITHOUT the locale prefix.
  // The root path "/" corresponds to "/[locale]" in the URL.
  const basePublicPaths = [
    "/", // Corresponds to /en, /es, /ru etc.
    "/restaurants",
    "/themes",
    "/about",
  ];

  // Derive the path without the locale prefix
  // e.g., for "/en/restaurants", cleanPathname will be "/restaurants"
  // For "/en", cleanPathname will be "" or should be "/"
  const cleanPathname = pathname.startsWith(`/${locale}`)
    ? pathname.replace(`/${locale}`, "") || "/" // If it becomes empty after removing locale, make it "/"
    : pathname; // Fallback if locale prefix is unexpectedly missing

  // Check if the cleaned path is in our list of base public paths
  const isPublicNavbarVisible = basePublicPaths.includes(cleanPathname);

  return (
    <>
      {isPublicNavbarVisible && <Navbar />}
      {children}
    </>
  );
}
