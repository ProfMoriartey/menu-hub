// app/[locale]/admin/users/page.tsx

import { db } from "~/server/db";
import { type Metadata } from "next";
import { getClerkProfiles } from "~/server/clerk-profiles";
import { toAccessLevel } from "~/lib/access";
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

  const profiles = await getClerkProfiles(rows.map((user) => user.id));

  const users: UserSummary[] = rows.map((user) => {
    const profile = profiles.get(user.id);
    return {
      id: user.id,
      email: user.email ?? profile?.email ?? null,
      name: profile?.name ?? null,
      imageUrl: profile?.imageUrl ?? null,
      isAdmin: profile?.isAdmin ?? false,
      createdAt: user.createdAt,
      lastSignInAt: profile?.lastSignInAt ?? null,
      restaurants: user.usersToRestaurants
        .map((link) => ({ ...link.restaurant, accessLevel: toAccessLevel(link.accessLevel) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };
  });

  const withoutAccess = users.filter((u) => u.restaurants.length === 0 && !u.isAdmin).length;

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
