// app/about/page.tsx
"use client"; // Required for Framer Motion

import { cn } from "~/lib/utils";
import { motion } from "framer-motion"; // Import motion for animations
import Link from "next/link"; // For the contact links
import { useTranslations } from "next-intl"; // Import useTranslations
import SittingDoodle from "~/components/svg/SittingDoodle"; // Import your SittingDoodle SVG component

export default function AboutUsPage() {
  const t = useTranslations("aboutPage"); // Initialize translations for the 'aboutPage' namespace

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    // Main container for the page, applying global theme colors
    <div
      className={cn("min-h-screen p-4 sm:p-8", "bg-background text-foreground")}
    >
      {/* Main content card, applying card-specific theme colors */}
      <motion.div
        initial={{ opacity: 0, y: 50 }} // Initial animation state (invisible, slightly below)
        animate={{ opacity: 1, y: 0 }} // Animate to visible and original position
        transition={{ duration: 0.8, delay: 0.2 }} // Smooth transition with a slight delay
        className={cn(
          "container mx-auto max-w-4xl rounded-lg p-6 shadow-lg sm:p-8",
          "bg-card",
        )}
      >
        {/* Original About Menupedia Section - now without the doodle */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-foreground mb-6 text-center text-4xl font-bold"
        >
          {t("mainTitle")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-muted-foreground mb-8 text-lg leading-relaxed"
        >
          {t("mainDescription")}
        </motion.p>
        <div className="border-border my-8 border-t"></div> {/* Separator */}
        {/* Section: What We Offer */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-foreground mb-4 text-3xl font-bold"
        >
          {t("whatWeOfferTitle")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-muted-foreground mb-6 text-lg leading-relaxed"
        >
          {t("whatWeOfferDescription")}
        </motion.p>
        <ul className="text-muted-foreground mb-8 list-disc space-y-2 pl-5 text-lg">
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">
              {t("forDiners.title")}
            </span>{" "}
            {t("forDiners.description")}
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">
              {t("forRestaurantOwners.title")}
            </span>{" "}
            {t("forRestaurantOwners.description")}
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">
              {t("customizableThemes.title")}
            </span>{" "}
            {t("customizableThemes.description")}
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">
              {t("optimizedForAllDevices.title")}
            </span>{" "}
            {t("optimizedForAllDevices.description")}
          </motion.li>
        </ul>
        <div className="border-border my-8 border-t"></div> {/* Separator */}
        {/* Section: Our Commitment */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="text-foreground mb-4 text-3xl font-bold"
        >
          {t("ourCommitmentTitle")}
        </motion.h2>
        <ul className="text-muted-foreground mb-8 list-disc space-y-2 pl-5 text-lg">
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">
              {t("simplicity.title")}
            </span>{" "}
            {t("simplicity.description")}
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.9, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">
              {t("innovation.title")}
            </span>{" "}
            {t("innovation.description")}
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.0, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">
              {t("userExperience.title")}
            </span>{" "}
            {t("userExperience.description")}
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.1, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">
              {t("reliability.title")}
            </span>{" "}
            {t("reliability.description")}
          </motion.li>
        </ul>
        <div className="border-border my-8 border-t"></div> {/* Separator */}
        {/* Section: Get Started - Now with SittingDoodle */}
        {/* New flex container for the "Get Started" section content and SVG */}
        <div className="flex flex-col items-center justify-center text-center md:flex-row md:items-center md:justify-between md:text-left">
          {/* Get Started text content (appears above doodle for mobile) */}
          <div className="flex-1 md:mr-8">
            {" "}
            {/* Added mr-8 for spacing on desktop */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.2 }} // Adjusted delay
              className="text-foreground mb-4 text-3xl font-bold"
            >
              {t("getStartedTitle")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.4 }} // Adjusted delay
              className="text-muted-foreground mb-4 text-lg leading-relaxed"
            >
              {t("getStartedDescription")}
            </motion.p>
            <div className="space-y-2 text-lg">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.6, duration: 0.5 }} // Adjusted delay
              >
                <span className="text-foreground font-semibold">
                  {t("exploreRestaurants.title")}
                </span>{" "}
                <Link
                  href="/restaurants"
                  className="text-accent hover:underline"
                >
                  {t("exploreRestaurants.linkText")}
                </Link>
              </motion.p>
            </div>
          </div>

          {/* SVG Doodle (appears on top for mobile due to order) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} // Animation for doodle
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 2.8 }} // Adjusted delay
            className="mb-8 flex-shrink-0 md:mb-0" // Spacing below doodle on mobile
          >
            <SittingDoodle className="h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
