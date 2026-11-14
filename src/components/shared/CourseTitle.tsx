import type { ReactNode } from "react";

/** A section name between two thin rules, like a course on a printed menu (features menu, about's house rules). */
export function CourseTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-primary flex items-center gap-4 text-sm font-bold tracking-wide">
      <span className="bg-border h-px flex-1" aria-hidden />
      {children}
      <span className="bg-border h-px flex-1" aria-hidden />
    </h2>
  );
}
