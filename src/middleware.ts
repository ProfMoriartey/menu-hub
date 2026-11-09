// middleware.ts

import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";
import { routing } from "./i18n/routing";

const nextIntlMiddleware = createMiddleware(routing);

/**
 * Paths with no language prefix and no sign-in: /r/ is the permanent menu
 * link in QR codes (app/r); sitemap.xml, robots.txt and llms.txt live at the
 * root, where crawlers look.
 */
function isRootPublicRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/r/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/llms.txt"
  );
}

/** API routes skip localization but keep Clerk (uploads check who is asking). */
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api") || pathname.startsWith("/trpc");
}

// First segments after the locale that belong to the site, not to a restaurant.
const SITE_SEGMENTS = new Set([
  "about",
  "admin",
  "dashboard",
  "faq",
  "features",
  "invite",
  "kvkk",
  "menus",
  "multilingual-menu",
  "pricing",
  "sign-in",
  "start",
]);

/**
 * A guest's menu page: /{locale}/{restaurant}/... These never ask who the
 * visitor is, so they skip Clerk: without this, a guest's first visit is sent
 * through Clerk's handshake redirects before the menu shows. Two exceptions
 * need Clerk: the dashboard's preview link (/preview) and a preview in draft
 * mode (it checks the visitor can manage the menu).
 */
function isGuestMenuRoute(req: NextRequest): boolean {
  const [locale, first, ...rest] = req.nextUrl.pathname
    .split("/")
    .filter(Boolean);
  if (!locale || !first) return false;
  if (!(routing.locales as readonly string[]).includes(locale)) return false;
  if (SITE_SEGMENTS.has(first)) return false;
  if (rest.at(-1) === "preview") return false;
  return !req.cookies.has("__prerender_bypass");
}

const withClerk = clerkMiddleware((_auth, req) => {
  if (isApiRoute(req.nextUrl.pathname)) return NextResponse.next();
  return nextIntlMiddleware(req);
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  if (isRootPublicRoute(pathname)) return NextResponse.next();
  if (isGuestMenuRoute(req)) return nextIntlMiddleware(req);
  return withClerk(req, event);
}

export const config = {
  matcher: [
    // Everything except Next.js internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
