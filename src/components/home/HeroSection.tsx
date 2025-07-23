// src/components/home/HeroSection.tsx
"use client"; // ADDED: Ensure this is a client component for Framer Motion

import Link from "next/link";
import { cn } from "~/lib/utils"; // ADDED: Import cn utility
import { motion } from "framer-motion"; // ADDED: Import motion

export function HeroSection() {
  return (
    // UPDATED: motion.section for fade-in effect on mount, and semantic colors
    <motion.section
      initial={{ opacity: 0, y: 50 }} // Starts invisible and slightly below
      animate={{ opacity: 1, y: 0 }} // Animates to visible and original position
      transition={{ duration: 0.8 }} // Smooth transition
      className={cn(
        "flex min-h-[calc(100vh-80px)] items-center justify-center p-8",
        "bg-primary text-primary-foreground", // Replaced gradient with semantic primary color
      )}
    >
      <div className="max-w-4xl text-center">
        {/* ADDED: motion.h1 for subtle heading animation */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }} // Staggered delay
          className="mb-6 text-6xl leading-tight font-extrabold"
        >
          Discover Your Next{" "}
          {/* UPDATED: Use text-accent for the highlight text */}
          <span className="text-attention">Favorite Meal</span>
        </motion.h1>
        {/* ADDED: motion.p for subtle paragraph animation */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }} // Staggered delay
          className="mb-8 text-xl opacity-90"
        >
          Explore diverse menus from local restaurants, find culinary
          inspiration, and enjoy seamless dining experiences.
        </motion.p>
        <Link href="/restaurants" passHref>
          {/* ADDED: motion.button for hover and tap effects, and semantic colors */}
          <motion.button
            whileHover={{ scale: 1.05 }} // Scale up on hover
            whileTap={{ scale: 0.95 }} // Scale down slightly on tap
            className={cn(
              "rounded-full px-10 py-5 text-lg font-semibold shadow-lg transition-transform",
              "bg-primary-foreground text-primary hover:bg-muted", // Semantic button colors
            )}
          >
            Start Exploring
          </motion.button>
        </Link>
      </div>
    </motion.section>
  );
}
