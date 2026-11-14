import { Mail, MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { CLOTH_LINK as LINK, CtaCard } from "~/components/shared/MarketingBlocks";
import { CONTACT_EMAIL, whatsappLink } from "~/lib/site-contact";

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
