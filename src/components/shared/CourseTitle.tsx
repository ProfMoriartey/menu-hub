import type { ReactNode } from "react";

/** A section name between two thin rules, like a course on a printed menu (features menu, about's house rules, the price card). */
export function CourseTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-primary flex items-center gap-4 text-sm font-bold tracking-wide">
      <span className="bg-border h-px flex-1" aria-hidden />
      {children}
      <span className="bg-border h-px flex-1" aria-hidden />
    </h2>
  );
}

/** Numbered one-liners under a course: "1. Title. Text" (about's house rules, the trial on the price card). */
export function NumberedLines({ items }: { items: { id: string; title: string; text: string }[] }) {
  return (
    <ol className="mt-6 space-y-4">
      {items.map((item, i) => (
        <li key={item.id} className="flex gap-4">
          <span className="text-primary w-5 shrink-0 text-lg font-bold tabular-nums" aria-hidden>
            {i + 1}.
          </span>
          <p className="text-lg">
            <span className="font-semibold">{item.title}.</span>{" "}
            <span className="text-muted-foreground">{item.text}</span>
          </p>
        </li>
      ))}
    </ol>
  );
}
