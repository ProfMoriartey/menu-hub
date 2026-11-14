// app/[locale]/(site)/about/page.tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Platter } from "~/components/shared/Plate";
import { CourseTitle } from "~/components/shared/CourseTitle";
import { ContactBand } from "~/components/shared/ContactBand";
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

const RULES = ["phones", "everyone", "current", "yours"] as const;

/**
 * "Our story", like the story a restaurant prints on the back of its menu:
 * why Menupedia exists and its house rules, on one platter. How it works is
 * on the home page (staff and roles in the FAQ), the features on /features.
 */
export default async function AboutPage({ params }: Props) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("aboutPage");

  return (
    <div className="text-foreground">
      <section aria-labelledby="about-title" className="container mx-auto px-4 pt-12 sm:pt-16">
        <Platter className="mx-auto max-w-3xl">
          <header className="text-center">
            <p className="text-primary text-sm font-bold tracking-wide">{t("hero.eyebrow")}</p>
            <h1 id="about-title" className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("hero.title")}
            </h1>
          </header>

          <div className="text-muted-foreground mt-8 space-y-4 text-lg leading-relaxed">
            <p>{t("story.p1")}</p>
            <p>{t("story.p2")}</p>
          </div>

          <section aria-labelledby="rules-title" className="mt-10">
            <CourseTitle id="rules-title">{t("rules.title")}</CourseTitle>
            <ol className="mt-6 space-y-4">
              {RULES.map((id, i) => (
                <li key={id} className="flex gap-4">
                  <span className="text-primary w-5 shrink-0 text-lg font-bold tabular-nums" aria-hidden>
                    {i + 1}.
                  </span>
                  <p className="text-lg">
                    <span className="font-semibold">{t(`rules.${id}.title`)}.</span>{" "}
                    <span className="text-muted-foreground">{t(`rules.${id}.text`)}</span>
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <div className="border-border mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 border-t pt-6">
            <Link href="/features" className="text-primary inline-flex items-center gap-1 font-semibold hover:underline">
              {t("links.demo")} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
            <Link href="/menus" className="text-primary inline-flex items-center gap-1 font-semibold hover:underline">
              {t("links.menus")} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </Platter>
      </section>

      <ContactBand />
    </div>
  );
}
