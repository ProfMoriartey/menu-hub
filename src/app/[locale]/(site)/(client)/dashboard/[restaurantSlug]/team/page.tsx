// app/[locale]/(site)/(client)/dashboard/[restaurantSlug]/team/page.tsx
import { type Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { usersToRestaurants } from "~/server/db/schema";
import { getDashboardRestaurant } from "~/server/dashboard-restaurant";
import { getClerkProfiles } from "~/server/clerk-profiles";
import { formatInviteDate, getOpenInvites } from "~/server/invites";
import { canEditDetails, toAccessLevel } from "~/lib/access";
import { DashboardRestaurantHeader } from "~/components/dashboard/DashboardRestaurantHeader";
import {
  TeamManager,
  type TeamMember,
} from "~/components/dashboard/TeamManager";

export const metadata: Metadata = {
  title: "Team | Menupedia",
  description: "Invite editors and see who manages your menu.",
};

export default async function DashboardTeamPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;
  const { restaurant, role } = await getDashboardRestaurant(restaurantSlug);
  const canManage = canEditDetails(role);
  const [{ userId }, locale] = await Promise.all([auth(), getLocale()]);

  const [links, invites] = await Promise.all([
    db.query.usersToRestaurants.findMany({
      where: eq(usersToRestaurants.restaurantId, restaurant.id),
      columns: { userId: true, accessLevel: true },
      with: { user: { columns: { email: true } } },
    }),
    // Editors see who's on the team, not who has been invited.
    canManage ? getOpenInvites(restaurant.id) : Promise.resolve([]),
  ]);

  const profiles = await getClerkProfiles(links.map((link) => link.userId));
  const members: TeamMember[] = links
    .map((link) => {
      const profile = profiles.get(link.userId);
      return {
        id: link.userId,
        name: profile?.name ?? null,
        email: profile?.email ?? link.user.email,
        imageUrl: profile?.imageUrl ?? null,
        accessLevel: toAccessLevel(link.accessLevel),
      };
    })
    .sort((a, b) =>
      (a.name ?? a.email ?? "").localeCompare(b.name ?? b.email ?? ""),
    );

  return (
    <>
      <DashboardRestaurantHeader
        restaurant={restaurant}
        role={role}
        activeTab="team"
      />
      <TeamManager
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        canManage={canManage}
        currentUserId={userId ?? ""}
        members={members}
        invites={invites.map((invite) => ({
          id: invite.id,
          email: invite.email,
          expires: formatInviteDate(invite.expiresAt, locale),
        }))}
      />
    </>
  );
}
