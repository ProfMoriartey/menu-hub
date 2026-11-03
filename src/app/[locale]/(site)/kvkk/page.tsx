// app/[locale]/(site)/kvkk/page.tsx
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { NOTICE_UPDATED, kvkkNotice } from "~/content/kvkk";
import { CONTACT_EMAIL, DATA_CONTROLLER } from "~/lib/site-contact";

// Turkish visitors read the binding Turkish text; everyone else the English.
const noticeFor = (locale: string) =>
  kvkkNotice(locale === "tr" ? "tr" : "en", DATA_CONTROLLER, CONTACT_EMAIL);

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const notice = noticeFor((await params).locale);
  return { title: `${notice.title} | Menupedia`, description: notice.intro };
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
    <article className="container mx-auto max-w-3xl px-4 py-12" lang={locale === "tr" ? "tr" : "en"}>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{notice.title}</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {notice.updated}: {updated}
        {locale !== "tr" && (
          <>
            {" · "}
            <Link href="/kvkk" locale="tr" className="text-primary underline underline-offset-2">
              Türkçe
            </Link>
          </>
        )}
      </p>
      <p className="mt-6 leading-relaxed">{notice.intro}</p>
      {notice.sections.map((section) => (
        <section key={section.heading} className="mt-8 space-y-3">
          <h2 className="text-xl font-bold">{section.heading}</h2>
          {section.paragraphs?.map((text) => (
            <p key={text} className="leading-relaxed">
              {text}
            </p>
          ))}
          {section.list && (
            <ul className="list-disc space-y-1.5 ps-6 leading-relaxed">
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {section.note && <p className="leading-relaxed">{section.note}</p>}
        </section>
      ))}
    </article>
  );
}
