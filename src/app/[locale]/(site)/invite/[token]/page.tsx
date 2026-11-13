// app/[locale]/(site)/invite/[token]/page.tsx
import { type Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { SignIn, SignOutButton } from "@clerk/nextjs";
import { getLocale, getTranslations } from "next-intl/server";
import { CircleAlert, UserPlus } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import { Cloth } from "~/components/table/Cloth";
import { Platter } from "~/components/table/Plate";
import { TableWorld } from "~/components/table/TableWorld";
import { LanguageSwitcher } from "~/components/shared/LanguageSwitcher";
import { InviteResponse } from "~/components/dashboard/InviteResponse";
import {
  findInviteByToken,
  getVerifiedEmails,
  maskEmail,
} from "~/server/invites";

// A private link: never in search results, never sent on as a referrer.
export const metadata: Metadata = {
  title: "Invitation | Menupedia",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    // No navbar here, so the page brings its own world and main landmark.
    <TableWorld>
      <Cloth as="main" className="flex min-h-screen flex-col items-center px-4 py-10 sm:py-16">
        <div className="mb-8 flex w-full max-w-md justify-end">
          <LanguageSwitcher variant="cards" />
        </div>
        <Platter className="table-form w-full max-w-md space-y-5">{children}</Platter>
      </Cloth>
    </TableWorld>
  );
}

/**
 * Where an invitation link leads. The link finds the invitation; joining
 * also needs the invitee to be signed in with the invited email address
 * (checked again by the accept action).
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [t, locale, invite, { userId }] = await Promise.all([
    getTranslations("Invite"),
    getLocale(),
    findInviteByToken(token),
    auth(),
  ]);

  if (!invite) {
    return (
      <Card>
        <CircleAlert className="text-muted-foreground h-8 w-8" aria-hidden />
        <h1 className="text-xl font-semibold">{t("invalidTitle")}</h1>
        <p className="text-muted-foreground">{t("invalidText")}</p>
        <Button variant="table" size="pill" asChild>
          <Link href={userId ? "/dashboard" : "/"}>
            {userId ? t("toDashboard") : t("toHome")}
          </Link>
        </Button>
      </Card>
    );
  }

  const { restaurant } = invite;
  // Back here after signing in or up, in the same language.
  const here = `/${locale}/invite/${token}`;
  const heading = (
    <div className="flex items-center gap-4">
      <RestaurantLogo restaurant={restaurant} size="lg" />
      <div className="min-w-0">
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <UserPlus className="h-4 w-4" aria-hidden /> {t("eyebrow")}
        </p>
        <h1 className="truncate text-xl font-semibold">
          {t("title", { restaurant: restaurant.name })}
        </h1>
      </div>
    </div>
  );

  if (!userId) {
    return (
      <Card>
        {heading}
        <p className="text-muted-foreground">
          {t.rich("signInText", {
            email: maskEmail(invite.email),
            b: (chunks) => (
              <strong className="text-foreground font-medium" dir="ltr">
                {chunks}
              </strong>
            ),
          })}
        </p>
        {/* Sign in or create an account right here, then come back. */}
        <div className="flex justify-center">
          <SignIn
            withSignUp
            routing="hash"
            forceRedirectUrl={here}
            signUpForceRedirectUrl={here}
          />
        </div>
      </Card>
    );
  }

  const emails = await getVerifiedEmails(userId);
  if (!emails.includes(invite.email)) {
    return (
      <Card>
        {heading}
        <p className="text-muted-foreground">
          {t.rich("wrongAccountText", {
            email: maskEmail(invite.email),
            b: (chunks) => (
              <strong className="text-foreground font-medium" dir="ltr">
                {chunks}
              </strong>
            ),
          })}
        </p>
        <SignOutButton redirectUrl={here}>
          <Button variant="table" size="pill">{t("switchAccount")}</Button>
        </SignOutButton>
      </Card>
    );
  }

  return (
    <Card>
      {heading}
      <p className="text-muted-foreground">
        {t("acceptText", { restaurant: restaurant.name })}
      </p>
      <InviteResponse inviteId={invite.id} />
    </Card>
  );
}
