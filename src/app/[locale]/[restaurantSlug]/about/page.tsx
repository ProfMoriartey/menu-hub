// src/app/[restaurantSlug]/about/page.tsx

import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ChevronLeft, MapPin, Phone, Globe, Info, Tag } from "lucide-react";
import { cn } from "~/lib/utils"; // Import cn utility

import type { Restaurant } from "~/types/restaurant";

interface PageProps {
  params: Promise<{
    restaurantSlug: string;
  }>;
}

export default async function RestaurantProfilePage({ params }: PageProps) {
  const { restaurantSlug } = await params;

  const restaurantDetails: Restaurant | undefined =
    await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, restaurantSlug),
      with: {
        categories: true,
      },
    });

  if (!restaurantDetails) {
    notFound();
  }

  const fallbackLogoUrl = `https://placehold.co/150x150/E0E0E0/333333?text=Logo`;

  return (
    <div
      className={cn("min-h-screen p-4 sm:p-8", "bg-background text-foreground")}
    >
      <div
        className={cn(
          "container mx-auto max-w-4xl rounded-lg p-6 shadow-lg sm:p-8",
          "bg-card",
        )}
      >
        {/* Back to Menu Button */}
        <Link href={`/${restaurantSlug}`} passHref>
          <Button
            variant="outline"
            className={cn(
              "mb-6 flex items-center",
              "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
          </Button>
        </Link>

        {/* Restaurant Header: Logo, Name, and Basic Info */}
        <div className="mb-6 flex flex-col items-center border-b pb-6">
          <div
            className={cn(
              "relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 shadow-md",
              "border-primary/50",
            )}
          >
            <Image
              src={restaurantDetails.logoUrl ?? fallbackLogoUrl}
              alt={`${restaurantDetails.name} Logo`}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <h1 className="text-foreground mb-2 text-center text-5xl font-extrabold">
            {restaurantDetails.name}
          </h1>
          {restaurantDetails.description && (
            // FIX START: Ensure no stray curly braces here, and comments are correct JSX comments
            <p className="text-muted-foreground max-w-2xl text-center text-lg">
              {restaurantDetails.description}
            </p>
          )}
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 text-lg md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            {/* 1. Food Type */}
            {restaurantDetails.foodType && (
              <div className="flex items-center space-x-3">
                <Tag className="text-primary h-6 w-6" />
                <p>
                  <span className="font-semibold">Food Type:</span>{" "}
                  {restaurantDetails.foodType}
                </p>
              </div>
            )}

            {/* 2. Establishment Type */}
            {restaurantDetails.typeOfEstablishment && (
              <div className="flex items-center space-x-3">
                <Info className="text-primary h-6 w-6" />
                <p>
                  <span className="font-semibold">Establishment Type:</span>{" "}
                  {restaurantDetails.typeOfEstablishment}
                </p>
              </div>
            )}

            {/* 3. Phone Number */}
            {restaurantDetails.phoneNumber && (
              <div className="flex items-center space-x-3">
                <Phone className="text-primary h-6 w-6" />
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {restaurantDetails.phoneNumber}
                </p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* 1. Address */}
            {restaurantDetails.address && (
              <div className="flex items-center space-x-3">
                <MapPin className="text-primary h-6 w-6" />
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {restaurantDetails.address}
                </p>
              </div>
            )}

            {/* 2. Country */}
            {restaurantDetails.country && (
              <div className="flex items-center space-x-3">
                <Globe className="text-primary h-6 w-6" />
                <p>
                  <span className="font-semibold">Country:</span>{" "}
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
