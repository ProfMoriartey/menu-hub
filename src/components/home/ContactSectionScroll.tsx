"use client";

import type React from "react";
import { ParallaxProvider } from "react-scroll-parallax";
import { ContactHomeSection } from "./ContactHomeSection";

export function ContactScroll({ doodle }: { doodle: React.ReactNode }) {
  return (
    <ParallaxProvider>
      <ContactHomeSection doodle={doodle} />
    </ParallaxProvider>
  );
}
