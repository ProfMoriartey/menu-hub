// app/admin/restaurants/[restaurantSlug]/people/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { restaurants, usersToRestaurants } from "~/server/db/schema";
import { getClerkProfiles } from "~/server/clerk-profiles";
import { toAccessLevel } from "~/lib/access";
import { RestaurantAdminHeader } from "~/components/admin/RestaurantAdminHeader";
import {
  RestaurantPeopleManager,
  type PersonSummary,
  type RestaurantPerson,
} from "~/components/admin/RestaurantPeopleManager";

export default async function RestaurantPeoplePage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
  });
  if (!restaurant) notFound();

  const [links, allUsers] = await Promise.all([
    db.query.usersToRestaurants.findMany({
      where: eq(usersToRestaurants.restaurantId, restaurant.id),
      columns: { userId: true, accessLevel: true },
    }),
    db.query.users.findMany({
      columns: { id: true, email: true },
      orderBy: (users, { asc }) => [asc(users.email)],
    }),
  ]);

  // Everyone appears in the "add" picker, so look them all up in Clerk.
  const profiles = await getClerkProfiles(allUsers.map((user) => user.id));
  const toPerson = (user: { id: string; email: string | null }): PersonSummary => {
    const profile = profiles.get(user.id);
    return {
      id: user.id,
      email: user.email ?? profile?.email ?? null,
      name: profile?.name ?? null,
      imageUrl: profile?.imageUrl ?? null,
    };
  };

  const levelByUser = new Map(links.map((link) => [link.userId, toAccessLevel(link.accessLevel)]));
  const people: RestaurantPerson[] = [];
  const candidates: PersonSummary[] = [];
  for (const user of allUsers) {
    const level = levelByUser.get(user.id);
    // Admins can already manage every restaurant, so they're left out of the picker.
    if (level) people.push({ ...toPerson(user), accessLevel: level });
    else if (!profiles.get(user.id)?.isAdmin) candidates.push(toPerson(user));
  }

  return (
    <div className="space-y-8">
      <RestaurantAdminHeader restaurant={restaurant} activeTab="people" />
      <RestaurantPeopleManager
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        people={people}
        candidates={candidates}
      />
    </div>
  );
}
