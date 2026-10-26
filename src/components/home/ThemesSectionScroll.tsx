"use client";

import type React from "react";
import { ParallaxProvider } from "react-scroll-parallax";
import { ThemesHomeSection } from "./ThemesHomeSection";
import type { DemoMenus } from "~/server/demo-menu";

export function ThemesScroll({
  doodle,
  demo,
}: {
  doodle: React.ReactNode;
  demo: DemoMenus;
}) {
  return (
    <ParallaxProvider>
      <ThemesHomeSection doodle={doodle} demo={demo} />
    </ParallaxProvider>
  );
}
