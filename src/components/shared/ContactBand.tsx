import { Mail, MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "~/components/ui/button";
import { CONTACT_EMAIL, whatsappLink } from "~/lib/site-contact";

/** The "get in touch" band (WhatsApp and email) that closes the home and pricing pages, at #contact. */
export async function ContactBand() {
  const [t, tContact] = await Promise.all([
    getTranslations("HomePage"),
    getTranslations("featuresPage.contact"),
  ]);
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="container mx-auto scroll-mt-20 px-4 py-16 lg:py-24"
    >
      <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-3xl px-6 py-12 sm:px-12">
        <div className="relative">
          <div className="text-center">
            <h2 id="contact-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("contact.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg opacity-90">{t("contact.text")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 rounded-[10px]"
                asChild
              >
                <a href={whatsappLink(tContact("whatsappMessage"))} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" aria-hidden /> {tContact("whatsapp")}
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground rounded-[10px] bg-transparent"
                asChild
              >
                <a href={`mailto:${CONTACT_EMAIL}`}>
                  <Mail className="h-4 w-4" aria-hidden /> {tContact("email")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
