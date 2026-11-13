import { getLocale, getTranslations } from "next-intl/server";
import { PageSection } from "~/components/shared/MarketingBlocks";
import { PlatePhoto } from "~/components/table/Plate";
import { Stamp } from "~/components/table/Stamp";
import { isMenuLanguage } from "~/lib/menu-languages";
import { getDemoMenus } from "~/server/demo-menu";
import { DemoPhone } from "./DemoPhone";

const POINTS = ["p1", "p2", "p3", "p4"] as const;

/** What a guest gets: the phone in the page's language, and the food on round plates. */
export async function GuestsSee() {
  const [t, tMenus, locale] = await Promise.all([
    getTranslations("HomePage.guests"),
    getTranslations("MenusPage"),
    getLocale(),
  ]);
  const lang = isMenuLanguage(locale) ? locale : "en";
  const dishes = getDemoMenus()
    [lang].categories.flatMap((c) => c.menuItems)
    .filter((d) => d.imageUrl?.startsWith("/demo/"))
    .slice(0, 4);

  return (
    <PageSection id="guests" tone="deep" title={t("title")} intro={t("intro")}>
      <div className="grid items-center gap-14 lg:grid-cols-[auto_1fr] lg:gap-20">
        <div className="flex justify-center lg:px-10">
          <DemoPhone locale={lang} label={t("caption")} />
        </div>
        <div>
          <ul className="text-on-cloth text-lg font-bold">
            {POINTS.map((p) => (
              <li key={p} className="border-on-cloth/40 border-b-2 border-dotted py-3 first:pt-0">
                {t(p)}
              </li>
            ))}
          </ul>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {dishes.map((d) => (
              <li key={d.id} className="flex flex-col items-center gap-3 text-center">
                <span className="relative">
                  <PlatePhoto src={d.imageUrl} alt="" size={96} />
                  {d.availability === "sold_out" && (
                    <Stamp className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[0.6875rem] rtl:translate-x-1/2">
                      {tMenus("soldOut")}
                    </Stamp>
                  )}
                </span>
                <span className="text-on-cloth text-sm leading-snug font-bold">{d.name}</span>
              </li>
            ))}
          </ul>
          <p className="text-on-cloth-muted mt-8 text-sm">{t("caption")}</p>
        </div>
      </div>
    </PageSection>
  );
}
