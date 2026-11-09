import { cn } from "~/lib/utils";

type LeaderRowProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  as?: "div" | "li";
  /** The dish name. Long names wrap; the dots follow the last line. */
  name: React.ReactNode;
  /** The element for the name, e.g. "h3" in a menu section. */
  nameAs?: "span" | "h3" | "h4" | "p";
  /** The formatted price (the caller formats for the locale). */
  price: React.ReactNode;
  /** Lines under the name: description, tags. */
  children?: React.ReactNode;
  /** Sold out: name and price step back. Pair with <Stamp>. */
  muted?: boolean;
  nameClassName?: string;
  /** e.g. the restaurant's brand colour for the price. */
  priceClassName?: string;
};

/**
 * name ··········· price. The leader fills the space between, prices line
 * up on the end edge, and right-to-left flips it with no extra code.
 */
export function LeaderRow({
  as: Tag = "div",
  name,
  nameAs: Name = "span",
  price,
  children,
  muted = false,
  className,
  nameClassName,
  priceClassName,
  ...props
}: LeaderRowProps) {
  return (
    <Tag className={cn(muted && "text-ink-muted", className)} {...props}>
      <div className="flex gap-1.5 [align-items:last_baseline]">
        <Name
          className={cn(
            "min-w-0 text-base leading-snug font-bold [overflow-wrap:anywhere]",
            nameClassName,
          )}
        >
          {name}
        </Name>
        <span aria-hidden className="table-leader" />
        <span
          className={cn(
            "shrink-0 text-[0.9375rem] font-bold whitespace-nowrap tabular-nums",
            muted && "line-through decoration-1",
            priceClassName,
          )}
        >
          {price}
        </span>
      </div>
      {children}
    </Tag>
  );
}
