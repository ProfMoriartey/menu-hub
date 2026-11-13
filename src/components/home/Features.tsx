import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { PageSection } from "~/components/shared/MarketingBlocks";
import { LeaderRow } from "~/components/table/LeaderRow";
import { Platter } from "~/components/table/Plate";

const ITEMS = ["designs", "languages", "colors", "instant", "hours", "qr"] as const;

/** The features as a short menu on a platter: name, leader, the plain fact. */
export async function Features() {
  const t = await getTranslations("HomePage.features");
  return (
    <PageSection id="features" tone="cloth" title={t("title")} intro={t("intro")}>
      <Platter className="mx-auto max-w-3xl">
        <ul className="space-y-5">
          {ITEMS.map((id) => (
            <LeaderRow
              key={id}
              as="li"
              nameAs="h3"
              name={t(`items.${id}.name`)}
              price={t(`items.${id}.value`)}
              nameClassName="text-lg"
              priceClassName="text-base"
            >
              <p className="text-ink-muted mt-0.5 text-[0.9375rem] leading-snug">{t(`items.${id}.note`)}</p>
            </LeaderRow>
          ))}
        </ul>
      </Platter>
      <div className="mt-10 flex justify-center">
        <Button variant="tableOnCloth" size="pill" asChild>
          <Link href="/features">
            {t("cta")} <ArrowRight className="rtl:rotate-180" aria-hidden />
          </Link>
        </Button>
      </div>
    </PageSection>
  );
}
