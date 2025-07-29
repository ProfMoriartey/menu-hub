"use client";

import { ParallaxProvider } from "react-scroll-parallax";
import { AboutHomeSection } from "./AboutHomeSection";

export function AboutScroll() {
  return (
    <ParallaxProvider>
      <AboutHomeSection />
    </ParallaxProvider>
  );
}
