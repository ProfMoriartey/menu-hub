// app/admin/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/shared/ThemeToggle"; // ADDED: Import ThemeToggle

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const adminUserId = process.env.ADMIN_USER_ID;

  if (!userId || userId !== adminUserId) {
    redirect("/sign-in");
  }

  return (
    <ClerkProvider>
      <div className={cn("flex min-h-screen", "bg-background")}>
        {/* Admin Sidebar/Navigation */}
        <aside
          className={cn(
            "flex w-64 flex-col p-4",
            "bg-sidebar text-sidebar-foreground",
          )}
        >
          <h2 className="mb-6 text-2xl font-bold">Admin Dashboard</h2>
          <nav className="flex-grow">
            <ul>
              <li className="mb-2">
                <Link
                  href="/admin/restaurants"
                  className={cn(
                    "block rounded p-2",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  Restaurants
                </Link>
              </li>
            </ul>
          </nav>
          <div className="mt-auto p-2">
            <UserButton afterSignOutUrl="/" />
          </div>
        </aside>

        {/* Main Content Area */}
        {/* UPDATED: Make main relative for absolute positioning of toggle */}
        <main className={cn("relative flex-1", "text-foreground")}>
          {/* ADDED: Theme Toggle in the top right corner of the main content area */}
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {/* Wrap children in a div with padding, as main itself is no longer directly padded */}
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ClerkProvider>
  );
}
