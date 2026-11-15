// src/components/admin/AdminNav.tsx
"use client";

import { Link, usePathname } from "~/i18n/navigation";
import { cn } from "~/lib/utils";

const NAV_ITEMS = [
  { name: "Restaurants", href: "/admin/restaurants" },
  { name: "Users", href: "/admin/users" },
  { name: "Payments", href: "/admin/payments" },
  { name: "Requests", href: "/admin/requests" },
];

// `requestCount`: owners' requests waiting for an admin, shown on Requests.
export function AdminNav({ requestCount }: { requestCount: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="min-w-0">
      {/* Scrolls sideways on phones instead of widening the whole page. */}
      <ul className="flex gap-1 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm whitespace-nowrap font-medium transition-colors duration-150",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                {item.name}
                {item.href === "/admin/requests" && requestCount > 0 && (
                  <span className="bg-primary text-primary-foreground ms-1.5 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums">
                    {requestCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
