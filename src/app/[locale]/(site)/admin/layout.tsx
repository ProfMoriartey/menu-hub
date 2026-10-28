import { auth } from "@clerk/nextjs/server";
import { redirect } from "~/i18n/navigation";
import { getLocale } from "next-intl/server";
import { UserButton } from "@clerk/nextjs"; // ClerkProvider removed, UserButton kept
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/shared/ThemeToggle"; // Assuming this is correct
import { AdminNav } from "~/components/admin/AdminNav";
import { countOpenRequests } from "~/server/plan-requests";

// Ensure ClerkProvider is in the root app/layout.tsx, not here.

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // 1. Unauthenticated check
  if (!userId) {
    // Force sign-in
    return redirect({ href: "/sign-in", locale: await getLocale() });
  }

  // 2. Authorization check (System-level RBAC)
  // Ensure you've completed the TypeScript type extension for sessionClaims
  const { sessionClaims } = await auth();
  const metadata =
    sessionClaims && "metadata" in sessionClaims
      ? sessionClaims.metadata
      : null;
  const role =
    metadata && typeof metadata === "object" && "role" in metadata
      ? metadata.role
      : null;
  const isAdmin = role === "admin";
  if (!isAdmin) {
    // User is authenticated but not an admin
    return redirect({ href: "/dashboard", locale: await getLocale() });
  }

  return (
    // ClerkProvider removed here
    <div className={cn("min-h-screen", "bg-background")}>
      {/* Top Navigation Bar for Admin */}
      <header className="bg-card text-card-foreground border-border sticky top-0 z-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b px-4 py-3 sm:px-8 print:hidden">
        <div className="flex items-center gap-6">
          <h2 className="text-primary text-lg font-extrabold tracking-tight">
            Admin
          </h2>
          <AdminNav requestCount={await countOpenRequests()} />
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className={cn("w-full", "text-foreground")}>
        {/* Wrap children in a div with generous padding */}
        <div className="mx-auto max-w-7xl p-4 sm:p-8 print:max-w-none print:p-0">{children}</div>
      </main>
    </div>
  );
}
