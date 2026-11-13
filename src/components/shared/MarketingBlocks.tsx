// src/components/shared/MarketingBlocks.tsx
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Cloth } from "~/components/table/Cloth";
import { cn } from "~/lib/utils";

/** A quiet text link on the cloth: underlined, 44 px tall, brass focus. */
export const CLOTH_LINK =
  "text-on-cloth inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-bold underline underline-offset-4 outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[var(--table-focus)]";

/** The opening of a page on The Table: the one h1 and an intro on the cloth, then any actions. */
export function ClothHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  return (
    <Cloth as="section">
      <div className="mx-auto max-w-3xl px-4 pt-14 pb-12 text-center sm:pt-20 lg:pb-16">
        {eyebrow && (
          <p className="text-on-cloth-muted text-sm font-bold tracking-[0.12em] uppercase rtl:tracking-normal">{eyebrow}</p>
        )}
        <h1 className="text-on-cloth mt-3 text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl rtl:leading-snug rtl:tracking-normal">
          {title}
        </h1>
        <p className="text-on-cloth-muted mx-auto mt-4 max-w-2xl text-lg text-pretty">{intro}</p>
        {children && <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">{children}</div>}
      </div>
    </Cloth>
  );
}

export interface PlatterItem {
  id: string;
  title: string;
  text: string;
  /** A link under the text, to a page of its own. */
  link?: { href: string; label: string };
}

/** Items of a menu section: a bold name and a plain line, dotted rules between. Put it in a `Platter`. */
export function PlatterList({ items, className }: { items: PlatterItem[]; className?: string }) {
  return (
    <ul className={cn("divide-plate-rim-shadow divide-y divide-dotted [&>li]:py-4 [&>li:first-child]:pt-0 [&>li:last-child]:pb-0", className)}>
      {items.map(({ id, title, text, link }) => (
        <li key={id}>
          <h3 className="text-lg leading-snug font-bold">{title}</h3>
          <p className="text-ink-muted mt-1 leading-relaxed">{text}</p>
          {link && (
            <Link
              href={link.href}
              className="text-cloth-ink mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-full font-bold underline underline-offset-4 outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[var(--table-focus)]"
            >
              {link.label}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

/** The opening of a marketing page: a small label, the page's heading and an intro. */
export function PageHero({
  eyebrow,
  title,
  intro,
  className,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  className?: string;
}) {
  return (
    <section className={cn("container mx-auto max-w-3xl px-4 pt-16 pb-12 text-center sm:pt-24", className)}>
      {eyebrow && (
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">{eyebrow}</p>
      )}
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{title}</h1>
      <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{intro}</p>
    </section>
  );
}

/**
 * A section with a heading, as on the About page. With `tone` it is a band
 * of cloth (full width) with the heading on it: the Table's section, used by
 * the home page. Without it, the old look (pages not yet moved to the Table).
 */
export function PageSection({
  id,
  title,
  intro,
  children,
  className,
  tone,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
  tone?: "cloth" | "deep";
}) {
  const head = (
    <>
      <h2
        id={`${id}-title`}
        className={cn(
          "text-center text-3xl font-bold tracking-tight",
          tone && "text-on-cloth text-4xl font-extrabold tracking-[-0.03em] text-balance rtl:tracking-normal rtl:leading-snug",
        )}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={cn(
            "mx-auto mt-3 max-w-2xl text-center",
            tone ? "text-on-cloth-muted text-lg" : "text-muted-foreground",
          )}
        >
          {intro}
        </p>
      )}
    </>
  );
  if (tone) {
    return (
      <Cloth as="section" tone={tone} id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20">
        <div className={cn("container mx-auto max-w-6xl px-4 py-16 lg:py-24", className)}>
          {head}
          <div className="mt-10 lg:mt-14">{children}</div>
        </div>
      </Cloth>
    );
  }
  return (
    <section aria-labelledby={`${id}-title`} className={cn("container mx-auto max-w-5xl px-4 py-12", className)}>
      {head}
      <div className="mt-8">{children}</div>
    </section>
  );
}

/**
 * The closing card that sends visitors on: a heading, a line and buttons.
 * With `tone` it is a band of cloth with the text on it (the Table's close).
 */
export function CtaCard({
  title,
  text,
  children,
  tone,
  id,
}: {
  title: string;
  text: string;
  children: ReactNode;
  tone?: "cloth" | "deep";
  id?: string;
}) {
  if (tone) {
    return (
      <Cloth as="section" tone={tone} id={id} aria-labelledby={id ? `${id}-title` : undefined} aria-label={id ? undefined : title} className="scroll-mt-20">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center lg:py-24">
          <h2 id={id ? `${id}-title` : undefined} className="text-on-cloth text-4xl font-extrabold tracking-[-0.03em] text-balance rtl:tracking-normal rtl:leading-snug">
            {title}
          </h2>
          <p className="text-on-cloth-muted mx-auto mt-4 max-w-xl text-lg">{text}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">{children}</div>
        </div>
      </Cloth>
    );
  }
  return (
    <section aria-label={title} className="container mx-auto px-4 pt-4 pb-24">
      <div className="bg-card border-border mx-auto max-w-3xl rounded-2xl border px-6 py-12 text-center shadow-sm sm:px-12">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-3">{text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
      </div>
    </section>
  );
}
