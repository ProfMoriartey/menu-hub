// src/components/shared/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Link, usePathname } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { ThemeToggle } from "~/components/shared/ThemeToggle";
import { LanguageSwitcher } from "~/components/shared/LanguageSwitcher";
import { cn } from "~/lib/utils";

// The home page's contact band; restaurants join by getting in touch.
export const CONTACT_HREF = "/#contact";

/**
 * The site bar on the marketing pages: logo (home), the main pages, then
 * language, theme and the account. Signed out, restaurants see "Get in
 * touch"; signed in, "Dashboard". On phones the links, language and
 * account move into a panel under the bar.
 */
export function Navbar() {
  const t = useTranslations("navbar");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { name: t("restaurants"), href: "/menus" },
    { name: t("themes"), href: "/features" },
    { name: t("pricing"), href: "/#pricing" },
    { name: t("aboutUs"), href: "/about" },
  ];
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Close the panel on navigation, and keep the page still while it's open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="border-border bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-50 border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-2 px-4">
        <Link href="/" className="me-4 flex shrink-0 items-center" aria-label={t("home")}>
          <Image
            src="/menupedia-logo.png"
            alt="Menupedia"
            width={240}
            height={64}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav aria-label={t("mainNav")} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isCurrent(link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    isCurrent(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          <LanguageSwitcher compact className="hidden border-transparent shadow-none md:flex" />
          {/* On small phones it moves into the panel, to leave room. */}
          <div className="hidden sm:flex">
            <ThemeToggle />
          </div>

          <SignedOut>
            <SignInButton mode="modal" signUpFallbackRedirectUrl="/dashboard">
              <Button variant="ghost" className="hidden md:inline-flex">
                {t("signIn")}
              </Button>
            </SignInButton>
            <Button asChild className="ms-1 rounded-full">
              {/* Sign up first, then the dashboard (to create the restaurant). */}
              <Link href="/sign-in?redirect_url=%2Fdashboard">{t("getStarted")}</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild className="ms-1 rounded-full">
              <Link href="/dashboard">{t("dashboard")}</Link>
            </Button>
            <div className="ms-1 hidden md:flex">
              <UserButton />
            </div>
          </SignedIn>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="hover:bg-muted ms-1 flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            aria-controls="site-menu"
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <>
          {/* Tapping outside the panel closes it. */}
          <div
            className="fixed inset-x-0 top-16 bottom-0 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            id="site-menu"
            className="border-border bg-background animate-in slide-in-from-top-2 fade-in-0 absolute inset-x-0 top-full border-b shadow-lg md:hidden"
          >
            <nav aria-label={t("mainNav")} className="container mx-auto px-4 py-3">
              <ul className="space-y-1">
                {[{ name: t("home"), href: "/" }, ...links].map((link) => {
                  const current = link.href === "/" ? pathname === "/" : isCurrent(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "block rounded-xl px-4 py-3 text-base font-medium",
                          current ? "bg-primary/10 text-primary" : "hover:bg-muted",
                        )}
                      >
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="border-border container mx-auto flex items-center gap-2 border-t px-4 py-4">
              <LanguageSwitcher />
              <div className="sm:hidden">
                <ThemeToggle />
              </div>
              <div className="flex-1" />
              <SignedOut>
                <SignInButton mode="modal" signUpFallbackRedirectUrl="/dashboard">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    {t("signIn")}
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
