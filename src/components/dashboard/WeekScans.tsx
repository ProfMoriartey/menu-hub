import { getTranslations } from "next-intl/server";
import { ScanLine } from "lucide-react";
import { Link } from "~/i18n/navigation";

/** "124 scans in the last 7 days →", linking to the restaurant's stats. */
export async function WeekScans({ slug, count }: { slug: string; count: number }) {
  const t = await getTranslations("Share");
  return (
    <Link
      href={`/dashboard/${slug}/share#scans`}
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm hover:underline"
    >
      <ScanLine className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {t("lastWeek", { count })}
    </Link>
  );
}
