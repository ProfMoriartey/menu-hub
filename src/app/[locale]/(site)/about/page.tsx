// app/[locale]/(site)/about/page.tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  Clock,
  Heart,
  Languages,
  Palette,
  Printer,
  Smartphone,
  Store,
  UserPlus,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import SittingDoodle from "~/components/svg/SittingDoodle";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("aboutPage");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const STEPS: { id: string; icon: LucideIcon }[] = [
  { id: "s1", icon: UserPlus },
  { id: "s2", icon: UtensilsCrossed },
  { id: "s3", icon: Palette },
  { id: "s4", icon: Printer },
];

const VALUES: { id: string; icon: LucideIcon }[] = [
  { id: "phones", icon: Smartphone },
  { id: "everyone", icon: Languages },
  { id: "current", icon: Clock },
  { id: "yours", icon: Heart },
];

/**
 * What Menupedia is and how a restaurant gets going with it. The full list
 * of features is on /features (with the demo); this page tells the story,
 * and getting started and teamwork live here as the "How it works" steps.
 */
export default async function AboutPage() {
  const t = await getTranslations("aboutPage");

  return (
    <div className="text-foreground">
      <section className="container mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 pt-16 pb-12 sm:pt-24 md:flex-row">
        <div className="flex-1 text-center md:text-start">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            {t("hero.intro")}
          </p>
        </div>
        <SittingDoodle className="h-48 w-48 shrink-0 sm:h-64 sm:w-64" />
      </section>

      <section
        aria-labelledby="story-title"
        className="container mx-auto max-w-3xl px-4 pb-16"
      >
        <h2 id="story-title" className="text-2xl font-bold tracking-tight">
          {t("story.title")}
        </h2>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          {t("story.p1")}
        </p>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          {t("story.p2")}
        </p>
      </section>

      <section
        aria-labelledby="steps-title"
        className="py-16"
      >
        <div className="container mx-auto max-w-5xl px-4">
          <h2
            id="steps-title"
            className="mb-8 text-center text-3xl font-bold tracking-tight"
          >
            {t("steps.title")}
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ id, icon: Icon }, index) => (
              <li
                key={id}
                className="bg-card border-border relative rounded-xl border p-5 shadow-sm"
              >
                <span
                  className="text-muted-foreground absolute end-4 top-4 text-sm font-semibold tabular-nums"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold">{t(`steps.${id}.title`)}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {t(`steps.${id}.text`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="audiences-title"
        className="container mx-auto max-w-5xl px-4 py-16"
      >
        <h2
          id="audiences-title"
          className="mb-6 text-2xl font-bold tracking-tight"
        >
          {t("audiences.title")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ["guests", Smartphone],
              ["restaurants", Store],
            ] as const
          ).map(([id, Icon]) => (
            <div
              key={id}
              className="bg-card border-border rounded-xl border p-6 shadow-sm"
            >
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Icon className="text-primary h-5 w-5" aria-hidden />{" "}
                {t(`audiences.${id}.title`)}
              </h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                {t(`audiences.${id}.text`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="values-title"
        className="container mx-auto max-w-5xl px-4 pb-16"
      >
        <h2
          id="values-title"
          className="mb-6 text-2xl font-bold tracking-tight"
        >
          {t("values.title")}
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {VALUES.map(({ id, icon: Icon }) => (
            <li key={id} className="flex gap-4">
              <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold">{t(`values.${id}.title`)}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {t(`values.${id}.text`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="about-cta-title"
        className="container mx-auto px-4 pb-24"
      >
        <div className="bg-card border-border mx-auto max-w-3xl rounded-2xl border px-6 py-12 text-center shadow-sm sm:px-12">
          <h2
            id="about-cta-title"
            className="text-3xl font-bold tracking-tight"
          >
            {t("cta.title")}
          </h2>
          <p className="text-muted-foreground mt-3">{t("cta.text")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/features">{t("cta.features")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/menus">{t("cta.restaurants")}</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/features#contact">{t("cta.contact")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
