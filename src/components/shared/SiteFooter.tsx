// src/components/shared/SiteFooter.tsx
"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Mail, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Link } from "~/i18n/navigation";
import { LanguageSwitcher } from "~/components/shared/LanguageSwitcher";
import { CONTACT_HREF } from "~/components/shared/Navbar";
import { CONTACT_EMAIL, whatsappLink } from "~/lib/site-contact";

const linkClass = "text-muted-foreground hover:text-foreground text-sm transition-colors";

/** The footer of the marketing pages: what Menupedia is, links, contact. */
export function SiteFooter() {
  const t = useTranslations("Footer");
  const tContact = useTranslations("featuresPage.contact");

  return (
    <footer className="border-border bg-card border-t">
      <div className="container mx-auto grid gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Link href="/" className="inline-flex" aria-label={t("home")}>
            <Image src="/menupedia-logo.png" alt="Menupedia" width={240} height={64} className="h-8 w-auto" />
          </Link>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">{t("tagline")}</p>
        </div>

        <FooterColumn title={t("product")}>
          <li>
            <Link href="/menus" className={linkClass}>
              {t("menus")}
            </Link>
          </li>
          <li>
            <Link href="/features" className={linkClass}>
              {t("features")}
            </Link>
          </li>
          <li>
            <Link href="/features#demo" className={linkClass}>
              {t("demo")}
            </Link>
          </li>
        </FooterColumn>

        <FooterColumn title={t("company")}>
          <li>
            <Link href="/about" className={linkClass}>
              {t("about")}
            </Link>
          </li>
          <li>
            <Link href={CONTACT_HREF} className={linkClass}>
              {t("contact")}
            </Link>
          </li>
        </FooterColumn>

        <FooterColumn title={t("forRestaurants")}>
          <li>
            <a href={`mailto:${CONTACT_EMAIL}`} className={`${linkClass} inline-flex items-center gap-2`}>
              <Mail className="h-4 w-4 shrink-0" aria-hidden /> {t("email")}
            </a>
          </li>
          <li>
            <a
              href={whatsappLink(tContact("whatsappMessage"))}
              target="_blank"
              rel="noreferrer"
              className={`${linkClass} inline-flex items-center gap-2`}
            >
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden /> WhatsApp
            </a>
          </li>
          <li>
            <SignedOut>
              <SignInButton mode="modal">
                <button type="button" className={linkClass}>
                  {t("signIn")}
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className={linkClass}>
                {t("dashboard")}
              </Link>
            </SignedIn>
          </li>
        </FooterColumn>
      </div>

      <div className="border-border border-t">
        <div className="container mx-auto flex flex-col-reverse items-center justify-between gap-4 px-4 py-5 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            {t("rights", { year: new Date().getFullYear() })}
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}
