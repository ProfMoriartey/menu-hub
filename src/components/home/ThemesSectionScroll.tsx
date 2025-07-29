"use client";

import { ParallaxProvider } from "react-scroll-parallax";
import { ThemesHomeSection } from "./ThemesHomeSection";

export function ThemesScroll() {
  return (
    <ParallaxProvider>
      <ThemesHomeSection />
    </ParallaxProvider>
  );
}
