// src/components/dashboard/InviteResponse.tsx
"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, CircleAlert } from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import {
  acceptRestaurantInvite,
  declineRestaurantInvite,
} from "~/app/actions/team";

// Accept or decline an invitation addressed to the signed-in user. The server
// checks the address again; this only offers the choice.
export function InviteResponse({ inviteId }: { inviteId: string }) {
  const t = useTranslations("Invite");
  const router = useRouter();
  const [declined, setDeclined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const accept = () => {
    setError(null);
    startTransition(async () => {
      const result = await acceptRestaurantInvite(inviteId);
      if (result.ok) router.push(`/dashboard/${result.data.slug}/menu`);
      else setError(result.error);
    });
  };

  const decline = () => {
    setError(null);
    startTransition(async () => {
      const result = await declineRestaurantInvite(inviteId);
      if (result.ok) {
        setDeclined(true);
        router.refresh();
      } else setError(result.error);
    });
  };

  if (declined) {
    return <p className="text-muted-foreground text-sm">{t("declined")}</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button onClick={accept} disabled={isPending}>
          <Check className="h-4 w-4" />
          {isPending ? t("joining") : t("accept")}
        </Button>
        <Button variant="ghost" onClick={decline} disabled={isPending}>
          {t("decline")}
        </Button>
      </div>
      {error && (
        <p
          className="text-destructive inline-flex items-center gap-1.5 text-sm"
          role="alert"
        >
          <CircleAlert className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
