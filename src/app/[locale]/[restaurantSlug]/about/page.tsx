import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { 
  ChevronLeft, MapPin, Phone, Globe, Info, Tag, 
  Instagram, Facebook, Twitter, Music2 
} from "lucide-react";
import { cn } from "~/lib/utils";
import { getTranslations } from "next-intl/server";

import type { Restaurant } from "~/types/restaurant";
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas";
import { DeliveryOptionsDialog } from "~/components/public/DeliveryOptionsDialog";

interface PageProps {
  params: Promise<{
    restaurantSlug: string;
  }>;
}

export default async function RestaurantProfilePage({ params }: PageProps) {
  const { restaurantSlug } = await params;
  const t = await getTranslations("restaurantProfilePage");

  // 1. Fetch raw data without the strict type hint yet
  const rawData = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
    with: {
      categories: true,
    },
  });

  if (!rawData) {
    notFound();
  }

  // 2. Cast the JSON fields specifically to satisfy the Restaurant interface
  const restaurantDetails = {
    ...rawData,
    socialMedia: rawData.socialMedia as SocialMediaLinks,
    deliveryApps: rawData.deliveryApps as DeliveryAppLinks,
  } as Restaurant;

  // 3. Now the rest of your code will work without errors
  const socials = (restaurantDetails.socialMedia as SocialMediaLinks) ?? {};
  const deliveryApps = (restaurantDetails.deliveryApps as DeliveryAppLinks) ?? {};
  
  const hasSocials = Object.values(socials).some((url) => url && url.trim() !== "");
  const hasDelivery = Object.values(deliveryApps).some((url) => url && url.trim() !== "");

  const fallbackLogoUrl = `https://placehold.co/150x150/E0E0E0/333333?text=Logo`;

  return (
    <div className={cn("min-h-screen p-4 sm:p-8", "bg-background text-foreground")}>
      <div className={cn("container mx-auto max-w-4xl rounded-lg p-6 shadow-lg sm:p-8", "bg-card")}>
        
        {/* Back to Menu & Delivery Button Row */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href={`/${restaurantSlug}`} passHref>
            <Button
              variant="outline"
              className={cn(
                "flex items-center",
                "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t("backToMenu")}
            </Button>
          </Link>

          {/* Delivery Options Dialog */}
          {hasDelivery && (
            <DeliveryOptionsDialog 
              deliveryApps={deliveryApps} 
              restaurantName={restaurantDetails.name}
              buttonLabel="Order Online" 
            />
          )}
        </div>

        {/* Restaurant Header */}
        <div className="mb-6 flex flex-col items-center border-b pb-6">
          <div className={cn("relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 shadow-md", "border-primary/50")}>
            <Image
              src={restaurantDetails.logoUrl ?? fallbackLogoUrl}
              alt={`${restaurantDetails.name} Logo`}
              fill
              objectFit="cover"
            />
          </div>
          <h1 className="text-foreground mb-2 text-center text-5xl font-extrabold">
            {restaurantDetails.name}
          </h1>
          {restaurantDetails.description && (
            <p className="text-muted-foreground max-w-2xl text-center text-lg">
              {restaurantDetails.description}
            </p>
          )}

          {/* Social Media Links */}
          {hasSocials && (
            <div className="mt-4 flex gap-3">
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
              )}
              {socials.tiktok && (
                <a href={socials.tiktok} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Music2 className="h-6 w-6" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 text-lg md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            {restaurantDetails.foodType && (
              <div className="flex items-center space-x-3">
                <Tag className="text-primary h-6 w-6" />
                <p>
                  <span className="font-semibold">{t("foodTypeLabel")}</span>{" "}
                  {restaurantDetails.foodType}
                </p>
              </div>
            )}

            {restaurantDetails.typeOfEstablishment && (
              <div className="flex items-center space-x-3">
                <Info className="text-primary h-6 w-6" />
                <p>
                  <span className="font-semibold">{t("establishmentTypeLabel")}</span>{" "}
                  {restaurantDetails.typeOfEstablishment}
                </p>
              </div>
            )}

            {restaurantDetails.phoneNumber && (
              <div className="flex items-center space-x-3">
                <Phone className="text-primary h-6 w-6" />
                <p>
                  <span className="font-semibold">{t("phoneLabel")}</span>{" "}
                  {restaurantDetails.phoneNumber}
                </p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {restaurantDetails.address && (
              <div className="flex items-start space-x-3">
                <MapPin className="text-primary h-6 w-6 mt-1 flex-shrink-0" />
                <div className="flex flex-col">
                  <p>
                    <span className="font-semibold">{t("addressLabel")}</span>{" "}
                    {restaurantDetails.address}
                  </p>
                  {/* Map URL Button */}
                  {restaurantDetails.mapUrl && (
                    <a 
                      href={restaurantDetails.mapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline mt-1 text-sm font-medium"
                    >
                      Get Directions
                    </a>
                  )}
                </div>
              </div>
            )}

            {restaurantDetails.country && (
              <div className="flex items-center space-x-3">
                <Globe className="text-primary h-6 w-6" />
                <p>
                  <span className="font-semibold">{t("countryLabel")}</span>{" "}
                  {restaurantDetails.country}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}