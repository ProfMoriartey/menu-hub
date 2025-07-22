// src/components/home/ContactHomeSection.tsx
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

export function ContactHomeSection() {
  return (
    // UPDATED: Use bg-primary for a prominent section background, and text-primary-foreground
    <section
      className={cn("py-16 text-center", "bg-primary text-primary-foreground")}
    >
      <div className="container mx-auto max-w-4xl px-4">
        {/* Heading and paragraph will inherit text-primary-foreground */}
        <h2 className="mb-6 text-4xl font-bold">Get in Touch</h2>
        <p className="mb-8 text-lg opacity-90">
          Have questions or need support? Reach out to us!
        </p>
        <div className="space-y-4 text-xl">
          <p>
            Email:{" "}
            <a
              href="mailto:contact@menuhub.com"
              // UPDATED: Use text-accent for links for better visibility against primary
              className="text-accent hover:underline"
            >
              contact@menuhub.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a href="tel:+1234567890" className="text-accent hover:underline">
              +1 (234) 567-890
            </a>
          </p>
        </div>
        {/* Form will be added here later */}
      </div>
    </section>
  );
}
