// src/components/shared/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/shared/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion"; // ADDED: Import motion and AnimatePresence

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Restaurants", href: "/restaurants" },
    { name: "Themes", href: "/themes" },
    { name: "About Us", href: "/about" },
  ];

  // Variants for menu animation
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.05, color: "var(--color-primary)" }, // Use CSS variable for hover color
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -100 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
  };

  return (
    // ADDED: motion.nav for a subtle slide-down and fade-in effect
    <motion.nav
      initial={{ opacity: 0, y: -20 }} // Starts invisible and slightly above
      animate={{ opacity: 1, y: 0 }} // Animates to visible and original position
      transition={{ duration: 0.5 }} // Smooth animation
      className="bg-card sticky top-0 z-50 w-full p-4 shadow-md"
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Left Side: Website Logo (linked to Home) */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-primary text-2xl font-bold">Menu Hub</span>
        </Link>

        {/* Right Side: Desktop Navigation Links and Theme Toggle */}
        <div className="flex items-center space-x-6">
          {/* Desktop Navigation Links */}
          <div className="hidden items-center space-x-6 md:flex">
            {navLinks.map((link, index) => (
              <motion.a // CHANGED: Link to motion.a for hover/tap effects
                key={link.name}
                href={link.href}
                variants={navItemVariants} // Apply variants
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: index * 0.05, duration: 0.3 }} // Staggered delay
                className={cn(
                  "text-lg font-medium transition-colors", // transition-colors is still useful for Tailwind's direct color changes
                  pathname === link.href ? "text-primary" : "text-foreground",
                  "cursor-pointer", // Ensure cursor is pointer
                )}
              >
                {link.name}
              </motion.a>
            ))}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile Menu Button (Hamburger) */}
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
      {/* ADDED: AnimatePresence for exit animations */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit" // ADDED: exit state for AnimatePresence
            transition={{ duration: 0.3 }}
            className="bg-background fixed inset-0 z-40 flex flex-col items-center justify-center space-y-8 py-10 md:hidden"
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-foreground hover:text-primary focus:ring-primary absolute top-4 right-4 rounded-md p-2 focus:ring-2 focus:outline-none"
              aria-label="Close mobile menu"
            >
              <X className="h-8 w-8" />
            </button>

            {navLinks.map(
              (
                link,
                index, // ADDED: index for staggered animation
              ) => (
                <motion.a // CHANGED: Link to motion.a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  variants={navItemVariants} // Use same variants
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.3 }} // Staggered delay + slight overall delay for mobile links
                  className={cn(
                    "text-3xl font-semibold transition-colors",
                    pathname === link.href ? "text-primary" : "text-foreground",
                    "cursor-pointer",
                  )}
                >
                  {link.name}
                </motion.a>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
