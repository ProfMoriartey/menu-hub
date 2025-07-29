// src/components/home/HeroSection.tsx
"use client";

import { useEffect, useState } from "react"; // ADDED: Import useEffect and useState
import Link from "next/link";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import GroovySittingDoodle from "../svg/GroovySittingDoodle";

import { useParallax } from "react-scroll-parallax";

export function HeroSection() {
  const t = useTranslations("hero");

  // ADDED: State to track if parallax should be disabled
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
    speed: -21,
    disabled: isParallaxDisabled, // ADDED: Apply the isDisabled prop
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={cn(
        "flex min-h-[calc(100vh-80px)] items-center justify-center p-8",
        "bg-primary text-primary-foreground",
        "flex-col gap-8 lg:flex-row lg:justify-around",
      )}
    >
      <div className="max-w-xl text-center lg:text-left">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 text-6xl leading-tight font-extrabold"
        >
          {t("title.main")}{" "}
          <span className="text-attention">{t("title.highlight")}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8 text-xl opacity-90"
        >
          {t("description")}
        </motion.p>
        <Link href="/restaurants" passHref>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "rounded-full px-10 py-5 text-lg font-semibold shadow-lg transition-transform",
              "bg-primary-foreground text-primary hover:bg-muted",
            )}
          >
            {t("cta")}
          </motion.button>
        </Link>
      </div>

      <motion.div
        ref={doodleRef}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-8 w-full max-w-sm lg:mt-0 lg:max-w-lg"
      >
        <GroovySittingDoodle className="text-background h-auto w-full" />
      </motion.div>
    </motion.section>
  );
}
