// src/app/[locale]/(site)/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { ourFileRouter } from "~/app/api/uploadthing/core";
import { LayoutWrapper } from "~/components/layout/LayoutWrapper";

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
  setRequestLocale((await params).locale);
  return (
    <ClerkProvider>
      <NextIntlClientProvider>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <LayoutWrapper>{children}</LayoutWrapper>
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}
