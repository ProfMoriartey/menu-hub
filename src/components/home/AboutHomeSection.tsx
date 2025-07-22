// src/components/home/AboutHomeSection.tsx
"use client"; // ADDED: Ensure this is a client component for Framer Motion

import Link from "next/link";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion"; // ADDED: Import motion

export function AboutHomeSection() {
  return (
    // ADDED: motion.section for fade-in effect on mount
    <motion.section
      initial={{ opacity: 0, y: 50 }} // Starts invisible and slightly below
      animate={{ opacity: 1, y: 0 }} // Animates to visible and original position
      transition={{ duration: 0.8, delay: 0.2 }} // Smooth transition with slight delay
      className="bg-card py-16 shadow-inner"
    >
      <div className="container mx-auto max-w-4xl px-4 text-center">
        {/* ADDED: motion.h2 for subtle heading animation */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-foreground mb-6 text-4xl font-bold"
        >
          About Menu Hub
        </motion.h2>
        {/* ADDED: motion.p for subtle paragraph animation */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-muted-foreground mb-8 text-lg leading-relaxed"
        >
          Menu Hub is your go-to platform for discovering local eateries and
          their delightful menus. We connect food lovers with a wide array of
          culinary experiences, making it easier to find exactly what you crave.
          Our mission is to simplify your dining choices and highlight the best
          of local gastronomy.
        </motion.p>
        <Link href="/about" passHref>
          {/* ADDED: motion.button for hover and tap effects, ensuring it's a client component */}
          <motion.button
            whileHover={{ scale: 1.05 }} // Scale up on hover
            whileTap={{ scale: 0.95 }} // Scale down slightly on tap
            className={cn(
              "rounded-full px-8 py-3 text-lg font-medium",
              "border-primary text-primary hover:bg-muted hover:text-primary-foreground",
            )}
          >
            Learn More About Us
          </motion.button>
        </Link>
      </div>
    </motion.section>
  );
}
