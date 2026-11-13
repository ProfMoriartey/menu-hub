// src/components/shared/SiteFooter.tsx
"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import Image from "next/image";
import { Facebook, Instagram, Mail, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Link } from "~/i18n/navigation";
import { Cloth } from "~/components/table/Cloth";
import { LanguageSwitcher } from "~/components/shared/LanguageSwitcher";
import { CONTACT_HREF } from "~/components/shared/Navbar";
import { CONTACT_EMAIL, SOCIAL_PROFILES, whatsappLink } from "~/lib/site-contact";

const linkClass =
  "text-on-cloth-muted hover:text-on-cloth flex min-h-11 items-center text-[0.9375rem] underline-offset-4 transition-colors hover:underline";

/** The X (Twitter) logo, which the icon set doesn't have. */
function XLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Each social page that's filled in (lib/site-contact), with its icon.
// Brand names stay untranslated.
const SOCIAL_LINKS: { url: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { url: SOCIAL_PROFILES.instagram, label: "Instagram", Icon: Instagram },
  { url: SOCIAL_PROFILES.facebook, label: "Facebook", Icon: Facebook },
  { url: SOCIAL_PROFILES.x, label: "X", Icon: XLogo },
].filter((link) => link.url);

/** The footer of the marketing pages: what Menupedia is, links, contact. */
export function SiteFooter() {
  const t = useTranslations("Footer");
  const tContact = useTranslations("featuresPage.contact");

  return (
    <Cloth as="footer" tone="deep">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Link href="/" className="inline-flex min-h-11 items-center" aria-label={t("home")}>
            <Image src="/brand/menupedia-wordmark-dark.svg" alt="Menupedia" width={469} height={100} unoptimized className="h-8 w-auto" />
          </Link>
          <p className="text-on-cloth-muted max-w-xs text-sm leading-relaxed">{t("tagline")}</p>
          {SOCIAL_LINKS.length > 0 && (
            <ul className="flex gap-1">
              {SOCIAL_LINKS.map(({ url, label, Icon }) => (
                <li key={label}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="text-on-cloth-muted hover:text-on-cloth hover:bg-on-cloth/10 flex size-11 items-center justify-center rounded-full border border-white/25 transition-colors"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          )}
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
            <Link href="/pricing" className={linkClass}>
              {t("pricing")}
            </Link>
          </li>
          <li>
            <Link href="/multilingual-menu" className={linkClass}>
              {t("multilingual")}
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
            <Link href="/faq" className={linkClass}>
              {t("faq")}
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
            <a href={`mailto:${CONTACT_EMAIL}`} className={`${linkClass} gap-2`}>
              <Mail className="h-4 w-4 shrink-0" aria-hidden /> {t("email")}
            </a>
          </li>
          <li>
            <a
              href={whatsappLink(tContact("whatsappMessage"))}
              target="_blank"
              rel="noreferrer"
              className={`${linkClass} gap-2`}
            >
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden /> WhatsApp
            </a>
          </li>
          <li>
            <SignedOut>
              <Link href="/sign-in" className={linkClass}>
                {t("signIn")}
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className={linkClass}>
                {t("dashboard")}
              </Link>
            </SignedIn>
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-on-cloth-muted flex flex-wrap items-center gap-x-4 text-sm">
            <p>{t("rights", { year: new Date().getFullYear() })}</p>
            <Link href="/kvkk" className="hover:text-on-cloth flex min-h-11 items-center underline underline-offset-4">
              {t("kvkk")}
            </Link>
          </div>
          <LanguageSwitcher variant="cards" />
        </div>
      </div>
    </Cloth>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-on-cloth text-sm font-bold tracking-wide uppercase">{title}</h2>
      <ul className="mt-2">{children}</ul>
    </div>
  );
}
