import { cn } from "~/lib/utils";
import { tableFontVariables } from "./fonts";

/**
 * The scope of The Table: its colours, its type (and their preloads) and
 * its focus rings apply only inside. Wrap a public page, or a public layout,
 * in this; the dashboard and admin stay outside it.
 */
export function TableWorld({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("table-world", tableFontVariables, className)} {...props} />
  );
}
