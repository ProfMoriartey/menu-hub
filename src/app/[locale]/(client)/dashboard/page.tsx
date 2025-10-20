import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { usersToRestaurants, restaurants } from "~/server/db/schema"; // Import the necessary tables
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

interface AssignedRestaurant {
  id: string;
  name: string;
  slug: string;
  accessLevel: "editor" | "owner" | "viewer";
}

// NOTE: This component is placed inside an (app) route group to avoid
// dynamic segment conflicts with [restaurantSlug]. The URL is /dashboard.
export default async function ClientUserDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    // Should be caught by middleware/parent layout, but good practice to redirect.
    return redirect("/sign-in");
  }

  // 1. Fetch assigned restaurants via the junction table
  const userAssignments = await db.query.usersToRestaurants.findMany({
    where: eq(usersToRestaurants.userId, userId),
    with: {
      restaurant: true, // Join to get the restaurant details
    },
  });

  // 2. Map the results into a clean array
  const assignedRestaurants: AssignedRestaurant[] = userAssignments.map(
    (assignment) => ({
      id: assignment.restaurant.id,
      name: assignment.restaurant.name,
      slug: assignment.restaurant.slug,
      accessLevel: assignment.accessLevel as AssignedRestaurant["accessLevel"],
    }),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-extrabold tracking-tight">
        Your Assigned Menus
      </h1>

      {assignedRestaurants.length === 0 ? (
        <Card className="p-6 text-center">
          <CardTitle className="mb-3 text-xl">No Menus Assigned</CardTitle>
          <CardContent>
            <p className="text-muted-foreground">
              It looks like you haven&apos;t been assigned any menus yet. Please
              contact the administrator.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignedRestaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              className="transition-shadow hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle>{restaurant.name}</CardTitle>
                <p className="text-muted-foreground text-sm capitalize">
                  Access Level: {restaurant.accessLevel}
                </p>
              </CardHeader>
              <CardContent className="flex justify-end pt-0">
                <Link href={`/${restaurant.slug}/edit`}>
                  <Button className="w-full">Manage Menu</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
