import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin: Manage Users",
  description: "View all users and manage their restaurant assignments.",
};

/**
 * Admin: Users List Page
 * Displays a list of all users from the database.
 * Each user links to the specific assignment panel.
 * NOTE: Assumes RBAC check is handled by a parent layout.
 */
export default async function AdminUsersPage() {
  // Fetch all users from your Drizzle table
  const users = await db.query.users.findMany({
    orderBy: [schema.users.createdAt],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          System Users ({users.length})
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Click on a user ID to view and modify their assigned restaurants.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl bg-white shadow-xl">
        <ul role="list" className="divide-y divide-gray-200">
          {users.length === 0 ? (
            <li className="p-6 text-center text-gray-500">
              No users found in the database. Users are synced upon sign-up.
            </li>
          ) : (
            users.map((user) => (
              <li
                key={user.id}
                className="p-4 transition duration-100 hover:bg-indigo-50/50 sm:px-6"
              >
                <Link
                  // Next.js automatically prepends the current locale to this path
                  href={`/admin/users/${user.id}`}
                  className="flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="truncate text-sm font-medium text-gray-900">
                      User ID:
                    </p>
                    <p className="mt-1 font-mono text-sm break-all text-indigo-600">
                      {user.id}
                    </p>
                  </div>
                  <div className="hidden shrink-0 sm:block">
                    <p className="text-xs text-gray-500">
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
