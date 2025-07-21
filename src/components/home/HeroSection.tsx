// src/components/home/HeroSection.tsx
import Link from "next/link";
import { Button } from "~/components/ui/button";

export function HeroSection() {
  return (
    <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
      <div className="max-w-4xl text-center">
        <h1 className="mb-6 text-6xl leading-tight font-extrabold">
          Discover Your Next{" "}
          <span className="text-yellow-300">Favorite Meal</span>
        </h1>
        <p className="mb-8 text-xl opacity-90">
          Explore diverse menus from local restaurants, find culinary
          inspiration, and enjoy seamless dining experiences.
        </p>
        <Link href="/restaurants" passHref>
          <Button className="rounded-full bg-white px-10 py-5 text-lg font-semibold text-blue-700 shadow-lg transition-transform hover:scale-105 hover:bg-gray-100">
            Start Exploring
          </Button>
        </Link>
      </div>
    </section>
  );
}
