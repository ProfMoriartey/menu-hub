import { getTranslations } from "next-intl/server";
import { PageSection } from "~/components/shared/MarketingBlocks";
import { Plate } from "~/components/table/Plate";

const STEPS = ["s1", "s2", "s3"] as const;

/** Three plates, each with its step on a card tucked under the rim. */
export async function HowItWorks() {
  const t = await getTranslations("HomePage.steps");
  return (
    <PageSection id="steps" tone="cloth" title={t("title")}>
      <ol className="grid justify-items-center gap-14 lg:grid-cols-3 lg:gap-8">
        {STEPS.map((step, i) => (
          <li key={step} className="relative w-full max-w-80">
            <Plate as="div" size="fluid" className="@container">
              <div className="w-[70%] text-center">
                <h3 className="text-[clamp(1.125rem,6.4cqw,1.375rem)] leading-tight font-extrabold rtl:leading-snug">
                  {t(`${step}.title`)}
                </h3>
                <p className="text-ink-muted mt-2 text-[clamp(0.875rem,4.6cqw,1rem)] leading-snug">
                  {t(`${step}.text`)}
                </p>
              </div>
            </Plate>
            <span className="bg-place-card text-place-card-ink absolute start-[12%] top-[6%] -rotate-3 rounded-[4px] px-3 py-1.5 text-[0.6875rem] font-bold tracking-[0.12em] uppercase shadow-[0_8px_14px_rgb(20_4_8/0.3)] rtl:tracking-normal rtl:rotate-3">
              {t("step", { n: i + 1 })}
            </span>
          </li>
        ))}
      </ol>
    </PageSection>
  );
}
