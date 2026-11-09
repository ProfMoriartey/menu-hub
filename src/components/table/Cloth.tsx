import { cn } from "~/lib/utils";

type ClothProps = React.HTMLAttributes<HTMLElement> & {
  /** The element to render; a section by default. */
  as?: "section" | "div" | "header" | "footer" | "main";
  /** "deep" is the darker cloth, for a band that should sit back. */
  tone?: "cloth" | "deep";
};

/** The wine-red woven linen every public page is laid on. */
export function Cloth({
  as: Tag = "section",
  tone = "cloth",
  className,
  ...props
}: ClothProps) {
  return (
    <Tag
      data-tone={tone}
      className={cn("table-cloth", className)}
      {...props}
    />
  );
}
