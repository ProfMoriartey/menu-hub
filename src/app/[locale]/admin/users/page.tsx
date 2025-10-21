// app/[locale]/admin/users/page.tsx

import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { type Metadata } from "next";
import Link from "next/link";
// IMPORT Drizzle functions for querying and sorting
import { desc, sql, eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Admin: Manage Users",
  description: "View all users and manage their restaurant assignments.",
};

/**
 * Admin: Users List Page
 * Fetches users along with a count of their assigned restaurants.
 * NOTE: Assumes RBAC check is handled by a parent layout.
 */
export default async function AdminUsersPage() {
  // 1. Fetch users and aggregate the count of assigned restaurants
  const usersWithCounts = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      createdAt: schema.users.createdAt,
      // Use an aggregation query to count the links in the junction table
      restaurantCount:
        sql<number>`count(${schema.usersToRestaurants.userId})`.as(
          "restaurant_count",
        ),
    })
    .from(schema.users)
    // Join the users table to the junction table
    .leftJoin(
      schema.usersToRestaurants,
      eq(schema.users.id, schema.usersToRestaurants.userId),
    )
    // Group the results by user columns to allow the COUNT aggregation
    .groupBy(schema.users.id, schema.users.email, schema.users.createdAt)
    // Order by creation date, newest first
    .orderBy(desc(schema.users.createdAt));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          System Users ({usersWithCounts.length})
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Click on a user to modify their restaurant assignments.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl bg-white shadow-xl">
        <ul role="list" className="divide-y divide-gray-200">
          {usersWithCounts.length === 0 ? (
            <li className="p-6 text-center text-gray-500">
              No users found. New users will appear here after sign-up.
            </li>
          ) : (
            usersWithCounts.map((user) => (
              <li
                key={user.id}
                className="p-4 transition duration-100 hover:bg-indigo-50/50 sm:px-6"
              >
                <Link
                  href={`/admin/users/${user.id}`}
                  className="flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="truncate text-lg font-medium text-gray-900">
                      {/* Display the email if available, otherwise show the ID */}
                      {user.email ?? `User ID: ${user.id}`}
                    </p>
                    {user.email && (
                      <p className="mt-1 font-mono text-xs break-all text-gray-500">
                        ID: {user.id}
                      </p>
                    )}
                  </div>

                  <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                    <p className="text-sm font-semibold text-indigo-600">
                      {user.restaurantCount} Assigned Restaurant
                      {user.restaurantCount === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Joined:{" "}
                      {user.createdAt
                        ? user.createdAt.toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <svg
                    className="ml-4 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
