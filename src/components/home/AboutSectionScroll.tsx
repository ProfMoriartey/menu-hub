"use client";

import type React from "react";
import { ParallaxProvider } from "react-scroll-parallax";
import { AboutHomeSection } from "./AboutHomeSection";

export function AboutScroll({ doodle }: { doodle: React.ReactNode }) {
  return (
    <ParallaxProvider>
      <AboutHomeSection doodle={doodle} />
    </ParallaxProvider>
  );
}
