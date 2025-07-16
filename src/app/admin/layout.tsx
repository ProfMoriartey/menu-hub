// app/admin/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import Link from "next/link"; // Make sure Link is imported

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
      <div className="flex min-h-screen bg-gray-100">
        {/* Admin Sidebar/Navigation */}
        <aside className="flex w-64 flex-col bg-gray-800 p-4 text-white">
          {" "}
          {/* Added flex-col */}
          <h2 className="mb-6 text-2xl font-bold">Admin Dashboard</h2>
          <nav className="flex-grow">
            {" "}
            {/* Added flex-grow */}
            <ul>
              <li className="mb-2">
                <Link
                  href="/admin/restaurants"
                  className="block rounded p-2 hover:bg-gray-700"
                >
                  Restaurants
                </Link>
              </li>
              {/* REMOVED: Categories and Menu Items links for now */}
            </ul>
          </nav>
          <div className="mt-auto p-2">
            {" "}
            {/* Added mt-auto to push to bottom */}
            <UserButton afterSignOutUrl="/" />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </ClerkProvider>
  );
}
