// app/[locale]/(client)/dashboard/[restaurantSlug]/layout.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "~/i18n/navigation";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { getRestaurantRole } from "~/app/actions/auth";

interface DynamicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ restaurantSlug: string }>;
}

/**
 * Every page under /dashboard/[restaurantSlug] (menu, details) requires the
 * signed-in user to be assigned to the restaurant, or to be a system admin.
 * The server actions apply the same rule through checkAuthorization().
 */
export default async function RestaurantDashboardLayout({
  children,
  params,
}: DynamicLayoutProps) {
  const { userId } = await auth();
  const { restaurantSlug } = await params;

  if (!userId) {
    return redirect({ href: "/sign-in", locale: await getLocale() });
  }

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(schema.restaurants.slug, restaurantSlug),
    columns: { id: true },
  });

  if (!restaurant) {
    return notFound();
  }

  if (!(await getRestaurantRole(restaurant.id))) {
    // Signed in, but not allowed to manage this restaurant.
    return redirect({ href: "/dashboard", locale: await getLocale() });
  }

  // No padding when printing, so a table card sheet lines up with the paper.
  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 print:max-w-none print:p-0">{children}</div>;
}
