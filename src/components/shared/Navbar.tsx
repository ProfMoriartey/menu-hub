// src/components/shared/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/shared/ThemeToggle"; // ADDED: Import ThemeToggle

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Restaurants", href: "/restaurants" },
    { name: "Themes", href: "/themes" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <nav className="bg-card sticky top-0 z-50 w-full p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left Side: Website Logo (linked to Home) */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-primary text-2xl font-bold">Menu Hub</span>
        </Link>

        {/* Right Side: Desktop Navigation Links and Theme Toggle */}
        <div className="flex items-center space-x-6">
          {" "}
          {/* Changed from hidden md:flex to just flex */}
          {/* Desktop Navigation Links (still hidden on small screens) */}
          <div className="hidden items-center space-x-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "hover:text-primary text-lg font-medium transition-colors",
                  pathname === link.href ? "text-primary" : "text-foreground",
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
          {/* Theme Toggle (visible on all screens) */}
          <ThemeToggle /> {/* ADDED: Theme Toggle here */}
          {/* Mobile Menu Button (Hamburger) - only visible on small screens */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground hover:text-primary focus:ring-primary rounded-md p-2 focus:ring-2 focus:outline-none"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown/Overlay */}
      {isMobileMenuOpen && (
        <div className="animate-fade-in-down bg-background fixed inset-0 z-40 flex flex-col items-center justify-center space-y-8 py-10 md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-foreground hover:text-primary focus:ring-primary absolute top-4 right-4 rounded-md p-2 focus:ring-2 focus:outline-none"
            aria-label="Close mobile menu"
          >
            <X className="h-8 w-8" />
          </button>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "hover:text-primary text-3xl font-semibold transition-colors",
                pathname === link.href ? "text-primary" : "text-foreground",
              )}
            >
              {link.name}
            </Link>
          ))}
          {/* Optionally, you could also add the ThemeToggle inside the mobile menu */}
          <ThemeToggle />
        </div>
      )}
    </nav>
  );
}
