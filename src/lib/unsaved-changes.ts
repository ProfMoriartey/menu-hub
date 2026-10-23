// src/lib/unsaved-changes.ts
"use client";

import { useEffect } from "react";

// How many mounted forms currently hold unsaved edits.
let dirtyForms = 0;

/**
 * True while any form on the page has unsaved edits. For actions that leave
 * the page without a link, such as switching language.
 */
export const hasUnsavedChanges = () => dirtyForms > 0;

/**
 * While `isDirty` is true, asks before the edits are lost:
 * - refreshing or closing the tab (the browser's own prompt);
 * - following a link to another page of the app (`message`).
 * Pass false while saving, so a save that navigates afterwards isn't stopped.
 */
export function useUnsavedChangesGuard(isDirty: boolean, message: string) {
  useEffect(() => {
    if (!isDirty) return;
    dirtyForms++;

    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();

    // Capture phase on the document runs before React's handlers, so a
    // cancelled click never reaches next/link's client-side navigation.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      if ((link.target && link.target !== "_self") || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      // Other sites unload the page, which onBeforeUnload already covers.
      if (url.origin !== window.location.origin) return;
      // Same page (e.g. a #section link): nothing is lost.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      if (!window.confirm(message)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      dirtyForms--;
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [isDirty, message]);
}
