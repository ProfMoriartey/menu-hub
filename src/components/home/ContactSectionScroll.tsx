"use client";

import { ParallaxProvider } from "react-scroll-parallax";
import { ContactHomeSection } from "./ContactHomeSection";

export function ContactScroll() {
  return (
    <ParallaxProvider>
      <ContactHomeSection />
    </ParallaxProvider>
  );
}
