// app/[locale]/not-found.tsx
// Shown for a missing menu, item or page (notFound() anywhere under
// [locale]), e.g. a QR code from a menu that was removed. Inside the locale
// layout, so it is in the visitor's language and right to left in Arabic.
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "~/components/ui/button";
import { Plate } from "~/components/table/Plate";
import { tableFontVariables } from "~/components/table/fonts";
import { cn } from "~/lib/utils";

export default async function NotFound() {
  // Plain links: the locale-aware Link needs a translation provider in the
  // browser, which pages outside (site) don't load.
  const locale = await getLocale();
  const t = await getTranslations("NotFoundPage");
  // In the world but light: The Table's ground and an empty plate (a guest
  // menu, a dish or a site page may have gone). No navbar, no client JS.
  return (
    <main
      className={cn(
        "table-world guest-menu flex min-h-screen items-center justify-center px-4 py-16",
        tableFontVariables,
      )}
    >
      <div className="max-w-md text-center">
        {/* An empty plate: nothing is served here. */}
        <Plate size="md" aria-hidden className="mx-auto size-36 sm:size-44" />
        <h1 className="text-on-ground mt-8 text-2xl font-extrabold tracking-[-0.02em] text-balance rtl:tracking-normal">
          {t("title")}
        </h1>
        <p className="text-on-ground-muted mt-3 text-pretty">{t("text")}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="table" size="pill">
            <Link href={`/${locale}/menus`}>{t("browseMenus")}</Link>
          </Button>
          <Link
            href={`/${locale}`}
            className="text-on-ground inline-flex min-h-11 items-center px-3 font-semibold underline underline-offset-4 hover:no-underline"
          >
            {t("home")}
          </Link>
        </div>
      </div>
    </main>
  );
}
