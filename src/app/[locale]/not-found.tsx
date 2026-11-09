// app/[locale]/not-found.tsx
// Shown for a missing menu, item or page (notFound() anywhere under
// [locale]), e.g. a QR code from a menu that was removed. Inside the locale
// layout, so it is in the visitor's language and right to left in Arabic.
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { SearchX } from "lucide-react";
import { Button } from "~/components/ui/button";

export default async function NotFound() {
  // Plain links: the locale-aware Link needs a translation provider in the
  // browser, which pages outside (site) don't load.
  const locale = await getLocale();
  const t = await getTranslations("NotFoundPage");
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <SearchX
          className="text-muted-foreground mx-auto h-12 w-12"
          aria-hidden
        />
        <h1 className="text-foreground mt-6 text-2xl font-bold text-balance">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-3 text-pretty">{t("text")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href={`/${locale}/menus`}>{t("browseMenus")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={`/${locale}`}>{t("home")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
