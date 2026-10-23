// src/components/admin/AdminNav.tsx
"use client";

import { Link, usePathname } from "~/i18n/navigation";
import { cn } from "~/lib/utils";

const NAV_ITEMS = [
  { name: "Restaurants", href: "/admin/restaurants" },
  { name: "Users", href: "/admin/users" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin">
      <ul className="flex gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
