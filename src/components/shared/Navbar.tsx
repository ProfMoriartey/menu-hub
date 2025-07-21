// src/components/shared/Navbar.tsx
"use client"; // This is a Client Component because it contains interactive elements (Link, responsive behavior)

import Link from "next/link";
import { usePathname } from "next/navigation"; // To highlight active link
import { cn } from "~/lib/utils"; // For conditional class merging

export function Navbar() {
  const pathname = usePathname(); // Get current path for active link styling

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Restaurants", href: "/restaurants" },
    { name: "Themes", href: "/themes" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left Side: Website Logo (linked to Home) */}
        <Link href="/" className="flex items-center space-x-2">
          {/* Replace with your actual logo if you have one */}
          <span className="text-2xl font-bold text-blue-600">Menu Hub</span>
        </Link>

        {/* Right Side: Navigation Links */}
        <div className="flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-lg font-medium transition-colors hover:text-blue-600",
                pathname === link.href ? "text-blue-600" : "text-gray-700",
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
