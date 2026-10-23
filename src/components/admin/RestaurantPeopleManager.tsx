// src/components/admin/RestaurantPeopleManager.tsx
"use client";

import { useState, useTransition } from "react";
import { Check, ChevronsUpDown, CircleAlert, Plus, TriangleAlert, Users } from "lucide-react";
import { unwrap } from "~/lib/action-result";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { ConfirmDialog } from "~/components/admin/ConfirmDialog";
import { RoleSelect } from "~/components/admin/UserAccessManager";
import { UserAvatar } from "~/components/admin/UserList";
import { assignRestaurantToUser, revokeRestaurantAccess } from "~/app/[locale]/admin/actions";
import type { AccessLevel } from "~/lib/access";

export interface PersonSummary {
  id: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
}

export type RestaurantPerson = PersonSummary & { accessLevel: AccessLevel };

const personLabel = (person: PersonSummary) => person.name ?? person.email ?? person.id;

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

function PersonRow({
  person,
  restaurantId,
  restaurantName,
  onError,
}: {
  person: RestaurantPerson;
  restaurantId: string;
  restaurantName: string;
  onError: (message: string | null) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const changeRole = (level: AccessLevel) => {
    if (level === person.accessLevel) return;
    onError(null);
    startTransition(async () => {
      try {
        unwrap(await assignRestaurantToUser(person.id, restaurantId, level));
      } catch (error) {
        onError(errorMessage(error, "Couldn't change the access level."));
      }
    });
  };

  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3 sm:flex-nowrap sm:px-6">
      <UserAvatar user={person} />
      <div className="min-w-0 flex-1">
        <Link href={`/admin/users/${person.id}`} className="block truncate font-medium hover:underline">
          {personLabel(person)}
        </Link>
        {person.name && person.email && (
          <p className="text-muted-foreground truncate text-xs">{person.email}</p>
        )}
      </div>
      <div className="flex w-full items-center gap-1 sm:w-auto">
        <div className="flex-1 sm:flex-none">
          <RoleSelect
            value={person.accessLevel}
            onChange={changeRole}
            disabled={isPending}
            label={`Access level for ${personLabel(person)}`}
          />
        </div>
        <ConfirmDialog
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={isPending}
            >
              Remove
            </Button>
          }
          title={`Remove ${personLabel(person)}?`}
          description={`They will no longer see ${restaurantName} on their dashboard. You can add them again at any time.`}
          confirmLabel="Remove access"
          pendingLabel="Removing…"
          onConfirm={() => revokeRestaurantAccess(person.id, restaurantId)}
        />
      </div>
    </li>
  );
}

function PersonPicker({
  people,
  selected,
  onSelect,
}: {
  people: PersonSummary[];
  selected: PersonSummary | null;
  onSelect: (person: PersonSummary) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal sm:w-72"
        >
          {selected ? (
            <span className="truncate">{personLabel(selected)}</span>
          ) : (
            <span className="text-muted-foreground">Choose a user…</span>
          )}
          <ChevronsUpDown className="text-muted-foreground h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 sm:w-72" align="start">
        <Command>
          <CommandInput placeholder="Search name or email…" />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {people.map((person) => (
                <CommandItem
                  key={person.id}
                  value={`${person.name ?? ""} ${person.email ?? ""} ${person.id}`}
                  onSelect={() => {
                    onSelect(person);
                    setOpen(false);
                  }}
                >
                  <UserAvatar user={person} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{personLabel(person)}</p>
                    {person.name && person.email && (
                      <p className="text-muted-foreground truncate text-xs">{person.email}</p>
                    )}
                  </div>
                  {selected?.id === person.id && <Check className="h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface RestaurantPeopleManagerProps {
  restaurantId: string;
  restaurantName: string;
  people: RestaurantPerson[];
  candidates: PersonSummary[];
}

export function RestaurantPeopleManager({
  restaurantId,
  restaurantName,
  people,
  candidates,
}: RestaurantPeopleManagerProps) {
  const [selected, setSelected] = useState<PersonSummary | null>(null);
  const [level, setLevel] = useState<AccessLevel>("editor");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const owners = people.filter((p) => p.accessLevel === "owner");
  const editors = people.filter((p) => p.accessLevel === "editor");

  const addPerson = () => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      try {
        unwrap(await assignRestaurantToUser(selected.id, restaurantId, level));
        setSelected(null);
      } catch (err) {
        setError(errorMessage(err, "Couldn't give access."));
      }
    });
  };

  return (
    <section aria-labelledby="people-title" className="bg-card border-border rounded-xl border shadow-sm">
      <header className="border-border border-b px-5 py-4 sm:px-6">
        <h2 id="people-title" className="text-base font-semibold">
          People with access
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          <strong className="text-foreground font-medium">Owners</strong> can edit {restaurantName}&apos;s
          details and its menu; <strong className="text-foreground font-medium">editors</strong> can edit
          the menu only. System admins always have full access.
        </p>
      </header>

      {people.length > 0 && owners.length === 0 && (
        <p className="bg-attention/10 text-foreground border-border flex items-start gap-2 border-b px-5 py-3 text-sm sm:px-6">
          <TriangleAlert className="text-attention mt-0.5 h-4 w-4 shrink-0" />
          No one is an owner yet, so only admins can change this restaurant&apos;s details. Set someone&apos;s
          role to Owner if they should manage them.
        </p>
      )}

      {people.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <Users className="text-muted-foreground mb-3 h-8 w-8" />
          <p className="font-medium">No one has access yet</p>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            Add a user below so they can manage {restaurantName} from their dashboard.
          </p>
        </div>
      ) : (
        <ul className="divide-border divide-y">
          {[...owners, ...editors].map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              restaurantId={restaurantId}
              restaurantName={restaurantName}
              onError={setError}
            />
          ))}
        </ul>
      )}

      <footer className="bg-muted/30 border-border space-y-2 border-t px-5 py-4 sm:px-6">
        {candidates.length === 0 ? (
          <p className="text-muted-foreground text-sm">Every user already has access to this restaurant.</p>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <PersonPicker people={candidates} selected={selected} onSelect={setSelected} />
            <RoleSelect value={level} onChange={setLevel} label="Access level" />
            <Button onClick={addPerson} disabled={!selected || isPending}>
              <Plus className="h-4 w-4" />
              {isPending ? "Adding…" : "Add person"}
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
