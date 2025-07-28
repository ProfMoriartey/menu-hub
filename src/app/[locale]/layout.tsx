import "~/styles/globals.css";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

import { ourFileRouter } from "~/app/api/uploadthing/core";

import { type Metadata } from "next";

import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import { LayoutWrapper } from "~/components/layout/LayoutWrapper";
import { ThemeProvider } from "~/context/ThemeContext";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "~/i18n/routing";
import MouseTracker from "~/components/visuals/MouseTracker";

export const metadata: Metadata = {
  title: "Menupedia",
  description: "Your destination for the world's greatest menus",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <ClerkProvider>
      <html lang={locale} className={`${geist.variable}`}>
        <body>
          <NextIntlClientProvider>
            <NextSSRPlugin
              /**
               * The `extractRouterConfig` will extract **only** the route configs
               * from the router to prevent additional information from being
               * leaked to the client. The data passed to the client is the same
               * as if you were to fetch `/api/uploadthing` directly.
               */
              routerConfig={extractRouterConfig(ourFileRouter)}
            />

            <ThemeProvider>
              <LayoutWrapper>
                {children}
                <MouseTracker />
              </LayoutWrapper>
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
