// src/components/layout/LayoutWrapper.tsx
"use client"; // This component must be a Client Component to use usePathname

import { usePathname } from "next/navigation";
import { Navbar } from "~/components/shared/Navbar"; // Import your Navbar component
import React from "react"; // Explicit import React

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Define paths where the Navbar SHOULD be visible
  const publicNavbarPaths = [
    "/ar",
    "/en",
    "/tr",
    "/en/restaurants",
    "/en/themes",
    "/en/about",
    "/tr/restaurants",
    "/tr/themes",
    "/tr/about",
    "/ar/restaurants",
    "/ar/themes",
    "/ar/about",
  ];

  // Check if the current path starts with any of the admin or menu display patterns
  const isPublicNavbarVisible = publicNavbarPaths.includes(pathname);
  // You can add more complex logic here if paths have dynamic segments:
  // e.g., !pathname.startsWith('/admin') && !pathname.match(/^\/[^/]+\/item\//)

  return (
    <>
      {isPublicNavbarVisible && <Navbar />}
      {children}
    </>
  );
}
