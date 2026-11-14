import { cn } from "~/lib/utils";

type StampProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** The stamp's words, translated by the caller (e.g. "Sold out"). */
  children: React.ReactNode;
};

/**
 * The red SOLD OUT stamp, inked at a slant: the world's only ornament.
 * Position it yourself (it is inline). Uppercase follows the text's
 * language (Turkish dotted İ); Arabic is never letter-spaced.
 */
export function Stamp({ className, children, ...props }: StampProps) {
  return (
    <span
      className={cn(
        "border-sold-out text-sold-out bg-plate/85 inline-block w-fit -rotate-8 rounded-[3px] border-[2.5px] px-2 py-0.5 text-[0.8125rem] leading-tight font-extrabold tracking-[0.08em] whitespace-nowrap uppercase [[dir=rtl]_&]:rotate-8",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
