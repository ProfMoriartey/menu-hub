// app/[locale]/admin/users/[userId]/page.tsx
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { formatDate } from "~/lib/format";
import { toAccessLevel } from "~/lib/access";
import { getClerkProfiles } from "~/server/clerk-profiles";
import { AdminBadge, UserAvatar } from "~/components/admin/UserList";
import { CopyButton } from "~/components/admin/CopyButton";
import { UserAccessManager, type AssignedRestaurant } from "~/components/admin/UserAccessManager";

interface UserPanelProps {
  params: Promise<{ userId: string }>;
}

export const metadata: Metadata = {
  title: "Admin: Assign Restaurants",
  description: "View and manage which restaurants this specific user can edit.",
};

const restaurantColumns = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  isActive: true,
  isDisplayed: true,
} as const;

export default async function UserAssignmentPanel({ params }: UserPanelProps) {
  const { userId: targetUserId } = await params;

  const [user, allRestaurants, profiles] = await Promise.all([
    db.query.users.findFirst({
      where: eq(schema.users.id, targetUserId),
      with: {
        usersToRestaurants: {
          with: { restaurant: { columns: restaurantColumns } },
        },
      },
    }),
    db.query.restaurants.findMany({
      columns: restaurantColumns,
      orderBy: [schema.restaurants.name],
    }),
    getClerkProfiles([targetUserId]),
  ]);

  if (!user) {
    return notFound();
  }

  const profile = profiles.get(user.id);
  const email = user.email ?? profile?.email ?? null;
  const name = profile?.name ?? null;

  const assigned: AssignedRestaurant[] = user.usersToRestaurants
    .map((link) => ({ ...link.restaurant, accessLevel: toAccessLevel(link.accessLevel) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const assignedIds = new Set(assigned.map((r) => r.id));
  const available = allRestaurants.filter((r) => !assignedIds.has(r.id));

  const userLabel = name ?? email ?? "This user";

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <nav aria-label="Breadcrumb">
          <ol className="text-muted-foreground flex items-center gap-1 text-sm">
            <li>
              <Link href="/admin/users" className="hover:text-foreground">
                Users
              </Link>
            </li>
            <li className="flex min-w-0 items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="text-foreground truncate" aria-current="page">
                {name ?? email ?? user.id}
              </span>
            </li>
          </ol>
        </nav>

        <div className="flex items-center gap-4">
          <UserAvatar user={{ name, email, imageUrl: profile?.imageUrl ?? null }} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-foreground truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {name ?? email ?? "No email on file"}
              </h1>
              {profile?.isAdmin && <AdminBadge />}
            </div>
            {name && email && <p className="text-muted-foreground truncate">{email}</p>}
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span>Joined {formatDate(user.createdAt)}</span>
              {profile && (
                <span>
                  {profile.lastSignInAt
                    ? `Last sign-in ${formatDate(new Date(profile.lastSignInAt))}`
                    : "Never signed in"}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <span className="font-mono text-xs">{user.id}</span>
                <CopyButton value={user.id} label="Copy user ID" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <UserAccessManager
        userId={user.id}
        userLabel={userLabel}
        isAdmin={profile?.isAdmin ?? false}
        assigned={assigned}
        available={available}
      />
    </div>
  );
}
