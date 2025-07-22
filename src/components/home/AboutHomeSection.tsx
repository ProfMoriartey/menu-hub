// src/components/home/AboutHomeSection.tsx
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

export function AboutHomeSection() {
  return (
    // UPDATED: Use bg-card for the background
    <section className="bg-card py-16 shadow-inner">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        {/* UPDATED: Use text-foreground for the heading */}
        <h2 className="text-foreground mb-6 text-4xl font-bold">
          About Menu Hub
        </h2>
        {/* UPDATED: Use text-muted-foreground for the paragraph text */}
        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          Menu Hub is your go-to platform for discovering local eateries and
          their delightful menus. We connect food lovers with a wide array of
          culinary experiences, making it easier to find exactly what you crave.
          Our mission is to simplify your dining choices and highlight the best
          of local gastronomy.
        </p>
        <Link href="/about" passHref>
          <Button
            variant="outline"
            // UPDATED: Button colors to be semantic
            className={cn(
              "rounded-full px-8 py-3 text-lg font-medium",
              "border-primary text-primary hover:bg-muted hover:text-primary-foreground", // Use primary for border and text, muted for hover background
            )}
          >
            Learn More About Us
          </Button>
        </Link>
      </div>
    </section>
  );
}
