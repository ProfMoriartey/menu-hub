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

// Sign-in screens in Menupedia's colours. The primary is the darker brand
// orange that keeps white button text readable (see --primary in globals.css).
const clerkAppearance = {
  variables: {
    colorPrimary: "#a0611a",
    borderRadius: "0.625rem",
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
};

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
