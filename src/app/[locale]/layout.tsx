import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider, themeInitScript } from "~/context/ThemeContext";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "~/i18n/routing";
import { ogLocale } from "~/server/public-metadata";

// Determine the base URL for your application
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"; // Ensure this is set in your .env.local for production

// MODIFIED: generateMetadata function to await params
export async function generateMetadata({
  params, // Receive params as a whole
}: {
  params: Promise<{ locale: string }>; // MODIFIED: Explicitly type params as a Promise
}): Promise<Metadata> {
  const { locale } = await params; // MODIFIED: Await params before destructuring locale
  // The fallback for pages without their own description (sign-up and the
  // like): the home page's, so previews say the same thing as Google does.
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
    namespace: "HomePage",
  });

  return {
    metadataBase: new URL(APP_BASE_URL), // ADDED: metadataBase property here
    title: "Menupedia",
    description: t("metaDescription"),
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: APP_BASE_URL,
      siteName: "Menupedia",
      images: [
        {
          url: `${APP_BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Menupedia: every seat reads your menu in their language",
        },
      ],
      locale: ogLocale(locale),
      type: "website",
    },
  };
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

// One build per language, so pages that don't depend on the visitor (About,
// Features, KVKK) are rendered once and served from the cache.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
  setRequestLocale(locale);
  // Only what every page needs. Sign-in (Clerk), the site navbar, upload
  // setup and the full set of translations live in (site)/layout.tsx, so
  // public menu pages, the ones guests open from a QR code, don't load them.
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${geist.variable}`}
      // themeInitScript adds the "dark" class before React hydrates
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
