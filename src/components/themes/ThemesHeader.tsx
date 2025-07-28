// src/components/themes/ThemesHeader.tsx
"use client"; // REQUIRED: This is a client component

import { motion } from "framer-motion"; // Import motion for animations
import { useTranslations } from "next-intl"; // Import useTranslations
import CoffeeDoodle from "../svg/CoffeeDoodle"; // Correct import path for your SVG component

export function ThemesHeader() {
  const t = useTranslations("themesPage"); // Initialize translations for the 'themesPage' namespace

  // Animation variants for header elements
  const headerItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <header className="mx-auto max-w-6xl px-4 py-8">
      {/* This div controls the layout of the title/description and the SVG. */}
      {/*
        - flex: Enables flexbox.
        - flex-col: Stacks items vertically by default (mobile-first).
        - items-center: Centers items horizontally on the cross-axis (for flex-col).
        - justify-center: Centers items vertically on the main-axis (for flex-col).
        - text-center: Centers text horizontally on mobile.

        - md:flex-row: Changes to horizontal layout on medium screens and up.
        - md:justify-between: DISTRIBUTES ITEMS WITH MAXIMUM SPACE BETWEEN THEM,
                              pushing the first item (text) to the far left and the
                              last item (SVG) to the far right on medium screens and up.
        - md:items-center: Vertically aligns items in the center on medium screens and up.
        - md:text-left: Aligns text to the left on medium screens and up.
      */}
      <div className="flex flex-col items-center justify-center text-center md:flex-row md:items-center md:justify-between md:text-left">
        {/* Left side: Title and Description */}
        <div className="mb-8 max-w-2xl flex-1 md:mr-8 md:mb-0">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={headerItemVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-foreground mb-4 text-5xl leading-tight font-extrabold"
          >
            {t("mainTitle")}
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={headerItemVariants}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-muted-foreground text-xl"
          >
            {t("description")}
          </motion.p>
        </div>

        {/* Right side: SVG Doodle */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={headerItemVariants}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex-shrink-0" // Prevents the doodle from shrinking too much
        >
          {/* Apply Tailwind classes to control the doodle's size */}
          <CoffeeDoodle className="h-56 w-56 md:h-80 md:w-80" />
        </motion.div>
      </div>
    </header>
  );
}
