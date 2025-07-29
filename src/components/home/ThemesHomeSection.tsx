// src/components/home/ThemesHomeSection.tsx
"use client";

import Link from "next/link";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { ClassicThemeExample } from "~/components/themes/ClassicThemeExample";
import { AccordionCardThemeExample } from "~/components/themes/AccordionCardThemeExample";
import { useTranslations } from "next-intl"; // Import useTranslations

import SittingDoodle from "../svg/SittingDoodle";
import { useEffect, useState } from "react";
import { useParallax } from "react-scroll-parallax";

export function ThemesHomeSection() {
  // Initialize translations for the 'themes' namespace
  const t = useTranslations("themes");

  const [isParallaxDisabled, setIsParallaxDisabled] = useState(false);

  useEffect(() => {
    // Function to check screen width and update state
    const checkScreenSize = () => {
      // Tailwind's 'lg' breakpoint is 1024px. Adjust if your 'lg' is different.
      setIsParallaxDisabled(window.innerWidth < 1024);
    };

    // Set initial state
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  const { ref: doodleRef } = useParallax<HTMLDivElement>({
    translateX: [40, -20],
    speed: -5,
    disabled: isParallaxDisabled, // ADDED: Apply the isDisabled prop
  });

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionVariants}
      transition={{ duration: 0.8 }}
      className="bg-card py-16"
    >
      <div className="container mx-auto max-w-6xl px-4">
        {/* Top Row: Why Us Text and SVG (side-by-side) */}
        <div className="mb-12 flex flex-col items-center justify-center gap-8 lg:flex-row">
          {/* MODIFIED: Flex container for text and SVG */}
          {/* Why Us Text */}
          <div className="w-full text-center lg:w-1/2 lg:text-left">
            <motion.h2
              variants={itemVariants}
              transition={{ delay: 0.2 }}
              className="text-foreground mb-4 text-4xl font-bold"
            >
              {t("title")} {/* Use translated value for title */}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground mx-auto text-lg leading-relaxed lg:mx-0"
            >
              {t("description")} {/* Use translated value for description */}
            </motion.p>
          </div>
          {/* CoffeeDoodle SVG */}
          <motion.div
            ref={doodleRef}
            variants={itemVariants}
            className="w-full max-w-xs flex-shrink-0 lg:max-w-sm" // MODIFIED: Sizing for doodle
          >
            <SittingDoodle
              className="h-auto w-full"
              doodleFillColorLight="text-attention"
              doodleFillColorDark="dark:text-white"
              doodleStrokeColorLight="text-foreground"
              doodleStrokeColorDark="dark:text-black"
            />
          </motion.div>
        </div>

        {/* Bottom Section: Interactive Examples */}
        <div className="flex flex-col items-center">
          {/* Centering content below */}
          <motion.h3
            variants={itemVariants}
            transition={{ delay: 0.4 }}
            className="text-foreground mb-4 text-center text-3xl font-bold"
          >
            {t("previewTitle")} {/* Use translated value for previewTitle */}
          </motion.h3>
          <div className="mb-12 flex w-full flex-col justify-center gap-8 md:flex-row">
            {/* MODIFIED: Examples now below, in a row on md+ */}
            {/* Classic Theme Example */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.6 }}
              className="flex w-full flex-col items-center md:w-1/2"
            >
              <h4 className="text-foreground mb-4 text-xl font-semibold">
                {t("example.classic")}{" "}
                {/* Use translated value for example.classic */}
              </h4>
              <ClassicThemeExample />
            </motion.div>
            {/* Accordion Card Theme Example */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.7 }}
              className="flex w-full flex-col items-center md:w-1/2"
            >
              <h4 className="text-foreground mb-4 text-xl font-semibold">
                {t("example.accordion")}{" "}
                {/* Use translated value for example.accordion */}
              </h4>
              <AccordionCardThemeExample />
            </motion.div>
          </div>
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <Link href="/themes" passHref>
              <Button
                size="lg"
                className={cn(
                  "rounded-full px-8 py-3 text-lg shadow-md transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {t("cta")} {/* Use translated value for cta */}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
