import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import Link from "next/link"; // Ensure Link is imported if needed for navigation

import {
  assignRestaurantToUser,
  revokeRestaurantAccess,
} from "~/app/[locale]/admin/actions";

interface UserPanelProps {
  params: Promise<{ userId: string }>;
}

export const metadata: Metadata = {
  title: "Admin: Assign Restaurants",
  description: "View and manage which restaurants this specific user can edit.",
};

/**
 * Admin Panel: Displays all restaurants linked to the user specified in the URL.
 */
export default async function UserAssignmentPanel({ params }: UserPanelProps) {
  const { userId: targetUserId } = await params;

  // 1. Fetch the target user's records and their CURRENT assigned restaurants
  const targetUserWithAssignments = await db.query.users.findFirst({
    where: eq(schema.users.id, targetUserId),
    with: {
      usersToRestaurants: {
        with: {
          restaurant: {
            columns: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (!targetUserWithAssignments) {
    return notFound();
  }

  // 2. Fetch ALL restaurants to populate the dropdown/form for new assignments
  const allRestaurants = await db.query.restaurants.findMany({
    columns: { id: true, name: true, slug: true },
    orderBy: [schema.restaurants.name],
  });

  const assignedRestaurants = targetUserWithAssignments.usersToRestaurants.map(
    (link) => ({
      ...link.restaurant,
      accessLevel: link.accessLevel, // Include the access level from the junction table
    }),
  );

  const assignedRestaurantIds = new Set(assignedRestaurants.map((r) => r.id));

  // Identify restaurants that are available for assignment
  const availableRestaurants = allRestaurants.filter(
    (r) => !assignedRestaurantIds.has(r.id),
  );

  const targetUserEmail = targetUserWithAssignments.email ?? targetUserId;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Theme Fix: bg-white -> bg-card, text-gray-900 -> text-foreground */}
      <header className="bg-card border-border mb-10 rounded-lg border p-6 shadow-md">
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
          Restaurant Assignment Panel
        </h1>
        {/* Theme Fix: text-gray-600 -> text-muted-foreground, text-indigo-600 -> text-primary */}
        <p className="text-muted-foreground mt-2 text-lg">
          Managing access for:{" "}
          <span className="text-primary font-semibold">{targetUserEmail}</span>
        </p>
      </header>

      {/* SECTION: Current Assignments */}
      <section className="mb-12 space-y-6">
        <h2 className="text-foreground text-2xl font-semibold">
          {/* Theme Fix: text-gray-800 -> text-foreground */}
          Current Assignments ({assignedRestaurants.length})
        </h2>
        {/* Theme Fix: bg-white -> bg-card */}
        <div className="bg-card border-border rounded-xl border shadow-lg">
          {/* Theme Fix: divide-gray-100 -> divide-border */}
          <ul role="list" className="divide-border divide-y">
            {assignedRestaurants.length === 0 ? (
              <li className="text-muted-foreground px-6 py-4">
                {/* Theme Fix: text-gray-500 -> text-muted-foreground */}
                This user currently manages no restaurants.
              </li>
            ) : (
              assignedRestaurants.map((restaurant) => (
                <li
                  key={restaurant.id}
                  // Theme Fix: hover:bg-gray-50 -> hover:bg-accent/20
                  className="hover:bg-accent/20 flex items-center justify-between px-6 py-4 transition duration-150"
                >
                  <div className="min-w-0 flex-auto">
                    <p className="text-foreground text-lg leading-6 font-semibold">
                      {/* Theme Fix: text-gray-900 -> text-foreground */}
                      {restaurant.name}
                    </p>
                    <p className="text-muted-foreground mt-1 flex text-sm leading-5">
                      {/* Theme Fix: text-gray-500 -> text-muted-foreground */}
                      Slug:{" "}
                      <span className="ml-1 font-mono text-xs">
                        {restaurant.slug}
                      </span>
                    </p>
                  </div>
                  <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                    <p className="text-primary text-sm leading-6">
                      {/* Theme Fix: text-indigo-600 -> text-primary */}
                      Role:{" "}
                      <span className="font-medium capitalize">
                        {restaurant.accessLevel}
                      </span>
                    </p>
                  </div>
                  {/* Action Button for Admin */}
                  <form className="ml-4" action={revokeRestaurantAccess}>
                    <input
                      type="hidden"
                      name="clerkUserId"
                      value={targetUserId}
                    />
                    <input
                      type="hidden"
                      name="restaurantId"
                      value={restaurant.id}
                    />
                    <button
                      type="submit"
                      // Theme Fix: bg-red-500/600 -> bg-destructive
                      className="bg-destructive text-primary-foreground hover:bg-destructive/90 rounded-lg px-3 py-1 text-sm font-medium shadow-sm transition duration-150"
                    >
                      Revoke
                    </button>
                  </form>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      {/* SECTION: Assign New Restaurant Form */}
      <section className="border-border bg-card mt-12 rounded-xl border border-dashed p-6 shadow-md">
        {/* Theme Fix: border-gray-300 -> border-border, bg-white -> bg-card */}
        <h2 className="text-foreground mb-4 text-xl font-semibold">
          {/* Theme Fix: text-gray-800 -> text-foreground */}
          Assign New Restaurant
        </h2>

        {availableRestaurants.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {/* Theme Fix: text-gray-500 -> text-muted-foreground */}
            All available restaurants have been assigned to this user.
          </p>
        ) : (
          <form
            method="POST"
            action={assignRestaurantToUser}
            className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
          >
            <input type="hidden" name="clerkUserId" value={targetUserId} />
            <select
              name="restaurantId"
              required
              // Theme Fix: Generic colors replaced with theme tokens
              className="border-input text-primary-foreground focus:border-primary focus:ring-primary bg-background flex-grow rounded-md border p-2 shadow-sm"
            >
              <option value="" disabled>
                Select a restaurant to assign
              </option>
              {availableRestaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.slug})
                </option>
              ))}
            </select>

            <button
              type="submit"
              // Theme Fix: bg-indigo-600/700 -> bg-primary
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition duration-150"
            >
              Assign Restaurant
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
