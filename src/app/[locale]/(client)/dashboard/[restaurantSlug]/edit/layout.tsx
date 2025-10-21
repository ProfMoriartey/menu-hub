// app/[locale]/(app)/dashboard/[restaurantSlug]/edit/layout.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { eq } from "drizzle-orm";

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

  // Find the restaurant by slug and check user permission in one query.
  // We query for a record in the junction table where both the slug and the userId match.
  const authorizedRestaurant = await db.query.restaurants.findFirst({
    where: eq(schema.restaurants.slug, restaurantSlug),
    with: {
      usersToRestaurants: {
        where: eq(schema.usersToRestaurants.userId, userId),
        limit: 1, // We only need to know if the link exists
      },
      categories: {
        with: {
          menuItems: true, // Fetch menu items for the page.tsx component
        },
      },
    },
  });

  // A. Check if the restaurant exists
  if (!authorizedRestaurant) {
    return notFound();
  }

  // B. Check if the user is linked to the restaurant (Authorization Fail)
  const hasAccess = authorizedRestaurant.usersToRestaurants.length > 0;

  // Optional: Global Admin Override
  // const { sessionClaims } = await auth();
  // const isAdmin = sessionClaims?.metadata?.role === "admin";
  // if (isAdmin) { hasAccess = true; }
  // NOTE: If you want global admins to access ALL, uncomment the above.

  if (!hasAccess) {
    // User is authenticated but does not have permission for this restaurant
    // Redirect to their main dashboard or a 403 access denied page
    return redirect("/dashboard");
  }

  // If checks pass, render the child route (edit/page.tsx)
  // We pass the full restaurant data (including nested categories/menuItems)
  // through the `children` using a pattern like React Context or by ensuring
  // the data is accessed via a separate fetch in the child, but since it's
  // already here, we can rely on React's automatic data serialization for now.

  return <>{children}</>;
}
