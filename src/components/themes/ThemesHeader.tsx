// src/components/themes/ThemesHeader.tsx
"use client"; // REQUIRED: This is a client component

import { motion } from "framer-motion"; // Import motion for animations

export function ThemesHeader() {
  // Animation variants for header elements
  const headerItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <header className="mx-auto max-w-4xl px-4 py-8 text-center">
      <motion.h1
        initial="hidden"
        animate="visible"
        variants={headerItemVariants}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-foreground mb-4 text-5xl leading-tight font-extrabold"
      >
        Explore Menu Themes
      </motion.h1>
      <motion.p
        initial="hidden"
        animate="visible"
        variants={headerItemVariants}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-muted-foreground mb-8 text-xl"
      >
        Discover the different ways your restaurant&apos;s menu can shine. Each
        theme offers a unique visual experience.
      </motion.p>
    </header>
  );
}
