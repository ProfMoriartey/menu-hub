// src/lib/site-contact.ts
// How potential customers reach Menupedia: the Features page's closing
// buttons, the home page's contact section and the footer. Change them here
// only.

export const CONTACT_EMAIL = "info.menupedia@gmail.com";

// Menupedia's social media pages, as full URLs (e.g.
// "https://www.instagram.com/menupedia"). The footer shows an icon for each
// one that's filled in, and search engines are told they belong to the
// site (site-structured-data). Leave "" until the page exists.
export const SOCIAL_PROFILES = {
  instagram: "https://www.instagram.com/menupediaofficial?psln=a3owdGIwc25jNXJi",
  facebook: "https://www.instagram.com/menupediaofficial?psln=a3owdGIwc25jNXJi",
  x: "https://x.com/menupediahq",
};

// International format, digits only (no "+" or spaces), as WhatsApp links need.
// Also the phone number for calls.
export const CONTACT_WHATSAPP = "905406987368";
export const CONTACT_PHONE_DISPLAY = "+90 540 698 7368";

export const whatsappLink = (text?: string) =>
  `https://wa.me/${CONTACT_WHATSAPP}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

// Who is responsible for personal data under KVKK (the "veri sorumlusu"),
// shown on the /kvkk notice. TODO before going live: the full legal name of
// the person (or, once registered, the business) and a postal address.
export const DATA_CONTROLLER = {
  name: "",
  address: "",
};
