import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { PageSection } from "~/components/shared/MarketingBlocks";
import { Plate } from "~/components/table/Plate";
import { freeMonths, monthlyPrice } from "./plan-price";

/** One plate: the free months, then the monthly price; the details and the link sit on the cloth. */
export async function Pricing() {
  const [t, locale] = await Promise.all([getTranslations("HomePage.pricing"), getLocale()]);
  return (
    <PageSection id="pricing" tone="cloth" title={t("title")}>
      <div className="flex flex-col items-center">
        <Plate size="fluid" className="@container max-w-[26rem]">
          <div className="w-[68%] text-center">
            <p className="text-[clamp(1.75rem,11cqw,2.75rem)] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance rtl:leading-snug rtl:tracking-normal">
              {t("free", { months: freeMonths })}
            </p>
            <p className="text-ink-muted mt-2 text-[clamp(1rem,5cqw,1.25rem)] font-bold">
              {t("then", { price: monthlyPrice(locale) })}
            </p>
          </div>
        </Plate>
        <p className="text-on-cloth-muted mt-8 max-w-md text-center text-lg">{t("text")}</p>
        <Button variant="tableOnCloth" size="pill" className="mt-6" asChild>
          <Link href="/pricing">{t("cta")}</Link>
        </Button>
      </div>
    </PageSection>
  );
}
