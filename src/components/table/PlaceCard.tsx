import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "~/lib/utils";

type PlaceCardProps = Omit<React.ComponentProps<"button">, "children"> & {
  /** The small line on top, e.g. "Seat 1" (already translated). */
  label: React.ReactNode;
  /** The card's name: a language ("Türkçe") or a page. */
  name: React.ReactNode;
  /** Rotation in degrees; mirrored in right-to-left pages. */
  tilt?: number;
  /** The current seat: ringed in brass. */
  active?: boolean;
  /** The words' direction, e.g. "rtl" for an Arabic card on any page. */
  dir?: "ltr" | "rtl";
  /** "sm" for crowded tables (phones). */
  size?: "md" | "sm";
  /**
   * Render your own link (e.g. next-intl's Link) as the card: pass it as the
   * only child and it receives the card's classes. Set aria-current on it
   * yourself.
   */
  asChild?: boolean;
  children?: React.ReactElement;
};

/**
 * The white place card: the world's vocabulary for languages and
 * navigation. A real button (or link with asChild), at least 44 px tall,
 * with a visible brass focus ring.
 */
export function PlaceCard({
  label,
  name,
  tilt = 0,
  active = false,
  size = "md",
  dir,
  asChild = false,
  className,
  style,
  children,
  ...props
}: PlaceCardProps) {
  // The card's own language direction applies to its words only, so the
  // card itself still lays out (and is positioned) in the page's direction.
  const body = (
    <span dir={dir} className="flex flex-col items-start gap-1">
      <small className="text-place-card-muted text-[0.625rem] leading-none font-bold tracking-[0.12em] uppercase">
        {label}
      </small>
      <span className={cn("leading-tight font-bold", size === "sm" ? "text-[0.9375rem]" : "text-[1.25rem]")}>
        {name}
      </span>
    </span>
  );
  const classes = cn(
    "bg-place-card text-place-card-ink inline-flex min-h-11 min-w-11 cursor-pointer flex-col justify-center rounded-[4px] text-start",
    size === "sm" ? "px-3 pt-2 pb-1.5" : "px-4.5 pt-3 pb-2.5",
    "shadow-[0_12px_20px_rgb(20_4_8/0.3)]",
    // Tilted on the table; mirrored on right-to-left pages (an ancestor's
    // dir, so an Arabic card on an English page keeps its tilt).
    "rotate-[var(--tilt)] [[dir=rtl]_&]:rotate-[calc(var(--tilt)*-1)]",
    "motion-safe:transition-[translate,box-shadow] motion-safe:duration-200 motion-safe:ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_24px_rgb(20_4_8/0.34)]",
    // Brass ring for the current seat (keyboard focus adds its own ring).
    active && "outline-brass outline-3 outline-offset-3 outline-solid",
    className,
  );
  const tiltStyle = { "--tilt": `${tilt}deg`, ...style } as React.CSSProperties;

  if (asChild && children) {
    return (
      <Slot data-active={active || undefined} className={classes} style={tiltStyle}>
        <Slottable>{children}</Slottable>
        {body}
      </Slot>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={active}
      data-active={active || undefined}
      className={classes}
      style={tiltStyle}
      {...props}
    >
      {body}
    </button>
  );
}
