// src/components/home/ContactHomeSection.tsx
"use client";

import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import ZombieingDoodle from "../svg/ZombieingDoodle";

export function ContactHomeSection() {
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
      initial="hidden" // Use variants for initial state
      whileInView="visible" // Animate when in view
      viewport={{ once: true, amount: 0.1 }} // Only animate once
      variants={sectionVariants} // Apply section animation variants
      transition={{ duration: 0.8 }} // Smooth transition
      className={cn("py-16", "bg-primary text-primary-foreground")}
    >
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-center gap-12 px-4 lg:flex-row">
        {" "}
        {/* MODIFIED: Added flex layout classes */}
        {/* Left Column: CoffeeDoodle SVG */}
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.2 }} // Staggered animation
          className="order-2 w-full max-w-xs flex-shrink-0 lg:order-1 lg:max-w-sm" /* Sets SVG to left on large screens */
        >
          <ZombieingDoodle
            className="h-auto w-full"
            doodleFillColorLight="text-background" // Default light fill
            doodleFillColorDark="dark:text-attention" // Default dark fill
            doodleStrokeColorLight="text-foreground" // Default light stroke
            doodleStrokeColorDark="dark:text-primary-foreground" // Default dark stroke
          />
        </motion.div>
        {/* Right Column: Contact Information */}
        <div className="order-1 w-full text-center lg:order-2 lg:w-1/2 lg:text-left">
          {" "}
          {/* Sets text to right on large screens */}
          <motion.h2
            variants={itemVariants}
            transition={{ delay: 0.4 }} // Staggered animation
            className="mb-4 text-4xl font-bold"
          >
            Get in Touch
          </motion.h2>
          <motion.p
            variants={itemVariants}
            transition={{ delay: 0.5 }} // Staggered animation
            className="mb-8 text-lg leading-relaxed opacity-90"
          >
            Have questions or need support? Reach out to us!
          </motion.p>
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.6 }} // Staggered animation
            className="space-y-4 text-xl"
          >
            <p>
              Email:{" "}
              <a
                href="mailto:ahmed.a.alhusaini@gmail.com"
                className="text-attention hover:underline"
              >
                ahmed.a.alhusaini@gmail.com
              </a>
            </p>
            <p>
              Phone:{" "}
              <a
                href="tel:+905531565053" // Corrected href for phone number
                className="text-attention hover:underline"
              >
                +90 553 156 5053
              </a>
            </p>
          </motion.div>
          {/* Form will be added here later */}
        </div>
      </div>
    </motion.section>
  );
}
