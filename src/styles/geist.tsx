import { Geist } from "next/font/google";

/*
 * The dashboard and admin face. Imported only by their layouts, so public
 * pages (in The Table's fonts) never preload it. GeistVar sets the variable
 * on :root, where --font-sans reads it, so portals (dialogs) get it too.
 */
const geist = Geist({ subsets: ["latin"] });

export function GeistVar() {
  return <style>{`:root{--font-geist-sans:${geist.style.fontFamily}}`}</style>;
}
