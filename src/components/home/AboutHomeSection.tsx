// src/components/home/AboutHomeSection.tsx
"use client";

import Link from "next/link";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button"; // Ensure Button is imported

export function AboutHomeSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="bg-card py-16 shadow-inner"
    >
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-foreground mb-6 text-4xl font-bold"
        >
          About Menu Hub
        </motion.h2>
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
          {/* UPDATED: Use Shadcn Button and apply matching styles */}
          <Button
            size="lg" // Matches the size of the themes button
            className={cn(
              "rounded-full px-8 py-3 text-lg shadow-md transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            Learn More About Us
          </Button>
        </Link>
      </div>
    </motion.section>
  );
}
