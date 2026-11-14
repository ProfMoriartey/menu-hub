"use client";

import { useEffect } from "react";

/**
 * On phones the dashboard's tab bar scrolls sideways; this brings the open
 * tab (aria-current="page") into view, so a tab further along isn't hidden.
 */
export function ActiveTabIntoView({ navId }: { navId: string }) {
  useEffect(() => {
    const nav = document.getElementById(navId);
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active) return;
    // Scroll the bar only, never the page.
    nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  }, [navId]);
  return null;
}
