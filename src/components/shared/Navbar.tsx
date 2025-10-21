// src/components/shared/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "~/i18n/navigation";
import { useState, useTransition } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/shared/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import AuthNavButtons from "~/components/layout/AuthNavButtons"; // Assuming this path

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations("navbar");

  const locales = ["en", "tr", "ar", "es", "ru"];

  const navLinks = [
    { name: t("home"), href: "/" },
    { name: t("restaurants"), href: "/restaurants" },
    { name: t("themes"), href: "/themes" },
    { name: t("aboutUs"), href: "/about" },
  ];

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.05, color: "var(--color-primary)" },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -100 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
  };

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card sticky top-0 z-50 w-full rounded-lg p-4 shadow-md"
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Left Side: Website Logo (Always Visible) */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/menupedia-logo.png"
            alt="Menupedia Logo"
            width={240}
            height={64}
            className="h-8 w-auto md:h-12"
          />
        </Link>

        {/* Right Side: Controls */}
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* 1. Desktop Navigation Links (HIDDEN ON MOBILE) */}
          <div className="hidden items-center space-x-6 md:flex">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={cn(
                  "text-lg font-medium transition-colors",
                  pathname === link.href ? "text-primary" : "text-foreground",
                  "cursor-pointer",
                )}
              >
                {link.name}
              </motion.a>
            ))}
          </div>

          {/* 2. Language Toggle (HIDDEN ON MOBILE) */}
          <div className="hidden items-center gap-2 md:flex">
            <label htmlFor="language-select" className="sr-only">
              {t("language")}
            </label>
            <select
              id="language-select"
              defaultValue={currentLocale}
              onChange={(e) => handleLocaleChange(e.target.value)}
              disabled={isPending}
              className={cn(
                "bg-card text-foreground border-input rounded-md border px-2 py-1",
                "focus:ring-primary focus:border-primary focus:outline-none",
                "cursor-pointer",
              )}
            >
              {locales.map((locale) => (
                <option key={locale} value={locale}>
                  {locale.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Theme Toggle (ALWAYS VISIBLE - Desktop & Mobile) */}
          <ThemeToggle />

          {/* 4. Auth/Dashboard Button (ALWAYS VISIBLE) */}
          {/* 5. User Profile Button (HIDDEN ON MOBILE to save space) */}
          <SignedOut>
            <AuthNavButtons />
          </SignedOut>

          <SignedIn>
            <div className="flex items-center space-x-4">
              <AuthNavButtons />
              <div className="hidden md:block">
                {" "}
                {/* Hide UserButton on mobile */}
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </SignedIn>

          {/* 6. Mobile Menu Button (Hamburger) (MOBILE ONLY) */}
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
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

            {/* Nav Links in Mobile Menu */}
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: index * 0.05 + 0.2, duration: 0.3 }}
                className={cn(
                  "text-3xl font-semibold transition-colors",
                  pathname === link.href ? "text-primary" : "text-foreground",
                  "cursor-pointer",
                )}
              >
                {link.name}
              </motion.a>
            ))}

            {/* Language Toggle in Mobile Menu (Moved here from main navbar row) */}
            <div className="mt-8 flex items-center gap-2">
              <label htmlFor="mobile-language-select" className="sr-only">
                {t("language")}
              </label>
              <select
                id="mobile-language-select"
                defaultValue={currentLocale}
                onChange={(e) => handleLocaleChange(e.target.value)}
                disabled={isPending}
                className={cn(
                  "bg-card text-foreground border-input rounded-md border px-4 py-2 text-xl",
                  "focus:ring-primary focus:border-primary focus:outline-none",
                  "cursor-pointer",
                )}
              >
                {locales.map((locale) => (
                  <option key={locale} value={locale}>
                    {locale.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile Button in Mobile Menu (Visible here) */}
            <SignedIn>
              <UserButton />
            </SignedIn>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
