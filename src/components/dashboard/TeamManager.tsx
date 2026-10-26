// src/components/dashboard/TeamManager.tsx
"use client";

import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { ConfirmDialog } from "~/components/menu-editor/ConfirmDialog";
import { UserAvatar } from "~/components/admin/UserList";
import {
  InvitationsPanel,
  type PendingInvite,
} from "~/components/team/InvitationsPanel";
import { leaveRestaurant, removeRestaurantEditor } from "~/app/actions/team";
import type { AccessLevel } from "~/lib/access";

export interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  accessLevel: AccessLevel;
}

interface TeamManagerProps {
  restaurantId: string;
  restaurantName: string;
  // Owners and admins invite and remove editors; editors only see the team.
  canManage: boolean;
  currentUserId: string;
  members: TeamMember[];
  invites: PendingInvite[];
}

function MemberRow({
  member,
  restaurantId,
  restaurantName,
  canManage,
  isYou,
}: {
  member: TeamMember;
  restaurantId: string;
  restaurantName: string;
  canManage: boolean;
  isYou: boolean;
}) {
  const t = useTranslations("Team");
  const tRoles = useTranslations("Dashboard.accessLevels");
  const router = useRouter();
  const label = member.name ?? member.email ?? t("unknownPerson");

  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3 sm:px-6">
      <UserAvatar user={member} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {label}
          {isYou && (
            <span className="text-muted-foreground font-normal">
              {" "}
              ({t("you")})
            </span>
          )}
        </p>
        {member.name && member.email && (
          <p className="text-muted-foreground truncate text-xs" dir="ltr">
            {member.email}
          </p>
        )}
      </div>
      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
        {tRoles(member.accessLevel)}
      </span>
      {member.accessLevel === "editor" && isYou && (
        <ConfirmDialog
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" /> {t("leave")}
            </Button>
          }
          title={t("leaveTitle", { restaurant: restaurantName })}
          description={t("leaveText")}
          confirmLabel={t("leave")}
          pendingLabel={t("leaving")}
          onConfirm={async () => {
            const result = await leaveRestaurant(restaurantId);
            if (result.ok) router.push("/dashboard");
            return result;
          }}
        />
      )}
      {member.accessLevel === "editor" && canManage && !isYou && (
        <ConfirmDialog
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {t("remove")}
            </Button>
          }
          title={t("removeTitle", { name: label })}
          description={t("removeText", { restaurant: restaurantName })}
          confirmLabel={t("remove")}
          pendingLabel={t("removing")}
          onConfirm={() => removeRestaurantEditor(restaurantId, member.id)}
        />
      )}
    </li>
  );
}

export function TeamManager({
  restaurantId,
  restaurantName,
  canManage,
  currentUserId,
  members,
  invites,
}: TeamManagerProps) {
  const t = useTranslations("Team");
  const owners = members.filter((m) => m.accessLevel === "owner");
  const editors = members.filter((m) => m.accessLevel === "editor");

  return (
    <div className="space-y-6">
      {canManage && (
        <InvitationsPanel
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          invites={invites}
        />
      )}

      <section
        aria-labelledby="team-title"
        className="bg-card border-border rounded-xl border shadow-sm"
      >
        <header className="border-border border-b px-5 py-4 sm:px-6">
          <h2 id="team-title" className="text-base font-semibold">
            {t("membersTitle")}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {t("membersText")}
          </p>
        </header>
        {members.length === 0 ? (
          <p className="text-muted-foreground px-5 py-6 text-sm sm:px-6">
            {t("noMembers")}
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {[...owners, ...editors].map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                restaurantId={restaurantId}
                restaurantName={restaurantName}
                canManage={canManage}
                isYou={member.id === currentUserId}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
