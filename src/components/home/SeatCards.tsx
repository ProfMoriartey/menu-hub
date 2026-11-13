import { getTranslations } from "next-intl/server";
import { PlaceCard } from "~/components/table/PlaceCard";
import { LANGUAGE_NAMES, MENU_LANGUAGES, type MenuLanguage } from "~/lib/menu-languages";
import { cn } from "~/lib/utils";

// Where each seat sits around the phone on wide screens (percent of the
// table, logical sides so Arabic mirrors); narrower screens wrap them in a row.
const SEATS: Record<MenuLanguage, { tilt: number; spot: string }> = {
  en: { tilt: -4, spot: "lg:top-[4%] lg:start-[4%]" },
  tr: { tilt: 3, spot: "lg:top-[16%] lg:end-[3%]" },
  ar: { tilt: -2, spot: "lg:top-[47%] lg:start-[1%]" },
  es: { tilt: 4, spot: "lg:bottom-[15%] lg:end-[4%]" },
  ru: { tilt: -3, spot: "lg:bottom-[3%] lg:start-[22%]" },
};

/**
 * The five place cards, one per language; `active` is ringed in brass.
 * Real buttons, with no handler yet: the plate turn that makes one switch
 * the phone's language is ticket 4's.
 */
export async function SeatCards({ active }: { active: MenuLanguage }) {
  const t = await getTranslations("HomePage.hero");
  return (
    <div role="group" aria-label={t("seatsLabel")} className="flex flex-wrap justify-center gap-x-6 gap-y-7 px-3 lg:contents">
      {MENU_LANGUAGES.map((lang, i) => (
        <div key={lang} className={cn("lg:absolute", SEATS[lang].spot)}>
          <PlaceCard
            size="sm"
            label={t("seat", { n: i + 1 })}
            name={LANGUAGE_NAMES[lang]}
            tilt={SEATS[lang].tilt}
            active={lang === active}
          />
        </div>
      ))}
    </div>
  );
}
