import { Plate } from "~/components/shared/Plate";

/** Numbered steps, each on a plate with its number above the title (home "How it works", pricing trial). */
export function StepPlates({ steps }: { steps: { id: string; title: string; text: string }[] }) {
  return (
    <ol className="grid justify-items-center gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {steps.map(({ id, title, text }, i) => (
        <li key={id} className="w-full max-w-80">
          <Plate size="fluid">
            <div className="flex w-[68%] flex-col items-center text-center">
              <span className="bg-primary text-primary-foreground flex size-[clamp(1.75rem,10cqw,2.25rem)] items-center justify-center rounded-full text-[clamp(0.9375rem,5.4cqw,1.0625rem)] font-bold tabular-nums">
                {i + 1}
              </span>
              <h3 className="mt-2text-[clamp(1.0625rem,6.2cqw,1.3125rem)] leading-tight font-bold rtl:leading-snug">{title}</h3>
              <p className="text-muted-foreground mt-2 text-[clamp(0.8125rem,4.5cqw,0.9375rem)] leading-snug">{text}</p>
            </div>
          </Plate>
        </li>
      ))}
    </ol>
  );
}
