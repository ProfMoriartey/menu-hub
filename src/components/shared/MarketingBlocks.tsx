// src/components/shared/MarketingBlocks.tsx
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

/** The opening of a marketing page: the page's heading and an intro. */
export function PageHero({
  title,
  intro,
  className,
}: {
  title: string;
  intro: string;
  className?: string;
}) {
  return (
    <section className={cn("container mx-auto max-w-3xl px-4 pt-16 pb-12 text-center sm:pt-24", className)}>
      <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{title}</h1>
      <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{intro}</p>
    </section>
  );
}

/** A section with a heading, as on the About page. */
export function PageSection({
  id,
  title,
  intro,
  children,
  className,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className={cn("container mx-auto max-w-5xl px-4 py-12", className)}>
      <h2 id={`${id}-title`} className="text-center text-3xl font-bold tracking-tight">
        {title}
      </h2>
      {intro && <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-center">{intro}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** The closing card that sends visitors on: a heading, a line and buttons. */
export function CtaCard({ title, text, children }: { title: string; text: string; children: ReactNode }) {
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
