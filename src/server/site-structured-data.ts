// src/server/site-structured-data.ts
import { CONTACT_EMAIL } from "~/lib/site-contact";

export const SITE_NAME = "Menupedia";

// The domain is menu-pedia.com, so people also write the name with a hyphen
// or a space. Listing the spellings tells search engines they all mean this
// site, so a search for any of them can find it.
export const SITE_ALTERNATE_NAMES = ["Menu-pedia", "Menu Pedia", "menu-pedia.com"];

// Menupedia's own profiles elsewhere (Instagram, LinkedIn, X, YouTube …),
// as full URLs. Search engines and AI assistants use them to tie those
// profiles to this site. Add each one once it exists.
export const SITE_PROFILES: string[] = [];

/**
 * schema.org WebSite and Organization data for the home page. Google takes
 * the site name it shows in results from WebSite, and the logo and brand
 * details from Organization.
 */
export function siteStructuredData({
  origin,
  locale,
  description,
}: {
  origin: string;
  locale: string;
  description: string;
}) {
  const home = `${origin}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        url: home,
        description,
        inLanguage: locale,
        publisher: { "@id": `${home}#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${home}#organization`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        url: home,
        logo: `${origin}/menupedia-logo.png`,
        description,
        email: CONTACT_EMAIL,
        sameAs: SITE_PROFILES.length > 0 ? SITE_PROFILES : undefined,
      },
    ],
  };
}
