import "~/styles/globals.css";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

import { ourFileRouter } from "~/app/api/uploadthing/core";

import { type Metadata } from "next";

import {
  ClerkProvider,
  // SignInButton,
  // SignUpButton,
  // SignedIn,
  // SignedOut,
  // UserButton,
} from "@clerk/nextjs";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "Menu Hub",
  description: "Your destination for the world's greatest menus",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable}`}>
        <body>
          {/* <header className="flex h-16 items-center justify-end gap-4 p-4">
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="h-10 cursor-pointer rounded-full bg-[#6c47ff] px-4 text-sm font-medium text-white sm:h-12 sm:px-5 sm:text-base">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header> */}
          <NextSSRPlugin
            /**
             * The `extractRouterConfig` will extract **only** the route configs
             * from the router to prevent additional information from being
             * leaked to the client. The data passed to the client is the same
             * as if you were to fetch `/api/uploadthing` directly.
             */
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
