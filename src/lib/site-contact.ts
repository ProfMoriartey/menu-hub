// src/lib/site-contact.ts
// How potential customers reach Menupedia: the Features page's closing
// buttons and the home page's contact section. Change them here only.
// (For now the details the home page already showed; to be confirmed.)

export const CONTACT_EMAIL = "ahmed.a.alhusaini@gmail.com";

// International format, digits only (no "+" or spaces), as WhatsApp links need.
// Also the phone number for calls.
export const CONTACT_WHATSAPP = "905531565053";
export const CONTACT_PHONE_DISPLAY = "+90 553 156 5053";

export const whatsappLink = (text?: string) =>
  `https://wa.me/${CONTACT_WHATSAPP}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
