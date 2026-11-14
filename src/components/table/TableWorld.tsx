import { useLocale } from "next-intl";
import { preload } from "react-dom";
import { cn } from "~/lib/utils";
import { tableFontVariables } from "./fonts";

// The face each locale's headline is set in (public/fonts, see fonts.ts):
// preloaded so the first viewport does not swap after load.
const HEADLINE_FONT: Record<string, string> = {
  ar: "/fonts/noto-sans-arabic.woff2",
  ru: "/fonts/onest-cyrillic.woff2",
};

/**
 * The scope of The Table: its colours, its type (and their preloads) and
 * its focus rings apply only inside. Wrap a public page, or a public layout,
 * in this; the dashboard and admin stay outside it.
 */
export function TableWorld({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const locale = useLocale();
  preload(HEADLINE_FONT[locale] ?? "/fonts/bricolage-latin.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });
  return (
    <div className={cn("table-world", tableFontVariables, className)} {...props} />
  );
}
