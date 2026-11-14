// src/components/shared/FaqList.tsx
import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Questions that open to their answers, as rows on a `Platter`. Plain <details>, so it works without
 * JavaScript and every answer is in the page for search engines and AI
 * assistants, even while closed.
 */
export function FaqList({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <div className={cn("divide-plate-rim-shadow divide-y divide-dotted", className)}>
      {items.map(({ question, answer }) => (
        <details key={question} className="group py-1">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-2 font-bold outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[var(--table-focus)] [&::-webkit-details-marker]:hidden">
            {question}
            <ChevronDown
              className="text-ink-muted size-5 shrink-0 transition-transform motion-reduce:transition-none group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="text-ink-muted pb-3 leading-relaxed">{answer}</p>
        </details>
      ))}
    </div>
  );
}

/**
 * schema.org FAQPage data for the same questions. Google keeps its FAQ
 * result style for a few kinds of sites, but the data still tells search
 * engines and AI assistants which answer goes with which question.
 */
export function faqStructuredData(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}
