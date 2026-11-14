import Image from "next/image";
import { cn } from "~/lib/utils";

const PLATE_SIZES = {
  sm: "size-24",
  md: "size-48",
  lg: "size-80",
  // The home page's main plate. On phones it is wider than the screen, as
  // if seen up close: put it in a centred row that clips (overflow-x-hidden).
  hero: "size-[min(40rem,130vw)]",
  // As wide as its container (a column, a grid cell); give it a max width.
  fluid: "w-full aspect-square",
} as const;

type PlateProps = React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article";
  size?: keyof typeof PLATE_SIZES;
};

/**
 * A porcelain plate seen from above. Content sits centred in the well;
 * the caller keeps it inside the circle (padding of about a sixth of the
 * width keeps text off the rim).
 */
export function Plate({
  as: Tag = "div",
  size = "md",
  className,
  ...props
}: PlateProps) {
  return (
    <Tag
      className={cn(
        "table-plate flex shrink-0 flex-col items-center justify-center",
        PLATE_SIZES[size],
        className,
      )}
      {...props}
    />
  );
}

type PlatePhotoProps = {
  /** No photo yet: an empty plate is shown instead. */
  src?: string | null;
  /** Describe the dish; empty when the dish name is right next to it. */
  alt: string;
  /** Diameter in CSS pixels. */
  size?: number;
  priority?: boolean;
  className?: string;
};

/**
 * A dish photo on a round plate: the photo fills the well, a porcelain rim
 * and a soft shadow lift it off the page. Without a photo it is an empty
 * plate, which reads as "no picture" without a broken image or an icon.
 */
export function PlatePhoto({
  src,
  alt,
  size = 76,
  priority = false,
  className,
}: PlatePhotoProps) {
  const rim = Math.max(3, Math.round(size / 15));
  return (
    <span
      className={cn(
        "bg-plate relative inline-block shrink-0 overflow-hidden rounded-full shadow-[0_3px_8px_rgb(20_4_8/0.16)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          priority={priority}
          className="object-cover"
        />
      ) : null}
      {/* The porcelain rim, drawn over the photo's edge. */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `inset 0 0 0 ${rim}px var(--table-plate-rim), inset 0 0 0 ${rim + 1}px var(--table-plate-rim-shadow)`,
        }}
      />
    </span>
  );
}

/**
 * A rectangular porcelain platter, for content that needs rows (a list of
 * leader rows) where a round plate would not hold it. Same well, rim and
 * shadow as the plate.
 */
export function Platter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-plate text-ink rounded-[2rem] p-6 shadow-[0_18px_30px_rgb(20_4_8/0.35),inset_0_0_0_6px_var(--table-plate-rim),inset_0_0_0_7px_var(--table-plate-rim-shadow)] sm:p-9",
        "[--table-focus:var(--table-brass-ink)]",
        className,
      )}
      {...props}
    />
  );
}
