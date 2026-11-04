// src/components/shared/FaqList.tsx
import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Questions that open to their answers. Plain <details>, so it works without
 * JavaScript and every answer is in the page for search engines and AI
 * assistants, even while closed.
 */
export function FaqList({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <div
      className={cn(
        "bg-card border-border divide-border divide-y rounded-2xl border shadow-sm",
        className,
      )}
    >
      {items.map(({ question, answer }) => (
        <details key={question} className="group px-5 py-4 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
            {question}
            <ChevronDown
              className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="text-muted-foreground mt-3 leading-relaxed">{answer}</p>
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
