// app/[locale]/about/page.tsx
import { AboutPageClient } from "~/components/about/AboutPageClient";
import SittingDoodle from "~/components/svg/SittingDoodle";

export default function AboutUsPage() {
  return (
    <AboutPageClient
      doodle={
        <SittingDoodle className="h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80" />
      }
    />
  );
}
