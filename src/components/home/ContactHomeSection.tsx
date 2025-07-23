// src/components/home/ContactHomeSection.tsx
"use client"; // ADDED: Ensure this is a client component for Framer Motion

import { cn } from "~/lib/utils";
import { motion } from "framer-motion"; // ADDED: Import motion

export function ContactHomeSection() {
  return (
    // ADDED: motion.section for fade-in effect on mount
    <motion.section
      initial={{ opacity: 0, y: 50 }} // Starts invisible and slightly below
      animate={{ opacity: 1, y: 0 }} // Animates to visible and original position
      transition={{ duration: 0.8, delay: 0.2 }} // Smooth transition with slight delay
      className={cn("py-16 text-center", "bg-primary text-primary-foreground")}
    >
      <div className="container mx-auto max-w-4xl px-4">
        {/* ADDED: motion.h2 for subtle heading animation */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6 text-4xl font-bold"
        >
          Get in Touch
        </motion.h2>
        {/* ADDED: motion.p for subtle paragraph animation */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8 text-lg opacity-90"
        >
          Have questions or need support? Reach out to us!
        </motion.p>
        {/* ADDED: motion.div for contact details animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }} // Longer delay to appear after paragraph
          className="space-y-4 text-xl"
        >
          <p>
            Email:{" "}
            <a
              href="mailto:contact@menuhub.com"
              className="text-attention hover:underline"
            >
              ahmed.a.alhusiani@gmail.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a
              href="tel:+1234567890"
              className="text-attention hover:underline"
            >
              +90 553 156 5053
            </a>
          </p>
        </motion.div>
        {/* Form will be added here later */}
      </div>
    </motion.section>
  );
}
