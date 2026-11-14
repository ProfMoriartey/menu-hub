"use client";

import { useState } from "react";
import { LANGUAGE_NAMES, type MenuLanguage } from "~/lib/menu-languages";
import { PhoneShell } from "./DemoPhone";
import { SeatCards } from "./SeatCards";

/**
 * The hero's right column and its signature move: tap a place card and the
 * phone's menu turns to that language. The only client code of the hero;
 * the five screens are rendered on the server and this just picks one. The
 * seat starts as the page's language and never touches the site's URL.
 */
export function HeroStage({
  initial,
  screens,
  phoneLabel,
  seatsLabel,
  seatLabels,
  showing,
}: {
  initial: MenuLanguage;
  screens: Record<MenuLanguage, React.ReactNode>;
  phoneLabel: string;
  seatsLabel: string;
  /** "Seat 1" ... "Seat 5" in the page's language. */
  seatLabels: string[];
  /** "Showing the menu in {language}" with the placeholder as `{language}`. */
  showing: string;
}) {
  const [active, setActive] = useState(initial);
  // Silent on load; the plate turns and the live region speaks after a tap.
  const [turned, setTurned] = useState(false);

  return (
    <>
      {/* Phones: the cards come first, so they and the phone's header share the first screen. */}
      <div className="order-1 flex justify-center lg:order-none lg:absolute lg:left-1/2 lg:top-1/2 lg:w-[58%] lg:-translate-x-1/2 lg:-translate-y-1/2">
        <PhoneShell label={phoneLabel}>
          <div key={active} className={turned ? "plate-turn h-full" : "h-full"}>
            {screens[active]}
          </div>
        </PhoneShell>
      </div>
      <SeatCards
        active={active}
        groupLabel={seatsLabel}
        seatLabel={(n) => seatLabels[n - 1]!}
        onSelect={(lang) => {
          if (lang === active) return;
          setTurned(true);
          setActive(lang);
        }}
      />
      <p role="status" aria-live="polite" className="sr-only">
        {turned ? showing.replace("{language}", LANGUAGE_NAMES[active]) : ""}
      </p>
    </>
  );
}
