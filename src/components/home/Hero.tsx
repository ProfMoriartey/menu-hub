import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Cloth } from "~/components/table/Cloth";
import { Plate } from "~/components/table/Plate";
import { DemoPhone } from "./DemoPhone";
import { SeatCards } from "./SeatCards";
import { freeMonths, monthlyPrice } from "./plan-price";

/**
 * The first viewport: a big plate with the headline on the left, a phone
 * lying on the table with the five place cards around it on the right. The
 * columns are fractions of the container, so nothing is a fixed width; on
 * phones the plate is wider than the screen and the copy stays in the
 * middle of it.
 */
export async function Hero() {
  const [t, locale] = await Promise.all([getTranslations("HomePage.hero"), getLocale()]);
  return (
    <Cloth className="overflow-x-clip">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-8 px-4 pt-4 pb-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:pt-8 lg:pb-10">
        <div className="flex justify-center">
          <Plate size="fluid" className="@container w-[min(40rem,150vw)] lg:w-full lg:max-w-[40rem]">
            <div className="flex w-[min(68%,calc(100vw-3.5rem))] flex-col items-center text-center">
              <p className="text-cloth-ink max-w-[86%] text-[0.75rem] leading-snug text-balance font-bold tracking-[0.14em] uppercase rtl:tracking-normal">
                {t("eyebrow")}
              </p>
              <h1 className="mt-2.5 text-[clamp(1.75rem,8.2vw,2.75rem)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance lg:text-[clamp(1.9rem,7cqw,3.1rem)] rtl:leading-[1.3] rtl:tracking-normal">
                {t("title")}
              </h1>
              <p className="text-ink-muted mt-3 text-[clamp(0.9375rem,3.6vw,1.0625rem)] leading-snug text-pretty lg:text-[clamp(0.9375rem,2.7cqw,1.125rem)]">
                {t("intro")}
              </p>
              <Button variant="table" size="pill" className="mt-4" asChild>
                <Link href="/start">{t("ctaStart")}</Link>
              </Button>
              <p className="text-ink-muted mt-2.5 max-w-[86%] text-[0.8125rem] leading-snug text-balance">
                {t("priceNote", { months: freeMonths, price: monthlyPrice(locale) })}
              </p>
            </div>
          </Plate>
        </div>

        <div className="relative mx-auto flex w-full max-w-[34rem] flex-col items-center gap-8 lg:block lg:aspect-[1/1] lg:max-w-none">
          <div className="flex justify-center lg:absolute lg:left-1/2 lg:top-1/2 lg:w-[58%] lg:-translate-x-1/2 lg:-translate-y-1/2">
            <DemoPhone locale="en" label={t("phoneLabel")} priority />
          </div>
          <SeatCards active="en" />
        </div>
      </div>
    </Cloth>
  );
}
