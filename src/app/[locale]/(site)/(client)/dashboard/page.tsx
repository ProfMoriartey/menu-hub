// app/[locale]/(client)/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { getTranslations, getLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { ExternalLink, Eye, Pencil, QrCode, ShieldCheck, Store, UserPlus, UtensilsCrossed } from "lucide-react";
import { Link, redirect } from "~/i18n/navigation";
import { db } from "~/server/db";
import { usersToRestaurants } from "~/server/db/schema";
import { isSystemAdmin } from "~/app/actions/auth";
import { Button } from "~/components/ui/button";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import { canEditDetails, toAccessLevel } from "~/lib/access";
import { setupProgress } from "~/lib/setup-checklist";
import { getSetupFacts } from "~/server/setup-facts";
import { findInvitesForEmails, getVerifiedEmails } from "~/server/invites";
import { InviteResponse } from "~/components/dashboard/InviteResponse";

// NOTE: This component is placed inside an (app) route group to avoid
// dynamic segment conflicts with [restaurantSlug]. The URL is /dashboard.
export default async function ClientUserDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect({ href: "/sign-in", locale: await getLocale() });
  }

  const [t, tHome, tSetup, tInvite, assignments, isAdmin, invitations] = await Promise.all([
    getTranslations("Dashboard"),
    getTranslations("DashboardHome"),
    getTranslations("Setup"),
    getTranslations("Invite"),
    db.query.usersToRestaurants.findMany({
      where: eq(usersToRestaurants.userId, userId),
      with: {
        restaurant: {
          columns: { id: true, name: true, slug: true, logoUrl: true, isActive: true, description: true },
          // Ids are enough for the category and item counts.
          with: {
            categories: {
              columns: { id: true },
              with: { menuItems: { columns: { id: true } } },
            },
          },
        },
      },
    }),
    isSystemAdmin(),
    // Open invitations to this person's verified addresses, so they can join
    // without the link. Clerk being unreachable shouldn't break the dashboard.
    getVerifiedEmails(userId)
      .then(findInvitesForEmails)
      .catch((error: unknown) => {
        console.error("Failed to load invitations:", error);
        return [];
      }),
  ]);

  const restaurants = assignments
    .map(({ restaurant, accessLevel }) => ({
      ...restaurant,
      accessLevel: toAccessLevel(accessLevel),
      categoryCount: restaurant.categories.length,
      itemCount: restaurant.categories.reduce((sum, c) => sum + c.menuItems.length, 0),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const memberOf = new Set(assignments.map((a) => a.restaurant.id));
  const openInvitations = invitations.filter((invite) => !memberOf.has(invite.restaurantId));

  // Setup progress for every card, with one grouped query per table.
  const setupFacts = await getSetupFacts(restaurants);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">{tHome("title")}</h1>
        <p className="text-muted-foreground mt-1">{tHome("subtitle")}</p>
      </div>

      {isAdmin && (
        <div className="bg-primary/5 border-primary/20 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-5 py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-primary mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div>
              <p className="font-medium">{tHome("adminTitle")}</p>
              <p className="text-muted-foreground text-sm">{tHome("adminText")}</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/restaurants">{tHome("adminLink")}</Link>
          </Button>
        </div>
      )}

      {openInvitations.length > 0 && (
        <ul className="space-y-3" aria-label={tInvite("eyebrow")}>
          {openInvitations.map((invite) => (
            <li
              key={invite.id}
              className="bg-primary/5 border-primary/20 flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <RestaurantLogo restaurant={invite.restaurant} />
                <div className="min-w-0">
                  <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                    <UserPlus className="h-4 w-4" aria-hidden /> {tInvite("eyebrow")}
                  </p>
                  <p className="truncate font-medium">{tInvite("title", { restaurant: invite.restaurant.name })}</p>
                </div>
              </div>
              <InviteResponse inviteId={invite.id} />
            </li>
          ))}
        </ul>
      )}

      {restaurants.length === 0 && openInvitations.length > 0 ? null : restaurants.length === 0 ? (
        <div className="border-border flex flex-col items-center rounded-xl border border-dashed px-6 py-16 text-center">
          <Store className="text-muted-foreground mb-4 h-10 w-10" aria-hidden />
          <h2 className="text-lg font-semibold">{t("emptyTitle")}</h2>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">{t("emptyMessage")}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <li
              key={restaurant.id}
              className="bg-card text-card-foreground border-border flex flex-col rounded-xl border shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex items-start gap-3">
                  <RestaurantLogo restaurant={restaurant} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold">
                      <Link href={`/dashboard/${restaurant.slug}/menu`} className="hover:underline">
                        {restaurant.name}
                      </Link>
                    </h2>
                    <p className="text-muted-foreground truncate font-mono text-xs" dir="ltr">
                      /{restaurant.slug}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="bg-primary/10 text-primary inline-block rounded-full px-2 py-0.5 text-xs font-medium">
                    {t(`accessLevels.${restaurant.accessLevel}`)}
                  </span>
                  <p className="text-muted-foreground text-xs">
                    {t(`accessLevelHints.${restaurant.accessLevel}`)}
                  </p>
                </div>

                <p className="text-muted-foreground mt-auto flex items-center gap-2 text-sm">
                  <UtensilsCrossed className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {tHome("counts", {
                    categories: restaurant.categoryCount,
                    items: restaurant.itemCount,
                  })}
                </p>

                {(() => {
                  const facts = setupFacts.get(restaurant.id);
                  const progress = facts && setupProgress(facts);
                  if (!progress || progress.complete) return null;
                  return (
                    <Link href={`/dashboard/${restaurant.slug}/menu`} className="group block space-y-1">
                      <span className="text-muted-foreground flex items-center justify-between text-xs group-hover:underline">
                        <span>{progress.readyToGoLive ? tSetup("readyBadge") : tSetup("cardLabel")}</span>
                        <span className="tabular-nums">
                          {tSetup("progress", { done: progress.done, total: progress.total })}
                        </span>
                      </span>
                      <span className="bg-muted block h-1.5 overflow-hidden rounded-full" aria-hidden>
                        <span
                          className="bg-primary block h-full rounded-full"
                          style={{ width: `${(progress.done / progress.total) * 100}%` }}
                        />
                      </span>
                    </Link>
                  );
                })()}
              </div>

              <div className="border-border flex items-center gap-2 border-t px-5 py-3">
                <Button size="sm" asChild>
                  <Link href={`/dashboard/${restaurant.slug}/menu`}>
                    <UtensilsCrossed className="h-3.5 w-3.5" /> {tHome("editMenu")}
                  </Link>
                </Button>
                {canEditDetails(restaurant.accessLevel) && (
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/dashboard/${restaurant.slug}/edit`}>
                      <Pencil className="h-3.5 w-3.5" /> {tHome("details")}
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="ms-auto" asChild>
                  <Link
                    href={`/dashboard/${restaurant.slug}/share`}
                    aria-label={tHome("share")}
                    title={tHome("share")}
                  >
                    <QrCode className="h-4 w-4" />
                  </Link>
                </Button>
                {/* Not live yet: the same page opens as a preview only they can see. */}
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    href={`/${restaurant.slug}`}
                    target="_blank"
                    aria-label={restaurant.isActive ? tHome("viewLive") : tHome("preview")}
                    title={restaurant.isActive ? tHome("viewLive") : tHome("preview")}
                  >
                    {restaurant.isActive ? <ExternalLink className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
