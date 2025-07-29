// src/components/home/AboutHomeSection.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import CoffeeDoodle from "~/components/svg/CoffeeDoodle";
import { useTranslations } from "next-intl";
import { useParallax } from "react-scroll-parallax";

export function AboutHomeSection() {
  const t = useTranslations("about");
  const [isParallaxDisabled, setIsParallaxDisabled] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsParallaxDisabled(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const { ref: coffeeRef } = useParallax<HTMLDivElement>({
    // CORRECTED: Use translateX for horizontal movement
    // As you scroll down (from top to bottom), the value transitions from the first to the second.
    // To move left: start from a positive offset and go to 0 or a negative offset.
    // Let's try starting at 50% to the right and moving to -50% to the left relative to its natural position.
    // This will create a noticeable leftward slide. Adjust values for desired effect.
    translateX: [30, -40], // Moves from 50% right to 50% left relative to its initial scroll position
    // If you want it to appear from the right and slide more prominently left,
    // you might set a larger positive starting value and a negative ending value.
    // For a subtle shift, you could do [0, -20] meaning it starts at its normal position
    // and shifts 20% to the left as you scroll past it.
    speed: 6,
    disabled: isParallaxDisabled,
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="bg-card py-16 shadow-inner"
    >
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 px-4 lg:flex-row">
        {/* SVG on the Left with Parallax */}
        <motion.div
          ref={coffeeRef} // Apply parallax ref
          initial={{ opacity: 0, x: -50 }} // Initial animation from the left
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-xs flex-shrink-0 lg:max-w-sm"
        >
          <CoffeeDoodle
            className="h-auto w-full"
            doodleFillColorLight="text-attention"
            doodleFillColorDark="dark:text-white"
            doodleStrokeColorLight="text-foreground"
            doodleStrokeColorDark="dark:text-black"
          />
        </motion.div>
        {/* About Us Content on the Right */}
        <div className="max-w-xl text-center lg:text-left">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-foreground mb-6 text-4xl font-bold"
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-muted-foreground mb-8 text-lg leading-relaxed"
          >
            {t("description")}
          </motion.p>
          <Link href="/about" passHref>
            <Button
              size="lg"
              className={cn(
                "rounded-full px-8 py-3 text-lg shadow-md transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {t("cta")}
            </Button>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
