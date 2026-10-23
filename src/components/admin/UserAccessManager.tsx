// src/components/admin/UserAccessManager.tsx
"use client";

import { useState, useTransition } from "react";
import { Check, ChevronsUpDown, CircleAlert, Plus, Store } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { RestaurantLogo, StatusBadges } from "~/components/admin/RestaurantCard";
import { assignRestaurantToUser, revokeRestaurantAccess } from "~/app/[locale]/admin/actions";
import type { Restaurant } from "~/types/restaurant";

export type AccessRestaurant = Pick<
  Restaurant,
  "id" | "name" | "slug" | "logoUrl" | "isActive" | "isDisplayed"
>;

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

function RemoveAccessButton({
  userId,
  userLabel,
  restaurant,
  onError,
}: {
  userId: string;
  userLabel: string;
  restaurant: AccessRestaurant;
  onError: (message: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={isPending}>
          {isPending ? "Removing…" : "Remove"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove access to {restaurant.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {userLabel} will no longer be able to edit this restaurant from their dashboard. You can give
            access again at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-white"
            onClick={() =>
              startTransition(async () => {
                try {
                  await revokeRestaurantAccess(userId, restaurant.id);
                } catch (error) {
                  onError(errorMessage(error, "Couldn't remove access."));
                }
              })
            }
          >
            Remove access
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RestaurantPicker({
  restaurants,
  selected,
  onSelect,
}: {
  restaurants: AccessRestaurant[];
  selected: AccessRestaurant | null;
  onSelect: (restaurant: AccessRestaurant) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal sm:w-80"
        >
          {selected ? (
            <span className="truncate">{selected.name}</span>
          ) : (
            <span className="text-muted-foreground">Choose a restaurant…</span>
          )}
          <ChevronsUpDown className="text-muted-foreground h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 sm:w-80" align="start">
        <Command>
          <CommandInput placeholder="Search name or slug…" />
          <CommandList>
            <CommandEmpty>No restaurant found.</CommandEmpty>
            <CommandGroup>
              {restaurants.map((restaurant) => (
                <CommandItem
                  key={restaurant.id}
                  value={`${restaurant.name} ${restaurant.slug}`}
                  onSelect={() => {
                    onSelect(restaurant);
                    setOpen(false);
                  }}
                >
                  <RestaurantLogo restaurant={restaurant} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{restaurant.name}</p>
                    <p className="text-muted-foreground truncate font-mono text-xs">/{restaurant.slug}</p>
                  </div>
                  {selected?.id === restaurant.id && <Check className="h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface UserAccessManagerProps {
  userId: string;
  userLabel: string;
  assigned: AccessRestaurant[];
  available: AccessRestaurant[];
}

export function UserAccessManager({ userId, userLabel, assigned, available }: UserAccessManagerProps) {
  const [selected, setSelected] = useState<AccessRestaurant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const giveAccess = () => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      try {
        await assignRestaurantToUser(userId, selected.id);
        setSelected(null);
      } catch (err) {
        setError(errorMessage(err, "Couldn't give access."));
      }
    });
  };

  return (
    <section aria-labelledby="access-title" className="bg-card border-border rounded-xl border shadow-sm">
      <header className="border-border border-b px-5 py-4 sm:px-6">
        <h2 id="access-title" className="text-base font-semibold">
          Restaurant access
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          These restaurants appear on {userLabel}&apos;s dashboard, where they can edit details and the
          menu.
        </p>
      </header>

      {assigned.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <Store className="text-muted-foreground mb-3 h-8 w-8" />
          <p className="font-medium">No access yet</p>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            Choose a restaurant below so this user can start managing it.
          </p>
        </div>
      ) : (
        <ul className="divide-border divide-y">
          {assigned.map((restaurant) => (
            <li key={restaurant.id} className="flex items-center gap-3 px-5 py-3 sm:px-6">
              <RestaurantLogo restaurant={restaurant} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/restaurants/${restaurant.slug}/edit`}
                  className="block truncate font-medium hover:underline"
                >
                  {restaurant.name}
                </Link>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground font-mono text-xs">/{restaurant.slug}</span>
                  <StatusBadges restaurant={restaurant} />
                </div>
              </div>
              <RemoveAccessButton
                userId={userId}
                userLabel={userLabel}
                restaurant={restaurant}
                onError={setError}
              />
            </li>
          ))}
        </ul>
      )}

      <footer className="bg-muted/30 border-border space-y-2 border-t px-5 py-4 sm:px-6">
        {available.length === 0 ? (
          <p className="text-muted-foreground text-sm">This user already has access to every restaurant.</p>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <RestaurantPicker restaurants={available} selected={selected} onSelect={setSelected} />
            <Button onClick={giveAccess} disabled={!selected || isPending}>
              <Plus className="h-4 w-4" />
              {isPending ? "Giving access…" : "Give access"}
            </Button>
          </div>
        )}
        {error && (
          <p className="text-destructive inline-flex items-center gap-1.5 text-sm" role="alert">
            <CircleAlert className="h-4 w-4 shrink-0" /> {error}
          </p>
        )}
      </footer>
    </section>
  );
}
