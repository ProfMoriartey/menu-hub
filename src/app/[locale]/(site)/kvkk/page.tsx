// app/[locale]/(site)/kvkk/page.tsx
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { CLOTH_LINK } from "~/components/shared/MarketingBlocks";
import { Cloth } from "~/components/table/Cloth";
import { Platter } from "~/components/table/Plate";
import { NOTICE_UPDATED, kvkkNotice } from "~/content/kvkk";
import { CONTACT_EMAIL, DATA_CONTROLLER } from "~/lib/site-contact";
import { clip, sitePageMetadata } from "~/server/public-metadata";

// Turkish visitors read the binding Turkish text; everyone else the English.
const noticeFor = (locale: string) =>
  kvkkNotice(locale === "tr" ? "tr" : "en", DATA_CONTROLLER, CONTACT_EMAIL);

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const notice = noticeFor(locale);
  return sitePageMetadata({
    locale,
    path: "/kvkk",
    title: `${notice.title} | Menupedia`,
    description: clip(notice.intro),
  });
}

/** The KVKK privacy notice (content/kvkk), linked from the footer. */
export default async function KvkkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const notice = noticeFor(locale);
  const updated = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${NOTICE_UPDATED}T00:00:00Z`),
  );

  return (
    <Cloth as="div" className="px-4 pt-12 pb-16 sm:pt-16 lg:pb-24">
      <article className="mx-auto max-w-3xl" lang={locale === "tr" ? "tr" : "en"}>
        <header className="mb-8 text-center">
          <h1 className="text-on-cloth text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">{notice.title}</h1>
          <p className="text-on-cloth-muted mt-3">
            {notice.updated}: {updated}
            {locale !== "tr" && (
              <>
                {" · "}
                <Link href="/kvkk" locale="tr" className={CLOTH_LINK}>
                  Türkçe
                </Link>
              </>
            )}
          </p>
        </header>
        <Platter className="p-7 text-[1.0625rem] sm:p-12">
          <p className="leading-[1.75]">{notice.intro}</p>
          {notice.sections.map((section) => (
            <section key={section.heading} className="mt-10 space-y-3">
              <h2 className="text-2xl leading-snug font-extrabold tracking-tight">{section.heading}</h2>
              {section.paragraphs?.map((text) => (
                <p key={text} className="leading-[1.75]">
                  {text}
                </p>
              ))}
              {section.list && (
                <ul className="list-disc space-y-2 ps-6 leading-[1.75]">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.note && <p className="leading-[1.75]">{section.note}</p>}
            </section>
          ))}
        </Platter>
      </article>
    </Cloth>
  );
}
