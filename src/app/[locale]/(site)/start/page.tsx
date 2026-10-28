// app/[locale]/(site)/start/page.tsx
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import { and, eq, isNull } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { Clock } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { StartForm } from "~/components/plans/StartForm";
import { db } from "~/server/db";
import { planRequests } from "~/server/db/schema";
import { getPublicOrigin } from "~/server/public-origin";
import { getVisitorCountry } from "~/server/visitor-country";
import { countryOptions } from "~/lib/countries";
import { isTier } from "~/lib/plans";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Start");
  return { title: t("metaTitle"), description: t("intro") };
}

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * Sign-up: create an account (or sign in), then the restaurant, with a
 * plan and how they'd like to pay. ?plan=pro&cycle=yearly comes from the
 * pricing section. Someone whose sign-up is waiting for approval is told
 * so instead.
 */
export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const plan = one(params.plan);
  const tier = isTier(plan) ? plan : "pro";
  const cycle = one(params.cycle) === "yearly" ? "yearly" : "monthly";
  const [t, locale, { userId }] = await Promise.all([getTranslations("Start"), getLocale(), auth()]);
  const here = `/${locale}/start?plan=${tier}&cycle=${cycle}`;

  const header = (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("title")}</h1>
      <p className="text-muted-foreground mt-3 text-lg">{t("intro")}</p>
    </div>
  );

  if (!userId) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-12">
        {header}
        <div className="bg-card border-border max-w-2xl space-y-4 rounded-2xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{t("signInTitle")}</h2>
          <p className="text-muted-foreground text-sm">{t("signInText")}</p>
          <div className="flex justify-center">
            <SignIn withSignUp routing="hash" forceRedirectUrl={here} signUpForceRedirectUrl={here} />
          </div>
        </div>
      </div>
    );
  }

  const waiting = await db.query.planRequests.findFirst({
    where: and(
      eq(planRequests.requestedBy, userId),
      eq(planRequests.kind, "signup"),
      isNull(planRequests.resolution),
    ),
    with: { restaurant: { columns: { name: true, slug: true } } },
  });
  if (waiting) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-12">
        {header}
        <div className="bg-primary/5 border-primary/20 flex max-w-2xl items-start gap-3 rounded-2xl border p-6">
          <Clock className="text-primary mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div className="space-y-3">
            <h2 className="font-semibold">{t("waitingTitle", { name: waiting.restaurant.name })}</h2>
            <p className="text-muted-foreground text-sm">{t("waitingText")}</p>
            <Button asChild>
              <Link href={`/dashboard/${waiting.restaurant.slug}/menu`}>{t("toDashboard")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const [origin, visitorCountry] = await Promise.all([getPublicOrigin(), getVisitorCountry()]);
  return (
    <div className="container mx-auto space-y-10 px-4 py-12">
      {header}
      <StartForm
        initialTier={tier}
        initialCycle={cycle}
        countries={countryOptions(locale)}
        defaultCountry={visitorCountry}
        addressPrefix={`${origin.replace(/^https?:\/\//, "")}/`}
      />
    </div>
  );
}
