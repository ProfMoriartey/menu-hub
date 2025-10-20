// middleware.ts

import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server"; // Import NextResponse for skipping middleware
import { routing } from "./i18n/routing"; // Assuming this defines your locales

// Initialize next-intl middleware with your routing configuration
const nextIntlMiddleware = createMiddleware(routing);

/**
 * Function to check if a pathname should be excluded from localization.
 * We need to exclude API routes, webhooks, and tRPC endpoints.
 */
function isApiRoute(pathname: string): boolean {
  // Use .startsWith to check for /api/ and /trpc/ routes
  return pathname.startsWith("/api") || pathname.startsWith("/trpc");
}

export default clerkMiddleware((auth, req) => {
  const pathname = req.nextUrl.pathname;

  // 1. Check if the path is an API/Webhook route
  if (isApiRoute(pathname)) {
    // If it's an API route, skip next-intl and just proceed.
    // We explicitly return NextResponse.next() to prevent localization.
    return NextResponse.next();
  }

  // 2. For all other routes, apply Clerk authentication and then next-intl localization
  return nextIntlMiddleware(req);
});

export const config = {
  matcher: [
    // This matcher is still useful but its job is now streamlined by the logic above.
    // It should include all paths you want Clerk and next-intl to process (including /api and /trpc).
    // The conditional logic in the default export handles the exclusion.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

// import { clerkMiddleware } from "@clerk/nextjs/server";
// import createMiddleware from "next-intl/middleware";
// import { routing } from "./i18n/routing";

// const nextIntlMiddleware = createMiddleware(routing);

// export default clerkMiddleware((auth, req) => {
//   return nextIntlMiddleware(req);
// });

// export const config = {
//   matcher: [
//     // Match all pathnames except for Next.js internals and static files
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     // Always run for API and tRPC routes
//     "/(api|trpc)(.*)",
//   ],
// };

// Middleware for clerk
// import { clerkMiddleware } from "@clerk/nextjs/server";

// export default clerkMiddleware();

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     // Always run for API routes
//     "/(api|trpc)(.*)",
//   ],
// };

// Middleware for next-intl
// import createMiddleware from "next-intl/middleware";
// import { routing } from "./i18n/routing";

// export default createMiddleware(routing);

// export const config = {
//   // Match all pathnames except for
//   // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
//   // - … the ones containing a dot (e.g. `favicon.ico`)
//   matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
// };
