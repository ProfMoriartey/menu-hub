// src/app/llms.txt/route.ts
import en from "~/messages/en.json";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "~/lib/site-contact";
import { SIGNUP_PAYMENT_METHODS } from "~/lib/billing";
import { FREE_MONTHS, MONTHS_PAID_PER_YEAR, OFFERED_TIERS, PLAN_CURRENCY, TIER_FEATURES, periodPrice } from "~/lib/plans";
import { routing } from "~/i18n/routing";
import { cachedPageOrigin } from "~/server/public-origin";
import { SITE_ALTERNATE_NAMES, SITE_NAME } from "~/server/site-structured-data";

// Built once per deploy: it only changes when the code or texts do.
export const dynamic = "force-static";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  tr: "Turkish",
  ar: "Arabic",
  es: "Spanish",
  ru: "Russian",
};

/**
 * /llms.txt: a plain summary of Menupedia for AI assistants (the llmstxt.org
 * format), so they describe it correctly and link to the right pages. The
 * features, plans and contact details come from the same sources as the
 * site, so this stays in step with it.
 */
export function GET() {
  const origin = cachedPageOrigin();
  const page = (path: string) => `${origin}/en${path}`;
  const languages = new Intl.ListFormat("en", { type: "conjunction" }).format(
    routing.locales.map((l) => LANGUAGE_NAMES[l] ?? l),
  );
  const features = Object.values(en.featuresPage.features).map(
    (f) => `- **${f.title}**: ${f.text}`,
  );
  // The ways to pay that sign-up offers, as the sign-up form names them:
  // "by card or cash".
  const payment = `by ${new Intl.ListFormat("en", { type: "disjunction" }).format(
    SIGNUP_PAYMENT_METHODS.map((m) => en.Start.methods[m].toLowerCase()),
  )}`;
  const plans = OFFERED_TIERS.map((tier) => {
    const { label, price } = TIER_FEATURES[tier];
    return `- **${label}**: ${price} ${PLAN_CURRENCY} a month, or ${periodPrice(price, "yearly")} ${PLAN_CURRENCY} a year (${12 - MONTHS_PAID_PER_YEAR} months free).`;
  });

  const text = `# ${SITE_NAME}

> ${SITE_NAME} (${SITE_ALTERNATE_NAMES.join(", ")}) is a digital menu service for restaurants, cafés, bakeries and other food businesses. Each restaurant gets a QR menu that guests open on their phone, in their own language, and that the restaurant updates itself in seconds.

${SITE_NAME} is software as a service (SaaS): a restaurant signs up, picks a plan and runs its menu from its own dashboard, with no app for guests to install. It works for restaurants in any country. The site and menus are available in ${languages}.

## Features

${features.join("\n")}

## Pricing

${plans.join("\n")}
- The first ${FREE_MONTHS} months are free, with nothing to pay during the trial. Prices are in US dollars.
- After the trial, pay ${payment}, monthly or yearly.
- Current plans: ${page("/pricing")}

## Pages

- [Home](${page("")}): what ${SITE_NAME} does, a working demo menu, pricing and contact
- [Features](${page("/features")}): everything a menu can do, with a live demo
- [Pricing](${page("/pricing")}): the plan, what it includes, the free trial and how to pay
- [Multilingual menus](${page("/multilingual-menu")}): one QR code, the menu in each guest's language
- [FAQ](${page("/faq")}): common questions from restaurants, answered
- [About](${page("/about")}): how ${SITE_NAME} works and who it is for
- [Menus](${page("/menus")}): restaurants and cafés with their menus on ${SITE_NAME}, with search across every dish
- [Sign up](${page("/start")}): create a restaurant and start the free trial
- [Privacy notice (KVKK)](${page("/kvkk")})

Every page also exists in the other languages: replace /en/ with /tr/, /ar/, /es/ or /ru/.

## Contact

- Email: ${CONTACT_EMAIL}
- Phone and WhatsApp: ${CONTACT_PHONE_DISPLAY}
`;

  return new Response(text, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
