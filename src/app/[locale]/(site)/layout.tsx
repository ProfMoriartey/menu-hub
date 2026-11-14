// src/app/[locale]/(site)/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { arSA } from "@clerk/localizations/ar-SA";
import { enUS } from "@clerk/localizations/en-US";
import { esES } from "@clerk/localizations/es-ES";
import { ruRU } from "@clerk/localizations/ru-RU";
import { trTR } from "@clerk/localizations/tr-TR";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { ourFileRouter } from "~/app/api/uploadthing/core";
import { LayoutWrapper } from "~/components/layout/LayoutWrapper";

// Clerk's translations miss the title of the combined sign-in/sign-up
// screen in some languages, which then shows in English.
const withTitle = <L extends typeof enUS>(
  base: L,
  titleCombined: string,
): L => ({
  ...base,
  signIn: {
    ...base.signIn,
    start: { ...base.signIn?.start, titleCombined },
  },
});

// Clerk's sign-in screens in the page's language.
const clerkLocalizations = {
  ar: withTitle(arSA, "المتابعة إلى {{applicationName}}"),
  en: enUS,
  es: withTitle(esES, "Continuar en {{applicationName}}"),
  ru: ruRU,
  tr: withTitle(trTR, "{{applicationName}} ile devam edin"),
};

// Sign-in screens in The Table's colours (DESIGN.md): the card is see-through
// so it sits on the porcelain plate of the sign-in page; the primary is cloth
// red (white text 10:1), focus is brass-ink (5.7:1 on porcelain), the font is
// the brand font (falls back to Geist where the widget renders outside the
// world, e.g. a portal).
type Appearance = NonNullable<React.ComponentProps<typeof ClerkProvider>["appearance"]>;
const FOCUS = "3px solid #7d5f17";
const clerkAppearance = {
  variables: {
    colorPrimary: "#7a1f2b",
    colorTextOnPrimaryBackground: "#ffffff",
    colorText: "#221a17",
    colorTextSecondary: "#5a4f4a",
    colorBackground: "#fbfaf7",
    colorInputBackground: "#ffffff",
    colorInputText: "#221a17",
    colorNeutral: "#221a17",
    colorDanger: "#c42318",
    borderRadius: "0.75rem",
    fontFamily: "var(--table-font, var(--font-geist-sans)), system-ui, sans-serif",
  },
  elements: {
    // Fill the plate, so a 320 px screen never scrolls sideways.
    rootBox: { width: "100%" },
    cardBox: { width: "100%", maxWidth: "100%", boxShadow: "none", background: "transparent", border: "none" },
    card: { boxShadow: "none", background: "transparent", border: "none" },
    formButtonPrimary: {
      borderRadius: "9999px",
      minHeight: "2.75rem",
      fontWeight: 700,
      "&:focus-visible": { outline: FOCUS, outlineOffset: "3px", boxShadow: "none" },
    },
    formFieldInput: {
      minHeight: "2.75rem",
      "&:focus": { outline: FOCUS, outlineOffset: "1px", boxShadow: "none" },
    },
    socialButtonsBlockButton: {
      minHeight: "2.75rem",
      "&:focus-visible": { outline: FOCUS, outlineOffset: "2px", boxShadow: "none" },
    },
    footerActionLink: {
      color: "#7a1f2b",
      fontWeight: 700,
      "&:focus-visible": { outline: FOCUS, outlineOffset: "2px", boxShadow: "none" },
    },
  },
} satisfies Appearance;

/**
 * Everything except the public restaurant pages: home, restaurants list,
 * about, themes, sign-in, the dashboard and the admin panel. These need
 * sign-in in the browser (Clerk), the site navbar, upload setup and the full
 * set of translations. Route groups don't change URLs.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ClerkProvider
      localization={
        clerkLocalizations[locale as keyof typeof clerkLocalizations] ?? enUS
      }
      appearance={clerkAppearance}
    >
      <NextIntlClientProvider>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <LayoutWrapper>{children}</LayoutWrapper>
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}
