// src/components/shared/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Link, usePathname } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Cloth } from "~/components/table/Cloth";
import { tableFontVariables } from "~/components/table/fonts";
import { ThemeToggle } from "~/components/shared/ThemeToggle";
import { LanguageSwitcher } from "~/components/shared/LanguageSwitcher";
import { cn } from "~/lib/utils";

// The home page's contact band; restaurants join by getting in touch.
export const CONTACT_HREF = "/#contact";

// Sign up first, then the dashboard (to create the restaurant).
const START_HREF = "/sign-in?redirect_url=%2Fdashboard";

/**
 * The site bar on the public pages, slim, on the cloth: wordmark, the main
 * pages, language (a place card), theme, then the account. Signed out:
 * "Sign in" and "Start free"; signed in: "Dashboard" and the user button.
 * Below 1024 px the links, language and account move into a sheet on
 * porcelain (a dialog: focus stays inside, Escape closes). The sheet renders
 * in a portal, so it carries the world's own class.
 */
export function Navbar() {
  const t = useTranslations("navbar");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { name: t("themes"), href: "/features" },
    { name: t("exampleMenus"), href: "/menus" },
    { name: t("pricing"), href: "/pricing" },
  ];
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Close the sheet on navigation.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Cloth
      as="header"
      tone="deep"
      className="sticky top-0 z-50 border-b border-black/20 shadow-[0_6px_16px_rgb(20_4_8/0.25)]"
    >
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-2 px-4">
        <Link
          href="/"
          className="me-3 flex min-h-11 shrink-0 items-center"
          aria-label={t("home")}
        >
          {/* The wordmark stays left-to-right in Arabic too. */}
          <Image
            src="/brand/menupedia-wordmark-dark.svg"
            alt="Menupedia"
            width={469}
            height={100}
            unoptimized
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <nav aria-label={t("mainNav")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isCurrent(link.href) ? "page" : undefined}
                  className={cn(
                    "text-on-cloth-muted hover:text-on-cloth flex min-h-11 items-center rounded-full px-3.5 text-[0.9375rem] font-semibold underline-offset-8 transition-colors",
                    isCurrent(link.href) && "text-on-cloth decoration-brass underline decoration-2",
                  )}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1">
          <LanguageSwitcher variant="card" className="hidden lg:inline-flex" />
          <ThemeToggle quiet className="hidden lg:inline-flex" />

          <SignedOut>
            <Link
              href="/sign-in"
              className="text-on-cloth-muted hover:text-on-cloth hidden min-h-11 items-center rounded-full px-3.5 text-[0.9375rem] font-semibold transition-colors lg:flex"
            >
              {t("signIn")}
            </Link>
            <Button asChild variant="tableOnCloth" size="pill" className="ms-1 hidden sm:inline-flex">
              <Link href={START_HREF}>{t("startFree")}</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild variant="tableOnCloth" size="pill" className="ms-1">
              <Link href="/dashboard">{t("dashboard")}</Link>
            </Button>
            <div className="ms-1 hidden min-h-11 items-center lg:flex">
              <UserButton />
            </div>
          </SignedIn>

          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger
              className="text-on-cloth hover:bg-on-cloth/10 ms-1 flex size-11 items-center justify-center rounded-full lg:hidden"
              aria-label={t("openMenu")}
            >
              <Menu className="size-6" aria-hidden />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 lg:hidden" />
              <Dialog.Content
                aria-describedby={undefined}
                className={cn(
                  "table-world",
                  tableFontVariables,
                  "bg-plate text-ink data-[state=open]:animate-in data-[state=open]:slide-in-from-top-4 data-[state=open]:fade-in-0 fixed inset-x-0 top-0 z-50 max-h-dvh overflow-y-auto rounded-b-3xl shadow-[0_18px_40px_rgb(20_4_8/0.4)] outline-none lg:hidden",
                )}
              >
                <Dialog.Title className="sr-only">{t("menuTitle")}</Dialog.Title>
                <div className="flex min-h-16 items-center justify-between px-4">
                  <Link href="/" className="flex min-h-11 items-center" aria-label={t("home")}>
                    <Image
                      src="/brand/menupedia-wordmark.svg"
                      alt="Menupedia"
                      width={469}
                      height={100}
                      unoptimized
                      className="h-7 w-auto"
                    />
                  </Link>
                  <Dialog.Close
                    className="text-ink hover:bg-plate-rim flex size-11 items-center justify-center rounded-full"
                    aria-label={t("closeMenu")}
                  >
                    <X className="size-6" aria-hidden />
                  </Dialog.Close>
                </div>

                <nav aria-label={t("mainNav")} className="px-4">
                  <ul>
                    {links.map((link) => (
                      <li key={link.href} className="border-plate-rim border-t">
                        <Link
                          href={link.href}
                          aria-current={isCurrent(link.href) ? "page" : undefined}
                          className={cn(
                            "flex min-h-14 items-center text-xl font-bold",
                            isCurrent(link.href) && "text-cloth-ink",
                          )}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                    <SignedOut>
                      <li className="border-plate-rim border-t">
                        <Link href="/sign-in" className="flex min-h-14 items-center text-xl font-bold">
                          {t("signIn")}
                        </Link>
                      </li>
                    </SignedOut>
                  </ul>
                </nav>

                <div className="bg-cloth table-cloth mt-3 flex flex-col gap-5 rounded-t-3xl px-4 pt-6 pb-8">
                  <LanguageSwitcher variant="cards" />
                  <div className="flex items-center gap-3">
                    <SignedOut>
                      <Button asChild variant="tableOnCloth" size="pill" className="flex-1">
                        <Link href={START_HREF}>{t("startFree")}</Link>
                      </Button>
                    </SignedOut>
                    <SignedIn>
                      <UserButton />
                    </SignedIn>
                    <ThemeToggle quiet />
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </Cloth>
  );
}
