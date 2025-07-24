// src/components/home/AboutHomeSection.tsx
"use client";

import Link from "next/link";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button"; // Ensure Button is imported
import CoffeeDoodle from "~/components/svg/CoffeeDoodle"; // Import CoffeeDoodle

export function AboutHomeSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="bg-card py-16 shadow-inner"
    >
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 px-4 lg:flex-row">
        {" "}
        {/* MODIFIED: Added flex classes for layout */}
        {/* SVG on the Left */}
        <motion.div
          initial={{ opacity: 0, x: -50 }} // Animate from the left
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-xs flex-shrink-0 lg:max-w-sm" // MODIFIED: Adjusted max-width for better sizing next to text
        >
          <CoffeeDoodle
            className="h-auto w-full"
            doodleFillColorLight="text-attention" // Example fill color for light mode
            doodleFillColorDark="dark:text-white" // Example fill color for dark mode
            doodleStrokeColorLight="text-foreground" // Example stroke color for light mode
            doodleStrokeColorDark="dark:text-black" // Example stroke color for dark mode
          />
        </motion.div>
        {/* About Us Content on the Right */}
        <div className="max-w-xl text-center lg:text-left">
          {" "}
          {/* MODIFIED: Removed specific max-width and adjusted text alignment for flex layout */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-foreground mb-6 text-4xl font-bold"
          >
            Discover More About Menupedia
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-muted-foreground mb-8 text-lg leading-relaxed"
          >
            Menupedia is your premier online destination for exploring local
            eateries and their delightful menus. We connect passionate food
            lovers with a diverse array of culinary experiences, making it
            effortless to find exactly what you crave. Our core mission is to
            simplify your dining choices, champion local businesses, and
            showcase the very best of local gastronomy.
          </motion.p>
          <Link href="/about" passHref>
            <Button
              size="lg"
              className={cn(
                "rounded-full px-8 py-3 text-lg shadow-md transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              Learn More About Menupedia
            </Button>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
