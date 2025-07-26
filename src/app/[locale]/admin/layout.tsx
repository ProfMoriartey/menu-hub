// app/admin/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import Link from "next/link"; // Keep Link if you'll use it in a top bar or elsewhere
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/shared/ThemeToggle";

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
      {/* Main container, now without flex to accommodate sidebar */}
      <div className={cn("min-h-screen", "bg-background")}>
        {/* Top Navigation Bar for Admin - NEW */}
        <header className="bg-card text-card-foreground flex items-center justify-between p-4 shadow-sm">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link
                  href="/admin/restaurants"
                  className={cn(
                    "rounded p-2",
                    "hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  Restaurants
                </Link>
              </li>
              {/* Add more admin navigation links here if needed */}
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Main Content Area - now takes full width */}
        <main className={cn("relative w-full", "text-foreground")}>
          {/* The ThemeToggle is now in the header, so remove its absolute positioning here */}
          {/* <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div> */}
          {/* Wrap children in a div with padding */}
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ClerkProvider>
  );
}
