// src/components/home/ThemesHomeSection.tsx
"use client"; // ADDED: Ensure this is a client component for Framer Motion

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion"; // ADDED: Import motion

export function ThemesHomeSection() {
  return (
    // ADDED: motion.section for fade-in effect on mount
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="bg-card py-16"
    >
      <div className="container mx-auto max-w-4xl px-4 text-center">
        {/* ADDED: motion.h2 for subtle heading animation */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-foreground mb-6 text-4xl font-bold"
        >
          Customize Your Experience
        </motion.h2>
        {/* ADDED: motion.p for subtle paragraph animation */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-muted-foreground mb-8 text-lg leading-relaxed"
        >
          We&apos;re working on exciting new themes to personalize your
          restaurant&apos;s digital menu. Stay tuned for more options to match
          your brand&apos;s unique style!
        </motion.p>
        {/* ADDED: motion.div for "Coming Soon!" text animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }} // Longer delay to appear after paragraph
          className="text-accent mb-8 text-2xl font-semibold"
        >
          Coming Soon!
        </motion.div>
        <Link href="/themes" passHref>
          {/* ADDED: motion.button for hover and tap effects */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "rounded-full px-8 py-3 text-lg font-medium",
              "border-primary text-primary hover:bg-muted hover:text-primary-foreground",
            )}
          >
            Explore Themes
          </motion.button>
        </Link>
      </div>
    </motion.section>
  );
}
