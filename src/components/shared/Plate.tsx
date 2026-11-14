import { cn } from "~/lib/utils";

const PLATE_SIZES = {
  sm: "size-24",
  md: "size-48",
  lg: "size-80",
  // As wide as its container (a column, a grid cell); give it a max width.
  fluid: "w-full aspect-square",
} as const;

type PlateProps = React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article";
  size?: keyof typeof PLATE_SIZES;
};

/**
 * A plate seen from above (from the Table redesign; colours are the --plate
 * tokens in globals.css). Content sits centred in the well; the caller keeps
 * it inside the circle (padding of about a sixth of the width keeps text
 * off the rim).
 */
export function Plate({ as: Tag = "div", size = "md", className, ...props }: PlateProps) {
  return (
    <Tag
      className={cn("plate flex shrink-0 flex-col items-center justify-center", PLATE_SIZES[size], className)}
      {...props}
    />
  );
}
