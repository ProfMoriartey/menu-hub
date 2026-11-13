import { Mail, MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { CtaCard } from "~/components/shared/MarketingBlocks";
import { CONTACT_EMAIL, whatsappLink } from "~/lib/site-contact";

const LINK =
  "text-on-cloth inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-bold underline underline-offset-4 outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[var(--table-focus)]";

/** The close: the primary action again, and the two ways to talk to us. */
export async function ContactClose() {
  const [t, tHero, tContact] = await Promise.all([
    getTranslations("HomePage.contact"),
    getTranslations("HomePage.hero"),
    getTranslations("featuresPage.contact"),
  ]);
  return (
    <CtaCard id="contact" tone="deep" title={t("title")} text={t("text")}>
      <Button variant="tableOnCloth" size="pill" asChild>
        <Link href="/start">{tHero("ctaStart")}</Link>
      </Button>
      <a href={whatsappLink(tContact("whatsappMessage"))} target="_blank" rel="noreferrer" className={LINK}>
        <MessageCircle className="size-4" aria-hidden /> {tContact("whatsapp")}
      </a>
      <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
        <Mail className="size-4" aria-hidden /> {tContact("email")}
      </a>
    </CtaCard>
  );
}
