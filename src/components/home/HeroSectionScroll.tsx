"use client";

import { ParallaxProvider } from "react-scroll-parallax";
import { HeroSection } from "./HeroSection";

export function HeroScroll() {
  return (
    <ParallaxProvider>
      <HeroSection />
    </ParallaxProvider>
  );
}
