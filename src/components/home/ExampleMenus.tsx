import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { PageSection } from "~/components/shared/MarketingBlocks";
import { Plate, PlatePhoto } from "~/components/table/Plate";
import { venueHref, type DirectoryVenue } from "~/lib/menus-directory";

const SHOWN = 3;

/** A few menus from the directory, each a plate that links to the menu, labelled as an example. */
export async function ExampleMenus({ venues }: { venues: DirectoryVenue[] }) {
  const t = await getTranslations("HomePage.examples");
  // Featured first; the sort is stable, so name order holds otherwise.
  const shown = [...venues].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, SHOWN);
  if (shown.length === 0) return null;

  return (
    <PageSection id="examples" tone="deep" title={t("title")} intro={t("intro")}>
      <ul className="grid justify-items-center gap-12 lg:grid-cols-3 lg:gap-8">
        {shown.map((venue, i) => {
          const kind = [venue.typeLabel, venue.cuisine].filter(Boolean).join(" · ");
          return (
            <li key={venue.id} className="w-full max-w-80">
              <Link
                href={venueHref(venue)}
                className="block rounded-full outline-none focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-solid focus-visible:outline-[var(--table-focus)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-1"
              >
                <Plate size="fluid" className="@container">
                  <div className="flex w-[66%] flex-col items-center text-center">
                    <PlatePhoto src={venue.photos[0]} alt="" size={72} />
                    <h3 className="mt-2.5 line-clamp-2 text-[clamp(1rem,6cqw,1.25rem)] leading-tight font-extrabold">
                      {venue.name}
                    </h3>
                    {kind && <p className="text-ink-muted mt-1 line-clamp-1 text-sm">{kind}</p>}
                    <p className="text-cloth-ink mt-1.5 text-[0.6875rem] font-bold tracking-[0.12em] uppercase rtl:tracking-normal">
                      {t("label")}
                    </p>
                  </div>
                </Plate>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-12 flex justify-center">
        <Button variant="tableOnCloth" size="pill" asChild>
          <Link href="/menus">
            {t("cta")} <ArrowRight className="rtl:rotate-180" aria-hidden />
          </Link>
        </Button>
      </div>
    </PageSection>
  );
}
