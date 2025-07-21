// src/components/home/ThemesHomeSection.tsx
import Link from "next/link";
import { Button } from "~/components/ui/button";

export function ThemesHomeSection() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="mb-6 text-4xl font-bold text-gray-900">
          Customize Your Experience
        </h2>
        <p className="mb-8 text-lg leading-relaxed text-gray-700">
          {/* Changed ' to &apos; */}
          We&apos;re working on exciting new themes to personalize your
          restaurant&apos;s digital menu. Stay tuned for more options to match
          your brand&apos;s unique style!
        </p>
        <div className="mb-8 text-2xl font-semibold text-blue-500">
          Coming Soon!
        </div>
        <Link href="/themes" passHref>
          <Button
            variant="outline"
            className="rounded-full border-blue-600 px-8 py-3 text-lg font-medium text-blue-600 hover:bg-blue-50"
          >
            Explore Themes
          </Button>
        </Link>
      </div>
    </section>
  );
}
