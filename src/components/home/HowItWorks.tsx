import { getTranslations } from "next-intl/server";
import { PageSection } from "~/components/shared/MarketingBlocks";
import { StepPlates } from "~/components/shared/StepPlates";

const STEPS = ["s1", "s2", "s3"] as const;

/** Three plates, each with its step on a card tucked under the rim. */
export async function HowItWorks() {
  const t = await getTranslations("HomePage.steps");
  return (
    <PageSection id="steps" tone="cloth" title={t("title")}>
      <StepPlates steps={STEPS.map((id) => ({ id, title: t(`${id}.title`), text: t(`${id}.text`) }))} />
    </PageSection>
  );
}
