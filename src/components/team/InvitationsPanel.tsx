// src/components/team/InvitationsPanel.tsx
"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  CircleAlert,
  Copy,
  Link2,
  MessageCircle,
  RefreshCw,
  UserPlus,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { unwrap } from "~/lib/action-result";
import {
  cancelRestaurantInvite,
  createRestaurantInvite,
  type CreatedInvite,
} from "~/app/actions/team";

export interface PendingInvite {
  id: string;
  email: string;
  // Formatted on the server for the owner's language.
  expires: string;
}

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

// The link the owner just made: copy it, or hand it to WhatsApp, where most
// restaurant teams already talk.
function InviteLinkPanel({
  created,
  restaurantName,
  onClose,
}: {
  created: CreatedInvite;
  restaurantName: string;
  onClose: () => void;
}) {
  const t = useTranslations("Team");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(created.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (e.g. insecure context): the field stays selectable.
    }
  };
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    t("whatsappText", { restaurant: restaurantName, url: created.url }),
  )}`;

  return (
    <div
      className="border-primary/30 bg-primary/5 space-y-3 rounded-lg border p-4"
      role="status"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">
          {t("linkReady", { email: created.invite.email })}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="-me-2 -mt-2 h-8 w-8"
          onClick={onClose}
          aria-label={t("closeLink")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          readOnly
          value={created.url}
          dir="ltr"
          aria-label={t("linkLabel")}
          onFocus={(e) => e.currentTarget.select()}
          className="bg-background font-mono text-sm"
        />
        <div className="flex gap-2">
          <Button onClick={copy} className="flex-1 sm:flex-none">
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? t("copied") : t("copy")}
          </Button>
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        {t("linkHint", {
          email: created.invite.email,
          date: created.invite.expires,
        })}
      </p>
    </div>
  );
}

function InviteForm({
  restaurantId,
  onCreated,
}: {
  restaurantId: string;
  onCreated: (created: CreatedInvite) => void;
}) {
  const t = useTranslations("Team");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createRestaurantInvite(restaurantId, email);
      if (!result.ok) return setError(result.error);
      onCreated(result.data);
      setEmail("");
    });
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <Label htmlFor="invite-email">{t("emailLabel")}</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="invite-email"
          type="email"
          required
          autoComplete="off"
          inputMode="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          aria-invalid={error ? true : undefined}
          aria-describedby="invite-email-hint"
        />
        <Button
          type="submit"
          disabled={isPending || !email.trim()}
          className="shrink-0"
        >
          <Link2 className="h-4 w-4" />
          {isPending ? t("creating") : t("createLink")}
        </Button>
      </div>
      <p id="invite-email-hint" className="text-muted-foreground text-sm">
        {t("emailHint")}
      </p>
      {error && (
        <p
          className="text-destructive inline-flex items-center gap-1.5 text-sm"
          role="alert"
        >
          <CircleAlert className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
    </form>
  );
}

function InviteRow({
  invite,
  restaurantId,
  onNewLink,
  onError,
}: {
  invite: PendingInvite;
  restaurantId: string;
  onNewLink: (created: CreatedInvite) => void;
  onError: (message: string | null) => void;
}) {
  const t = useTranslations("Team");
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<void>) => {
    onError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        onError(errorText(err));
      }
    });
  };

  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3 sm:px-6">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium" dir="ltr">
          {invite.email}
        </p>
        <p className="text-muted-foreground text-xs">
          {t("expires", { date: invite.expires })}
        </p>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          // The old link can't be shown again (only its hash is kept), so
          // this makes a fresh one and the old one stops working.
          onClick={() =>
            run(async () => {
              const result = await createRestaurantInvite(
                restaurantId,
                invite.email,
              );
              unwrap(result);
              if (result.ok) onNewLink(result.data);
            })
          }
        >
          <RefreshCw className="h-3.5 w-3.5" /> {t("newLink")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={isPending}
          onClick={() =>
            run(async () =>
              unwrap(await cancelRestaurantInvite(restaurantId, invite.id)),
            )
          }
        >
          {t("cancelInvite")}
        </Button>
      </div>
    </li>
  );
}

/**
 * Inviting editors by link and the list of open invitations. Shared by the
 * owner's Team tab and the admin People tab, so both work the same way; the
 * server actions accept owners and system admins.
 */
export function InvitationsPanel({
  restaurantId,
  restaurantName,
  invites,
}: {
  restaurantId: string;
  restaurantName: string;
  invites: PendingInvite[];
}) {
  const t = useTranslations("Team");
  const [created, setCreated] = useState<CreatedInvite | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  return (
    <>
      <section
        aria-labelledby="invite-title"
        className="bg-card border-border space-y-4 rounded-xl border p-5 shadow-sm sm:p-6"
      >
        <div>
          <h2
            id="invite-title"
            className="flex items-center gap-2 text-base font-semibold"
          >
            <UserPlus className="h-4 w-4" aria-hidden /> {t("inviteTitle")}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {t("inviteText")}
          </p>
        </div>
        {created && (
          <InviteLinkPanel
            created={created}
            restaurantName={restaurantName}
            onClose={() => setCreated(null)}
          />
        )}
        <InviteForm restaurantId={restaurantId} onCreated={setCreated} />
      </section>

      {invites.length > 0 && (
        <section
          aria-labelledby="pending-title"
          className="bg-card border-border rounded-xl border shadow-sm"
        >
          <header className="border-border border-b px-5 py-4 sm:px-6">
            <h2 id="pending-title" className="text-base font-semibold">
              {t("pendingTitle")}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {t("pendingText")}
            </p>
          </header>
          <ul className="divide-border divide-y">
            {invites.map((invite) => (
              <InviteRow
                key={invite.id}
                invite={invite}
                restaurantId={restaurantId}
                onNewLink={setCreated}
                onError={setInviteError}
              />
            ))}
          </ul>
          {inviteError && (
            <p
              className="text-destructive border-border flex items-center gap-1.5 border-t px-5 py-3 text-sm sm:px-6"
              role="alert"
            >
              <CircleAlert className="h-4 w-4 shrink-0" /> {inviteError}
            </p>
          )}
        </section>
      )}
    </>
  );
}
