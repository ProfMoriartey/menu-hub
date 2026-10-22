// app/[locale]/(app)/dashboard/[restaurantSlug]/edit/layout.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { isSystemAdmin } from "~/app/actions/auth";

interface DynamicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ restaurantSlug: string }>;
}

/**
 * Resource Edit Layout: Enforces Resource-Based Access Control (ABAC).
 * 1. Checks Authentication.
 * 2. Checks if the logged-in user is assigned to the restaurant specified by the slug.
 */
export default async function ResourceEditLayout({
  children,
  params,
}: DynamicLayoutProps) {
  const { userId } = await auth();
  const { restaurantSlug: restaurantSlug } = await params;

  // --- 1. Authentication Check ---
  if (!userId) {
    // Force sign-in if unauthenticated
    return redirect("/sign-in");
  }

  // --- 2. Resource-Based Authorization Check (ABAC) ---

  // Find the restaurant by slug together with this user's link to it (if any).
  const authorizedRestaurant = await db.query.restaurants.findFirst({
    where: eq(schema.restaurants.slug, restaurantSlug),
    columns: { id: true },
    with: {
      usersToRestaurants: {
        where: eq(schema.usersToRestaurants.userId, userId),
        columns: { userId: true },
        limit: 1, // We only need to know if the link exists
      },
    },
  });

  // A. Check if the restaurant exists
  if (!authorizedRestaurant) {
    return notFound();
  }

  // B. Assigned users and system admins may edit; the server actions apply
  // the same rule through checkAuthorization().
  const hasAccess =
    authorizedRestaurant.usersToRestaurants.length > 0 ||
    (await isSystemAdmin());

  if (!hasAccess) {
    // User is authenticated but does not have permission for this restaurant
    return redirect("/dashboard");
  }

  // If checks pass, render the child route (edit/page.tsx), which loads its own data.

  return <>{children}</>;
}
