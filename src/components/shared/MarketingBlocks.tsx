// src/components/shared/MarketingBlocks.tsx
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

/** A section with a heading on a napkin (home, pricing and multilingual questions). */
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
      <div className="napkin mx-auto w-fit max-w-2xl px-6 py-4 text-center">
        <h2 id={`${id}-title`} className="text-3xl font-bold tracking-tight text-balance">
          {title}
        </h2>
        {intro && <p className="text-muted-foreground mt-3">{intro}</p>}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
