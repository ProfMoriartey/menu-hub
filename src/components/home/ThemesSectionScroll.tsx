"use client";

import type React from "react";
import { ParallaxProvider } from "react-scroll-parallax";
import { ThemesHomeSection } from "./ThemesHomeSection";

export function ThemesScroll({ doodle }: { doodle: React.ReactNode }) {
  return (
    <ParallaxProvider>
      <ThemesHomeSection doodle={doodle} />
    </ParallaxProvider>
  );
}
