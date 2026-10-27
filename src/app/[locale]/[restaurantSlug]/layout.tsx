// app/[locale]/[restaurantSlug]/layout.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redirect } from "~/i18n/navigation";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getRestaurantBySlug } from "~/server/public-menu";
import { getRestaurantRole } from "~/app/actions/auth";
import { PreviewBanner } from "~/components/public/PreviewBanner";
import { brandCss } from "~/lib/brand-color";
import { colorThemeCss } from "~/lib/color-theme";

interface DynamicPublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ restaurantSlug: string }>;
}

// A menu that isn't live yet must never show up in search results.
export async function generateMetadata({
  params,
}: Pick<DynamicPublicLayoutProps, "params">): Promise<Metadata> {
  const restaurant = await getRestaurantBySlug((await params).restaurantSlug);
  return restaurant && !restaurant.isActive
    ? { robots: { index: false, follow: false } }
    : {};
}

// Translations the client components on these pages use. Server components
// read every message on the server, so only these go to the browser, not the
// whole site's (dashboard, admin, marketing). A client component here that
// uses another namespace shows MISSING_MESSAGE: add it to this list.
const CLIENT_NAMESPACES = [
  "PublicMenu",
  "Availability",
  "LanguageSwitcher",
  "UnsavedChanges",
];

async function clientMessages(): Promise<AbstractIntlMessages> {
  const messages = (await getMessages()) as AbstractIntlMessages;
  const picked: AbstractIntlMessages = Object.fromEntries(
    CLIENT_NAMESPACES.map((namespace) => [
      namespace,
      messages[namespace] ?? {},
    ]),
  );
  // Dietary labels are shared with the menu editor; only that part is needed.
  const editor = messages.MenuEditor as AbstractIntlMessages | undefined;
  picked.MenuEditor = { dietary: editor?.dietary ?? {} };
  return picked;
}

/**
 * @description Public Route Gate for every public menu page (menu, /about,
 * /item). Active restaurants are open to everyone. Inactive ones are only
 * shown, as a preview, to people who can manage them; everyone else is sent
 * to the restaurants list.
 */
export default async function DynamicPublicLayout({
  children,
  params,
}: DynamicPublicLayoutProps) {
  const restaurantSlug = (await params).restaurantSlug;

  // 1. Fetch the restaurant (cached for this request; the pages reuse it)
  const restaurant = await getRestaurantBySlug(restaurantSlug);

  // 2. Check existence
  if (!restaurant) {
    // If the slug doesn't exist, return 404
    return notFound();
  }

  // The restaurant's own colours, when an admin has enabled them: its saved
  // theme, or the single brand colour picked before themes existed.
  const brand = !restaurant.brandColorEnabled
    ? null
    : restaurant.colorTheme
      ? colorThemeCss(restaurant.colorTheme)
      : restaurant.brandColor
        ? brandCss(restaurant.brandColor)
        : null;

  const withMessages = async (content: React.ReactNode) => (
    <NextIntlClientProvider messages={await clientMessages()}>
      {brand ? (
        // Its own background and text, so the page behind the menu matches.
        <div className="brand-scope bg-background text-foreground min-h-screen">
          {/* Built from validated #rrggbb values only (lib/color-theme). */}
          <style dangerouslySetInnerHTML={{ __html: brand }} />
          {content}
        </div>
      ) : (
        content
      )}
    </NextIntlClientProvider>
  );

  // 3. Live: everyone sees it. (Only inactive menus check who is asking, so
  // the public pages guests visit don't depend on sign-in at all.)
  if (restaurant.isActive) {
    return withMessages(children);
  }

  // 4. Not live yet: owners, editors and admins get a preview.
  if (await getRestaurantRole(restaurant.id)) {
    return withMessages(
      <>
        <PreviewBanner restaurantSlug={restaurant.slug} />
        {children}
      </>,
    );
  }

  return redirect({ href: "/menus", locale: await getLocale() });
}
