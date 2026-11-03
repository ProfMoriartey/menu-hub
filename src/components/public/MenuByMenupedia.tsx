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
    <footer className="text-muted-foreground px-4 pt-2 pb-8 text-center text-xs">
      <Link
        href="/"
        target="_blank"
        rel="noopener"
        className="hover:text-foreground rounded-sm underline-offset-2 transition-colors hover:underline"
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
