"use client";

import type React from "react";
import { ParallaxProvider } from "react-scroll-parallax";
import { HeroSection } from "./HeroSection";

export function HeroScroll({ doodle }: { doodle: React.ReactNode }) {
  return (
    <ParallaxProvider>
      <HeroSection doodle={doodle} />
    </ParallaxProvider>
  );
}
