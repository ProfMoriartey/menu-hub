// app/[locale]/admin/users/page.tsx

import { db } from "~/server/db";
import { type Metadata } from "next";
import { UserList, type UserSummary } from "~/components/admin/UserList";

export const metadata: Metadata = {
  title: "Admin: Manage Users",
  description: "View all users and manage their restaurant assignments.",
};

export default async function AdminUsersPage() {
  const rows = await db.query.users.findMany({
    orderBy: (users, { desc }) => [desc(users.createdAt)],
    with: {
      usersToRestaurants: {
        with: { restaurant: { columns: { id: true, name: true } } },
      },
    },
  });

  const users: UserSummary[] = rows.map((user) => ({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    restaurants: user.usersToRestaurants
      .map((link) => link.restaurant)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  const withoutAccess = users.filter((u) => u.restaurants.length === 0).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1">
          {users.length} total
          {withoutAccess > 0 && ` · ${withoutAccess} without restaurant access`}
        </p>
      </div>
      <UserList users={users} />
    </div>
  );
}
