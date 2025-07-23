// src/components/home/ThemesHomeSection.tsx
"use client";

import Link from "next/link";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { ClassicThemeExample } from "~/components/themes/ClassicThemeExample";
// CHANGED: Import AccordionCardThemeExample instead of SidebarListThemeExample
import { AccordionCardThemeExample } from "~/components/themes/AccordionCardThemeExample";
// REMOVED: import { SidebarListThemeExample } from "~/components/themes/SidebarListThemeExample";

export function ThemesHomeSection() {
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
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionVariants}
      transition={{ duration: 0.8 }}
      className="bg-card py-16"
    >
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <motion.h2
          variants={itemVariants}
          transition={{ delay: 0.2 }}
          className="text-foreground mb-4 text-3xl font-bold"
        >
          Explore Our Diverse Menu Themes
        </motion.h2>
        <motion.p
          variants={itemVariants}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg leading-relaxed"
        >
          Discover unique layouts designed to elevate your restaurant's digital
          menu. Below are a couple of popular examples to inspire your choice.
        </motion.p>

        <div className="mb-12 flex flex-col justify-center gap-8 md:flex-row">
          {/* Classic Theme Example (remains in first column) */}
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.4 }}
            className="flex w-full flex-col items-center md:w-1/2"
          >
            <h3 className="text-foreground mb-4 text-xl font-semibold">
              Classic Layout
            </h3>
            <ClassicThemeExample />
          </motion.div>

          {/* CHANGED: Accordion Card Theme Example is now in the second column */}
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.5 }}
            className="flex w-full flex-col items-center md:w-1/2"
          >
            <h3 className="text-foreground mb-4 text-xl font-semibold">
              Accordion Card Layout
            </h3>
            <AccordionCardThemeExample />{" "}
            {/* UPDATED: Render AccordionCardThemeExample */}
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Link href="/themes" passHref>
            <Button
              size="lg"
              className={cn(
                "rounded-full px-8 py-3 text-lg shadow-md transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              View All Themes
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
