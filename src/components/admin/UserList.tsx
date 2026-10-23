// src/components/admin/UserList.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Search, ShieldCheck, Users } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { formatDate } from "~/lib/format";
import { cn } from "~/lib/utils";
import type { AccessLevel } from "~/lib/access";

export interface UserSummary {
  id: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  isAdmin: boolean;
  createdAt: Date;
  lastSignInAt: number | null;
  restaurants: { id: string; name: string; accessLevel: AccessLevel }[];
}

const FILTERS = [
  { id: "all", label: "All", test: () => true },
  { id: "with-access", label: "Has access", test: (u: UserSummary) => u.restaurants.length > 0 },
  { id: "no-access", label: "No access", test: (u: UserSummary) => u.restaurants.length === 0 && !u.isAdmin },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export function UserAvatar({
  user,
  size = "md",
}: {
  user: Pick<UserSummary, "email" | "name" | "imageUrl">;
  size?: "md" | "lg";
}) {
  const initial = (user.name ?? user.email)?.[0] ?? "?";
  const px = size === "lg" ? 56 : 40;

  return (
    <div
      aria-hidden
      className={cn(
        "bg-primary/10 text-primary relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold uppercase",
        size === "lg" ? "h-14 w-14 text-xl" : "h-10 w-10 text-sm",
      )}
    >
      {user.imageUrl ? (
        <Image src={user.imageUrl} alt="" fill sizes={`${px}px`} className="object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}

export function AdminBadge() {
  return (
    <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
      <ShieldCheck className="h-3 w-3" /> Admin
    </span>
  );
}

export function UserList({ users }: { users: UserSummary[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

  const term = query.trim().toLowerCase();
  const searched = term
    ? users.filter((user) =>
        [user.email, user.name, user.id].some((value) => value?.toLowerCase().includes(term)),
      )
    : users;
  const activeFilter = FILTERS.find((f) => f.id === filter)!;
  const visible = searched.filter(activeFilter.test);

  if (users.length === 0) {
    return (
      <div className="border-border flex flex-col items-center rounded-xl border border-dashed px-6 py-16 text-center">
        <Users className="text-muted-foreground mb-4 h-10 w-10" />
        <h2 className="text-lg font-semibold">No users yet</h2>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          People appear here after they sign up. Then you can give them access to a restaurant.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search by email or name…"
            aria-label="Search users by email or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>
        <div role="tablist" aria-label="Filter by access" className="bg-muted inline-flex rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span className="text-muted-foreground ml-1.5 tabular-nums">
                {searched.filter(f.test).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="border-border rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="font-medium">
            {term ? `No users match "${query.trim()}"` : "No users in this view"}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">Check the spelling or try another filter.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Clear search
          </Button>
        </div>
      ) : (
        <ul className="bg-card border-border divide-border divide-y overflow-hidden rounded-xl border shadow-sm">
          {visible.map((user) => {
            const shown = user.restaurants.slice(0, 2);
            const more = user.restaurants.length - shown.length;
            return (
              <li key={user.id}>
                <Link
                  href={`/admin/users/${user.id}`}
                  className="hover:bg-accent/40 focus-visible:bg-accent/40 flex items-center gap-4 px-4 py-3 outline-none sm:px-5"
                >
                  <UserAvatar user={user} />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate font-medium">{user.name ?? user.email ?? "No email on file"}</p>
                      {user.isAdmin && <AdminBadge />}
                    </div>
                    <p className="text-muted-foreground truncate text-xs">
                      {user.name && user.email ? `${user.email} · ` : ""}
                      {user.lastSignInAt
                        ? `Last sign-in ${formatDate(new Date(user.lastSignInAt))}`
                        : `Joined ${formatDate(user.createdAt)}`}
                    </p>
                  </div>
                  <div className="hidden min-w-0 flex-wrap justify-end gap-1.5 sm:flex">
                    {user.restaurants.length === 0 ? (
                      !user.isAdmin && (
                        <span className="bg-attention/15 text-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
                          No access yet
                        </span>
                      )
                    ) : (
                      <>
                        {shown.map((r) => (
                          <span
                            key={r.id}
                            className="bg-muted text-foreground inline-flex max-w-48 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          >
                            <span className="truncate">{r.name}</span>
                            <span className="text-muted-foreground font-normal">
                              · {r.accessLevel === "owner" ? "Owner" : "Editor"}
                            </span>
                          </span>
                        ))}
                        {more > 0 && (
                          <span className="text-muted-foreground px-1 py-0.5 text-xs">+{more} more</span>
                        )}
                      </>
                    )}
                  </div>
                  <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
