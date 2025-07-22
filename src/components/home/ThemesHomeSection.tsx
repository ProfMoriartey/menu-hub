// src/components/home/ThemesHomeSection.tsx
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

export function ThemesHomeSection() {
  return (
    // UPDATED: Use bg-card for the section background
    <section className="bg-card py-16">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        {/* UPDATED: Use text-foreground for the heading */}
        <h2 className="text-foreground mb-6 text-4xl font-bold">
          Customize Your Experience
        </h2>
        {/* UPDATED: Use text-muted-foreground for the paragraph text */}
        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          We&apos;re working on exciting new themes to personalize your
          restaurant&apos;s digital menu. Stay tuned for more options to match
          your brand&apos;s unique style!
        </p>
        {/* UPDATED: Use text-accent for the "Coming Soon!" text */}
        <div className="text-accent mb-8 text-2xl font-semibold">
          Coming Soon!
        </div>
        <Link href="/themes" passHref>
          <Button
            variant="outline"
            // UPDATED: Button colors to be semantic
            className={cn(
              "rounded-full px-8 py-3 text-lg font-medium",
              "border-primary text-primary hover:bg-muted hover:text-primary-foreground",
            )}
          >
            Explore Themes
          </Button>
        </Link>
      </div>
    </section>
  );
}
