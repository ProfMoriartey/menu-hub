import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ClerkProvider, UserButton } from "@clerk/nextjs"; // Import ClerkProvider and UserButton
import Link from "next/link";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth(); // Get the authenticated user's ID

  // Get the ADMIN_USER_ID from environment variables
  const adminUserId = process.env.ADMIN_USER_ID;

  // Check if the user is authenticated AND if their ID matches the admin ID
  if (!userId || userId !== adminUserId) {
    // If not authenticated or not the admin, redirect them.
    // You might want to redirect to a specific login page or a generic access denied page.
    redirect("/sign-in"); // Redirect to Clerk's default sign-in page
  }

  return (
    <ClerkProvider>
      {" "}
      {/* Ensure ClerkProvider wraps the layout if it's not in root layout */}
      <div className="flex min-h-screen bg-gray-100">
        {/* Admin Sidebar/Navigation */}
        <aside className="w-64 bg-gray-800 p-4 text-white">
          <h2 className="mb-6 text-2xl font-bold">Admin Dashboard</h2>
          <nav>
            <ul>
              <li className="mb-2">
                <Link
                  href="/admin/restaurants"
                  className="block rounded p-2 hover:bg-gray-700"
                >
                  Restaurants
                </Link>
              </li>
              {/* Add more navigation links as you build out sections */}
              <li className="mb-2">
                <Link
                  href="/admin/categories"
                  className="block rounded p-2 hover:bg-gray-700"
                >
                  Categories
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="/admin/menu-items"
                  className="block rounded p-2 hover:bg-gray-700"
                >
                  Menu Items
                </Link>
              </li>
            </ul>
          </nav>
          <div className="mt-8">
            <UserButton afterSignOutUrl="/" />{" "}
            {/* Clerk's user button for managing profile and sign out */}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </ClerkProvider>
  );
}
