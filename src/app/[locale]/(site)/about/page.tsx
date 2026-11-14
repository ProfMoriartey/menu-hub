// app/[locale]/(site)/about/page.tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactClose } from "~/components/home/ContactClose";
import { ClothHero, PageSection, PlatterList } from "~/components/shared/MarketingBlocks";
import { StepPlates } from "~/components/shared/StepPlates";
import { Platter } from "~/components/table/Plate";
import { sitePageMetadata } from "~/server/public-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  return sitePageMetadata({
    locale,
    path: "/about",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

const STEPS = ["s1", "s2", "s3", "s4"] as const;
const AUDIENCES = ["guests", "restaurants"] as const;
const VALUES = ["phones", "everyone", "current", "yours"] as const;

/**
 * What Menupedia is and how a restaurant gets going with it. The full list
 * of features is on /features (with the demo); this page tells the story,
 * and getting started and teamwork live here as the "How it works" steps.
 */
export default async function AboutPage({ params }: Props) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("aboutPage");

  return (
    <>
      <ClothHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} intro={t("hero.intro")} />

      <PageSection id="story" tone="deep" title={t("story.title")} className="max-w-3xl">
        <Platter className="space-y-4 text-[1.0625rem] leading-[1.75] sm:p-12">
          <p>{t("story.p1")}</p>
          <p className="text-ink-muted">{t("story.p2")}</p>
        </Platter>
      </PageSection>

      <PageSection id="steps" tone="cloth" title={t("steps.title")}>
        <StepPlates steps={STEPS.map((id) => ({ id, title: t(`steps.${id}.title`), text: t(`steps.${id}.text`) }))} />
      </PageSection>

      <PageSection id="audiences" tone="deep" title={t("audiences.title")}>
        <div className="grid gap-6 md:grid-cols-2">
          {AUDIENCES.map((id) => (
            <Platter key={id}>
              <h3 className="text-xl font-extrabold">{t(`audiences.${id}.title`)}</h3>
              <p className="text-ink-muted mt-2 leading-relaxed">{t(`audiences.${id}.text`)}</p>
            </Platter>
          ))}
        </div>
      </PageSection>

      <PageSection id="values" tone="cloth" title={t("values.title")} className="max-w-3xl">
        <Platter>
          <PlatterList items={VALUES.map((id) => ({ id, title: t(`values.${id}.title`), text: t(`values.${id}.text`) }))} />
        </Platter>
      </PageSection>

      <ContactClose />
    </>
  );
}
