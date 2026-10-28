// src/lib/site-contact.ts
// How potential customers reach Menupedia: the Features page's closing
// buttons and the home page's contact section. Change them here only.
// (For now the details the home page already showed; to be confirmed.)

export const CONTACT_EMAIL = "ahmedhoglu@gmail.com";

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
