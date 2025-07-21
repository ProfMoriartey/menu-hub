// src/components/shared/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react"; // Import useState for managing mobile menu state
import { Menu, X } from "lucide-react"; // Import icons for hamburger and close
import { cn } from "~/lib/utils"; // For conditional class merging

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

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
          <span className="text-2xl font-bold text-blue-600">Menu Hub</span>
        </Link>

        {/* Right Side: Desktop Navigation Links */}
        <div className="hidden items-center space-x-6 md:flex">
          {" "}
          {/* Hidden on small screens */}
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

        {/* Mobile Menu Button (Hamburger) */}
        <div className="md:hidden">
          {" "}
          {/* Visible only on small screens */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md p-2 text-gray-700 hover:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" /> // Close icon when menu is open
            ) : (
              <Menu className="h-6 w-6" /> // Hamburger icon when menu is closed
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown/Overlay */}
      {isMobileMenuOpen && (
        <div className="animate-fade-in-down fixed inset-0 z-40 flex flex-col items-center justify-center space-y-8 bg-white py-10 md:hidden">
          {/* Close button (optional, but good for UX if not already handled by PopoverTrigger) */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 rounded-md p-2 text-gray-700 hover:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="Close mobile menu"
          >
            <X className="h-8 w-8" />
          </button>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
              className={cn(
                "text-3xl font-semibold transition-colors hover:text-blue-600",
                pathname === link.href ? "text-blue-600" : "text-gray-800",
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
