import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server"; // 🛑 Import getTranslations for Server Component
import { db } from "~/server/db";
import { usersToRestaurants } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "~/components/shared/ThemeToggle";

interface AssignedRestaurant {
  id: string;
  name: string;
  slug: string;
  accessLevel: "editor" | "owner" | "viewer";
}

// NOTE: This component is placed inside an (app) route group to avoid
// dynamic segment conflicts with [restaurantSlug]. The URL is /dashboard.
export default async function ClientUserDashboardPage() {
  const t = await getTranslations("Dashboard"); // 🛑 Initialize server-side translations
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  // 1. Fetch assigned restaurants
  const userAssignments = await db.query.usersToRestaurants.findMany({
    where: eq(usersToRestaurants.userId, userId),
    with: {
      restaurant: true,
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
      <div className="mb-8 flex justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight">
          {/* Translated Title */}
          {t("title")}
        </h1>
        <div className="flex flex-col justify-between gap-6 md:flex-row-reverse">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <ThemeToggle />
        </div>
      </div>

      {assignedRestaurants.length === 0 ? (
        <Card className="p-6 text-center">
          {/* Translated Empty State Title */}
          <CardTitle className="mb-3 text-xl">{t("emptyTitle")}</CardTitle>
          <CardContent>
            {/* Translated Empty State Message */}
            <p className="text-muted-foreground">{t("emptyMessage")}</p>
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
                  {/* Translated Access Level Label */}
                  {t("accessLevelLabel")}:{" "}
                  {t(`accessLevels.${restaurant.accessLevel}`)}
                </p>
              </CardHeader>
              <CardContent className="flex justify-end pt-0">
                <Link href={`/dashboard/${restaurant.slug}/edit`}>
                  {/* Translated Button */}
                  <Button className="w-full">{t("manageMenuButton")}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
