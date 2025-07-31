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

// Determine the base URL for your application
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"; // Ensure this is set in your .env.local for production

// MODIFIED: generateMetadata function to await params
export async function generateMetadata({
  params, // Receive params as a whole
}: {
  params: Promise<{ locale: string }>; // MODIFIED: Explicitly type params as a Promise
}): Promise<Metadata> {
  const { locale } = await params; // MODIFIED: Await params before destructuring locale

  const ogLocale = locale.replace("-", "_"); // Converts 'en-US' to 'en_US' if necessary

  return {
    metadataBase: new URL(APP_BASE_URL), // ADDED: metadataBase property here
    title: "Menupedia",
    description: "The Smart Way to Share Menus",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
    openGraph: {
      title: "Menupedia",
      description: "The Smart Way to Share Menus",
      url: APP_BASE_URL,
      siteName: "Menupedia",
      images: [
        {
          url: `${APP_BASE_URL}/menupedia1.png`,
          width: 1000,
          height: 1000,
          alt: "Menupedia Logo and Slogan",
        },
      ],
      locale: ogLocale,
      type: "website",
    },
    // twitter: {
    //   card: "summary_large_image",
    //   title: "Menupedia",
    //   description: "The Smart Way to Share Menus",
    //   creator: "@yourtwitterhandle",
    //   images: [`${APP_BASE_URL}/menupedia1.png`],
    // },
  };
}

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
  const { locale } = await params; // This awaiting of params is correct for the component props
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <ClerkProvider>
      <html lang={locale} className={`${geist.variable}`}>
        <body>
          <NextIntlClientProvider>
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />

            <ThemeProvider>
              <LayoutWrapper>
                {children}
                {/* <MouseTracker /> */}
              </LayoutWrapper>
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
