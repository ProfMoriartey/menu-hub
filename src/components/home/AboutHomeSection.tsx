// src/components/home/AboutHomeSection.tsx
import Link from "next/link";
import { Button } from "~/components/ui/button";

export function AboutHomeSection() {
  return (
    <section className="bg-white py-16 shadow-inner">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="mb-6 text-4xl font-bold text-gray-900">
          About Menu Hub
        </h2>
        <p className="mb-8 text-lg leading-relaxed text-gray-700">
          Menu Hub is your go-to platform for discovering local eateries and
          their delightful menus. We connect food lovers with a wide array of
          culinary experiences, making it easier to find exactly what you crave.
          Our mission is to simplify your dining choices and highlight the best
          of local gastronomy.
        </p>
        <Link href="/about" passHref>
          <Button
            variant="outline"
            className="rounded-full border-blue-600 px-8 py-3 text-lg font-medium text-blue-600 hover:bg-blue-50"
          >
            Learn More About Us
          </Button>
        </Link>
      </div>
    </section>
  );
}
