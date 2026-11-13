import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LeaderRow } from "~/components/table/LeaderRow";
import { PlatePhoto } from "~/components/table/Plate";
import { Stamp } from "~/components/table/Stamp";
import { DEMO_RESTAURANT } from "~/lib/demo-menu";
import type { MenuLanguage } from "~/lib/menu-languages";
import { getDemoMenus } from "~/server/demo-menu";
import { cn } from "~/lib/utils";

// Lokanta Demo's own colour: the header band of its menu. White on it is
// 10:1, and it sits on the phone's screen, never on a dimmed plate.
const LOKANTA_GREEN = "#1f4a38";

/**
 * A phone lying on the table, showing the Lokanta Demo menu in `locale`.
 * One component for the first viewport and the "what guests see" section;
 * it only reads `locale`, so a client wrapper can turn it later. The screen
 * takes its language and direction from `locale`, not from the page.
 */
export async function DemoPhone({
  locale,
  label,
  priority = false,
  className,
}: {
  locale: MenuLanguage;
  /** Accessible name of the phone (already translated, in the page's language). */
  label: string;
  /** The first photo of the page's first phone only. */
  priority?: boolean;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "MenusPage" });
  const menu = getDemoMenus()[locale];
  let first = true;

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "bg-ink aspect-[9/19] w-full max-w-[min(17rem,78vw)] -rotate-6 rounded-[2.4rem] p-[0.55rem] shadow-[0_24px_40px_rgb(20_4_8/0.45)] [[dir=rtl]_&]:rotate-6",
        className,
      )}
    >
      <div
        lang={locale}
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="bg-plate text-ink relative h-full overflow-hidden rounded-[1.9rem] text-start"
      >
        <header className="flex items-center gap-2.5 px-4 pt-6 pb-3 text-white" style={{ backgroundColor: LOKANTA_GREEN }}>
          <Image src={DEMO_RESTAURANT.logoUrl} alt="" width={36} height={36} className="size-9 shrink-0 rounded-full bg-white" />
          <div className="min-w-0">
            <p dir="ltr" className="text-start text-[0.9375rem] leading-tight font-bold">
              {DEMO_RESTAURANT.name}
            </p>
            <p className="text-[0.6875rem] leading-snug">{menu.description}</p>
          </div>
        </header>
        <div className="space-y-3 px-3.5 py-3">
          {menu.categories.map((category) => (
            <section key={category.id}>
              <h3 className="text-[0.6875rem] leading-none font-extrabold tracking-[0.1em] uppercase rtl:tracking-normal">
                {category.name}
              </h3>
              <ul className="mt-2 space-y-2.5">
                {category.menuItems.slice(0, 2).map((dish) => {
                  const isFirst = first && !!dish.imageUrl;
                  if (isFirst) first = false;
                  const soldOut = dish.availability === "sold_out";
                  return (
                    <li key={dish.id} className="flex items-start gap-2.5">
                      <PlatePhoto src={dish.imageUrl} alt="" size={48} priority={priority && isFirst} />
                      <LeaderRow
                        nameAs="h4"
                        name={dish.name}
                        price={dish.displayPrice}
                        muted={soldOut}
                        className="min-w-0 flex-1"
                        nameClassName="text-[0.8125rem]"
                        priceClassName="text-[0.75rem]"
                      >
                        <p className="text-ink-muted mt-0.5 line-clamp-2 text-[0.6875rem] leading-snug">
                          {soldOut ? <Stamp className="text-[0.625rem]">{t("soldOut")}</Stamp> : dish.description}
                        </p>
                      </LeaderRow>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
