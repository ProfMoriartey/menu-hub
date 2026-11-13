// src/components/public/MenuByMenupedia.tsx
import { getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";

/**
 * "Menu by Menupedia", small at the foot of every public restaurant page
 * (menu, branch, about, dish). Guests and other owners who like a menu can
 * find where it was made, and every menu links to the home page. It opens in
 * a new tab so a guest who taps it keeps their place in the menu.
 */
export async function MenuByMenupedia() {
  const t = await getTranslations("PublicMenu");
  return (
    <footer className="text-on-ground-muted px-4 pt-4 pb-8 text-center text-sm">
      <Link
        href="/"
        target="_blank"
        // Guests on mobile data shouldn't download the home page per menu view.
        prefetch={false}
        rel="noopener"
        className="hover:text-on-ground inline-block rounded-sm px-2 py-3 underline-offset-2 transition-colors hover:underline"
      >
        {t.rich("madeWith", {
          brand: (chunks) => (
            <span className="font-semibold" dir="ltr">
              {chunks}
            </span>
          ),
        })}
      </Link>
    </footer>
  );
}
