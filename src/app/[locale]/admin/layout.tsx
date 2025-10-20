import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs"; // ClerkProvider removed, UserButton kept
import Link from "next/link";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/shared/ThemeToggle"; // Assuming this is correct

// Ensure ClerkProvider is in the root app/layout.tsx, not here.

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  // 1. Unauthenticated check
  if (!userId) {
    // Force sign-in
    return redirect("/sign-in");
  }

  // 2. Authorization check (System-level RBAC)
  // Ensure you've completed the TypeScript type extension for sessionClaims
  const isAdmin = sessionClaims?.metadata?.role === "admin";

  if (!isAdmin) {
    // User is authenticated but not an admin
    return redirect("/dashboard");
  }

  const navItems = [
    { name: "Restaurants", href: "/admin/restaurants" },
    { name: "Users", href: "/admin/users" }, // ADDED USERS LINK
  ];

  return (
    // ClerkProvider removed here
    <div className={cn("min-h-screen", "bg-background")}>
      {/* Top Navigation Bar for Admin */}
      <header className="bg-card text-card-foreground sticky top-0 z-10 flex items-center justify-between p-4 shadow-md">
        <h2 className="text-primary text-2xl font-extrabold tracking-tight">
          Admin Dashboard
        </h2>
        <nav>
          <ul className="flex space-x-4">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150",
                    "hover:bg-accent hover:text-accent-foreground",
                    // Optional: Add active state logic here based on current path if needed
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className={cn("w-full", "text-foreground")}>
        {/* Wrap children in a div with generous padding */}
        <div className="mx-auto max-w-7xl p-8">{children}</div>
      </main>
    </div>
  );
}
