// app/[locale]/(site)/features/page.tsx
import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { MenuDemo } from "~/components/features/MenuDemo";
import { Platter } from "~/components/shared/Plate";
import { LeaderRow } from "~/components/shared/LeaderRow";
import { CourseTitle } from "~/components/shared/CourseTitle";
import { getDemoMenus } from "~/server/demo-menu";
import { CONTACT_EMAIL, whatsappLink } from "~/lib/site-contact";
import { Link } from "~/i18n/navigation";
import { planFacts } from "~/server/plan-facts";
import { sitePageMetadata } from "~/server/public-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "featuresPage" });
  return sitePageMetadata({
    locale,
    path: "/features",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

// The features as courses on a menu; each is a "dish" with a short note
// and a "price" (featuresPage.features.<id>.text / .value).
const COURSES = [
  { id: "starters", features: ["designs", "colors", "fast"] },
  { id: "mains", features: ["languages", "search", "hours"] },
  { id: "desserts", features: ["instant", "qr", "stats"] },
] as const;
// Served on the side: names only, in one line.
const SIDES = ["google", "sharing", "about"] as const;

// Features with a page of their own, linked under their line.
const FEATURE_PAGES: Partial<Record<string, string>> = { languages: "/multilingual-menu" };

/**
 * What restaurants get: a working demo menu (a made-up restaurant) to try
 * designs, colours and languages, then the features set like a printed
 * menu on a platter, ending with the bill (the price; the plan, trial and
 * questions are on /pricing). Was /themes, which redirects here. Getting
 * started is on the home page, staff and roles in the FAQ.
 */
export default async function FeaturesPage({ params }: Props) {
  setRequestLocale((await params).locale);
  const locale = await getLocale();
  const [t, facts] = await Promise.all([getTranslations("featuresPage"), planFacts(locale)]);

  return (
    <div className="text-foreground">
      <section id="demo" aria-labelledby="demo-title" className="container mx-auto scroll-mt-16 px-4 pt-12 pb-16 sm:pt-16">
        <div className="napkin mx-auto mb-10 w-fit max-w-2xl px-6 py-4 text-center">
          <h1 id="demo-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("hero.title")}
          </h1>
          <p className="text-muted-foreground mt-3">{t("hero.intro")}</p>
        </div>
        <MenuDemo menus={getDemoMenus()} initialLanguage={locale} />
      </section>

      <section aria-labelledby="menu-title" className="container mx-auto px-4 pb-16">
        <Platter className="mx-auto max-w-3xl">
          <header className="text-center">
            <h2 id="menu-title" className="text-3xl font-extrabold tracking-tight">
              Menupedia
            </h2>
            <p className="text-muted-foreground mt-1">{t("menu.subtitle")}</p>
          </header>

          {COURSES.map((course) => (
            <section key={course.id} aria-labelledby={`course-${course.id}`} className="mt-10">
              <CourseTitle id={`course-${course.id}`}>{t(`menu.${course.id}`)}</CourseTitle>
              <ul className="mt-5 space-y-5">
                {course.features.map((id) => (
                  <LeaderRow
                    key={id}
                    nameAs="h3"
                    name={t(`features.${id}.title`)}
                    value={t(`features.${id}.value`)}
                    note={t(`features.${id}.text`)}
                    nameClassName="text-lg font-semibold"
                  >
                    {FEATURE_PAGES[id] && (
                      <Link
                        href={FEATURE_PAGES[id]}
                        className="text-primary mt-1 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                      >
                        {t(`featureLinks.${id}`)}
                        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                      </Link>
                    )}
                  </LeaderRow>
                ))}
              </ul>
            </section>
          ))}

          <section aria-labelledby="course-side" className="mt-10">
            <CourseTitle id="course-side">{t("menu.side")}</CourseTitle>
            <ul className="mt-5 flex flex-wrap justify-center gap-x-3 gap-y-1 text-center font-semibold">
              {SIDES.map((id, i) => (
                <li key={id} className="flex gap-3">
                  {i > 0 && <span className="text-muted-foreground" aria-hidden>·</span>}
                  {t(`features.${id}.title`)}
                </li>
              ))}
            </ul>
          </section>

          {/* The bill: the price in a line, the details on /pricing. */}
          <section
            aria-labelledby="bill-title"
            className="border-border mt-10 flex flex-col items-center gap-4 border-t-4 border-double pt-6 text-center sm:flex-row sm:text-start"
          >
            <div className="flex-1">
              <p className="text-muted-foreground text-sm font-semibold">{t("pricing.bill")}</p>
              <h2 id="bill-title" className="mt-1 text-xl font-bold tracking-tight">
                {t("pricing.title", facts)}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">{t("pricing.text", facts)}</p>
            </div>
            <Button variant="outline" className="shrink-0" asChild>
              <Link href="/pricing">{t("pricing.link")}</Link>
            </Button>
          </section>
        </Platter>
      </section>

      <section
        id="contact"
        aria-labelledby="contact-title"
        className="container mx-auto scroll-mt-16 px-4 pb-24"
      >
        <div className="bg-primary text-primary-foreground mx-auto max-w-3xl rounded-2xl px-6 py-12 text-center shadow-lg sm:px-12">
          <h2 id="contact-title" className="text-3xl font-bold tracking-tight">
            {t("contact.title")}
          </h2>
          <p className="mt-3 opacity-90">{t("contact.text")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Mail className="h-4 w-4" aria-hidden /> {t("contact.email")}
              </a>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <a
                href={whatsappLink(t("contact.whatsappMessage"))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />{" "}
                {t("contact.whatsapp")}
              </a>
            </Button>
          </div>
          <p className="mt-4 text-sm opacity-80" dir="ltr">
            {CONTACT_EMAIL}
          </p>
        </div>
      </section>
    </div>
  );
}
