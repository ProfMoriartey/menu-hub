// app/about/page.tsx
"use client"; // Required for Framer Motion

import { cn } from "~/lib/utils";
import { motion } from "framer-motion"; // Import motion for animations
import Link from "next/link"; // For the contact links

export default function AboutUsPage() {
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
        {/* Section: About Menu Hub */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-foreground mb-6 text-center text-4xl font-bold"
        >
          About Menu Hub
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-muted-foreground mb-8 text-lg leading-relaxed"
        >
          Menu Hub is your ultimate online platform for discovering and
          exploring local restaurants and their diverse culinary offerings. We
          connect food lovers with a wide array of dining experiences, making it
          easier than ever to find exactly what you crave. Our mission is to
          simplify your dining choices and highlight the best of local
          gastronomy, all in one convenient place.
        </motion.p>
        <div className="border-border my-8 border-t"></div> {/* Separator */}
        {/* Section: What We Offer */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-foreground mb-4 text-3xl font-bold"
        >
          What We Offer
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-muted-foreground mb-6 text-lg leading-relaxed"
        >
          Menu Hub provides a seamless experience for both diners and restaurant
          owners.
        </motion.p>
        <ul className="text-muted-foreground mb-8 list-disc space-y-2 pl-5 text-lg">
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">For Diners:</span>{" "}
            Easy access to dedicated restaurant menus, categorized dishes,
            detailed item information (including ingredients and dietary
            labels), and beautiful imagery. Discover new favorites effortlessly.
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">
              For Restaurant Owners:
            </span>{" "}
            A powerful admin dashboard to manage your restaurant&apos;s profile,
            menu categories, and individual menu items. Upload images, set
            prices, and update dietary information with ease.{" "}
            {/* FIXED: restaurant's */}
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">
              Customizable Themes:
            </span>{" "}
            Restaurants can choose from various display themes to match their
            brand&apos;s unique style, ensuring a personalized customer
            experience. {/* FIXED: brand's */}
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">
              Optimized for All Devices:
            </span>{" "}
            Our platform is designed to provide an optimal viewing and browsing
            experience on both mobile phones and desktop computers.
          </motion.li>
        </ul>
        <div className="border-border my-8 border-t"></div> {/* Separator */}
        {/* Section: Our Commitment (Adjusted delay after removing Technology section) */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="text-foreground mb-4 text-3xl font-bold"
        >
          Our Commitment
        </motion.h2>
        <ul className="text-muted-foreground mb-8 list-disc space-y-2 pl-5 text-lg">
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">Simplicity:</span>{" "}
            We strive to make online menu management and discovery as
            straightforward as possible.
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.9, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">Innovation:</span>{" "}
            We continuously improve our platform with new features and
            technologies.
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.0, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">
              User Experience:
            </span>{" "}
            We prioritize intuitive design for both restaurant owners and their
            customers.
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.1, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">Reliability:</span>{" "}
            Built on a robust stack, Menu Hub offers consistent performance.
          </motion.li>
        </ul>
        <div className="border-border my-8 border-t"></div> {/* Separator */}
        {/* Section: Get Started (Adjusted delay after removing Technology section) */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.2 }}
          className="text-foreground mb-4 text-3xl font-bold"
        >
          Get Started
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.4 }}
          className="text-muted-foreground mb-4 text-lg leading-relaxed"
        >
          Ready to streamline your restaurant&apos;s online presence or discover
          your next favorite meal? Explore Menu Hub today!{" "}
          {/* FIXED: restaurant's */}
        </motion.p>
        <div className="space-y-2 text-lg">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6, duration: 0.5 }}
          >
            <span className="text-foreground font-semibold">
              Explore Restaurants:
            </span>{" "}
            <Link href="/restaurants" className="text-accent hover:underline">
              Browse All Menus
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
