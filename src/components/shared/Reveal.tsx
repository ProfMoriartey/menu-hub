// src/components/shared/Reveal.tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "~/lib/utils";

// Where the content slides in from. "start" and "end" follow the reading
// direction, so they mirror in Arabic.
const HIDDEN = {
  start: "motion-safe:-translate-x-16 rtl:motion-safe:translate-x-16",
  end: "motion-safe:translate-x-16 rtl:motion-safe:-translate-x-16",
  bottom: "motion-safe:translate-y-12",
};

/**
 * Slides its content into place the first time it scrolls into view.
 * With reduced motion it is simply there. Meant for decoration (the
 * doodles), never for text people need to read without JavaScript.
 */
export function Reveal({
  from = "bottom",
  delay = 0,
  className,
  children,
}: {
  from?: keyof typeof HIDDEN;
  // In milliseconds.
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,translate] duration-1000 ease-out",
        shown ? "translate-x-0 translate-y-0 opacity-100" : cn("motion-safe:opacity-0", HIDDEN[from]),
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A doodle that slides in, then bobs gently. */
export function DoodleReveal({
  from,
  delay,
  className,
  children,
}: {
  from?: keyof typeof HIDDEN;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Reveal from={from} delay={delay} className={className}>
      <div className="motion-safe:animate-doodle-float" aria-hidden>
        {children}
      </div>
    </Reveal>
  );
}
