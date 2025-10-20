import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { type Metadata } from "next";

import { assignRestaurantToUser } from "~/app/[locale]/admin/actions";

interface UserPanelProps {
  params: Promise<{ userId: string }>;
}

export const metadata: Metadata = {
  title: "Admin: Assign Restaurants",
  description: "View and manage which restaurants this specific user can edit.",
};

/**
 * Admin Panel: Displays all restaurants linked to the user specified in the URL.
 * Also fetches ALL restaurants to populate the assignment form.
 * NOTE: This component assumes a parent layout has already enforced the 'admin' role check.
 */
export default async function UserAssignmentPanel({ params }: UserPanelProps) {
  const { userId: targetUserId } = await params;

  // 1. Fetch the target user's records and their CURRENT assigned restaurants
  const targetUserWithAssignments = await db.query.users.findFirst({
    where: eq(schema.users.id, targetUserId),
    with: {
      usersToRestaurants: {
        // Use relations to join through the junction table to the restaurants
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
    // If the target user ID from the URL does not exist in our DB table
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

  const targetUserEmail = targetUserWithAssignments.email || targetUserId;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 rounded-lg bg-white p-6 shadow-md">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Restaurant Assignment Panel
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Managing access for:{" "}
          <span className="font-semibold text-indigo-600">
            {targetUserEmail}
          </span>
        </p>
      </header>

      {/* SECTION: Current Assignments */}
      <section className="mb-12 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Current Assignments ({assignedRestaurants.length})
        </h2>
        <div className="rounded-xl bg-white shadow-lg">
          <ul role="list" className="divide-y divide-gray-100">
            {assignedRestaurants.length === 0 ? (
              <li className="px-6 py-4 text-gray-500">
                This user currently manages no restaurants.
              </li>
            ) : (
              assignedRestaurants.map((restaurant) => (
                <li
                  key={restaurant.id}
                  className="flex items-center justify-between px-6 py-4 transition duration-150 hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-auto">
                    <p className="text-lg leading-6 font-semibold text-gray-900">
                      {restaurant.name}
                    </p>
                    <p className="mt-1 flex text-sm leading-5 text-gray-500">
                      Slug:{" "}
                      <span className="ml-1 font-mono text-xs">
                        {restaurant.slug}
                      </span>
                    </p>
                  </div>
                  <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                    <p className="text-sm leading-6 text-indigo-600">
                      Role:{" "}
                      <span className="font-medium capitalize">
                        {restaurant.accessLevel}
                      </span>
                    </p>
                  </div>
                  {/* Action Button for Admin: Use a Server Action here to revoke access */}
                  <form className="ml-4">
                    {/* Hidden fields for userId and restaurantId */}
                    <button
                      type="submit"
                      // You will replace this placeholder action later
                      // formAction={revokeAccessAction}
                      className="rounded-lg bg-red-500 px-3 py-1 text-sm font-medium text-white shadow-sm transition duration-150 hover:bg-red-600"
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
      <section className="mt-12 rounded-xl border border-dashed border-gray-300 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Assign New Restaurant
        </h2>

        {availableRestaurants.length === 0 ? (
          <p className="text-sm text-gray-500">
            All available restaurants have been assigned to this user.
          </p>
        ) : (
          <form
            // CRUCIAL FIX: Use POST method to execute the Server Action
            method="POST"
            // Connect to the Server Action
            action={assignRestaurantToUser}
            className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
          >
            {/* Ensure the userId is passed to the action */}
            <input type="hidden" name="clerkUserId" value={targetUserId} />
            <select
              name="restaurantId"
              required
              className="flex-grow rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-150 hover:bg-indigo-700"
            >
              Assign Restaurant
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
