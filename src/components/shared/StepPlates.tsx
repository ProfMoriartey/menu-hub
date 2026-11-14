import { getTranslations } from "next-intl/server";
import { cn } from "~/lib/utils";
import { Plate } from "~/components/table/Plate";

/** Steps as plates, each with its number on a card tucked under the rim (the home's "How it works"). */
export async function StepPlates({ steps }: { steps: { id: string; title: string; text: string }[] }) {
  const t = await getTranslations("HomePage.steps");
  return (
    <ol className={cn("grid justify-items-center gap-14 sm:grid-cols-2 lg:gap-8", steps.length === 4 ? "2xl:grid-cols-4" : "lg:grid-cols-3")}>
      {steps.map(({ id, title, text }, i) => (
        <li key={id} className="relative w-full max-w-80">
          <Plate as="div" size="fluid" className="@container">
            <div className="w-[70%] pt-[8%] text-center">
              <h3 className="text-[clamp(1.125rem,6.4cqw,1.375rem)] leading-tight font-extrabold rtl:leading-snug">{title}</h3>
              <p className="text-ink-muted mt-2 text-[clamp(0.875rem,4.6cqw,1rem)] leading-snug">{text}</p>
            </div>
          </Plate>
          <span className="bg-place-card text-place-card-ink absolute start-[12%] top-[6%] -rotate-3 rounded-[4px] px-3 py-1.5 text-[0.6875rem] font-bold tracking-[0.12em] uppercase shadow-[0_8px_14px_rgb(20_4_8/0.3)] rtl:tracking-normal rtl:rotate-3">
            {t("step", { n: i + 1 })}
          </span>
        </li>
      ))}
    </ol>
  );
}
