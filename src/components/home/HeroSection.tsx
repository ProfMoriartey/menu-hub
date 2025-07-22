// src/components/home/HeroSection.tsx
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

export function HeroSection() {
  return (
    // UPDATED: Use bg-primary for the background, text-primary-foreground for text
    // The gradient will be replaced by a solid primary color that changes with the theme.
    // If you need a themed gradient, we'd add new CSS variables to globals.css.
    <section
      className={cn(
        "flex min-h-[calc(100vh-80px)] items-center justify-center p-8",
        "bg-primary text-primary-foreground",
      )}
    >
      <div className="max-w-4xl text-center">
        <h1 className="mb-6 text-6xl leading-tight font-extrabold">
          Discover Your Next{" "}
          {/* UPDATED: Use text-accent for the highlight text */}
          <span className="text-accent">Favorite Meal</span>
        </h1>
        {/* UPDATED: Use text-primary-foreground (already set by parent) or adjust if needed */}
        <p className="mb-8 text-xl opacity-90">
          Explore diverse menus from local restaurants, find culinary
          inspiration, and enjoy seamless dining experiences.
        </p>
        <Link href="/restaurants" passHref>
          {/* UPDATED: Button colors to be semantic */}
          <Button
            className={cn(
              "rounded-full px-10 py-5 text-lg font-semibold shadow-lg transition-transform hover:scale-105",
              "bg-primary-foreground text-primary hover:bg-muted", // Button background from primary-foreground, text from primary
            )}
          >
            Start Exploring
          </Button>
        </Link>
      </div>
    </section>
  );
}
