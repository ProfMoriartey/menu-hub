// src/app/[restaurantSlug]/about/page.tsx

import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation"; // Keep this for actual "slug not found" cases
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ChevronLeft, MapPin, Phone, Globe, Info, Tag } from "lucide-react";

import type { Restaurant } from "~/types/restaurant";

interface PageProps {
  params: Promise<{
    restaurantSlug: string;
  }>;
}

export default async function RestaurantProfilePage({ params }: PageProps) {
  const { restaurantSlug } = await params;

  // Fetch restaurant details
  const restaurantDetails: Restaurant | undefined =
    await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, restaurantSlug),
      with: {
        categories: true,
      },
    });

  // --- REMOVE THIS BLOCK ---
  // if (!restaurantDetails?.isDisplayed) {
  //   notFound();
  // }
  // --- END REMOVE BLOCK ---

  // Keep this check for cases where the slug genuinely doesn't exist in the DB
  if (!restaurantDetails) {
    notFound();
  }

  const fallbackLogoUrl = `https://placehold.co/150x150/E0E0E0/333333?text=Logo`;

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-800 sm:p-8">
      <div className="container mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg sm:p-8">
        {/* Back to Menu Button */}
        <Link href={`/${restaurantSlug}`} passHref>
          <Button variant="outline" className="mb-6 flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Menu
          </Button>
        </Link>

        {/* Restaurant Header: Logo, Name, and Basic Info */}
        <div className="mb-6 flex flex-col items-center border-b pb-6">
          <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-blue-200 shadow-md">
            <Image
              src={restaurantDetails.logoUrl ?? fallbackLogoUrl}
              alt={`${restaurantDetails.name} Logo`}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <h1 className="mb-2 text-center text-5xl font-extrabold text-gray-900">
            {restaurantDetails.name}
          </h1>
          {restaurantDetails.description && (
            <p className="max-w-2xl text-center text-lg text-gray-700">
              {restaurantDetails.description}
            </p>
          )}
        </div>

        {/* Details Section - Reordered and Filtered */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 text-lg md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            {/* 1. Food Type */}
            {restaurantDetails.foodType && (
              <div className="flex items-center space-x-3">
                <Tag className="h-6 w-6 text-blue-600" />
                <p>
                  <span className="font-semibold">Food Type:</span>{" "}
                  {restaurantDetails.foodType}
                </p>
              </div>
            )}

            {/* 2. Establishment Type */}
            {restaurantDetails.typeOfEstablishment && (
              <div className="flex items-center space-x-3">
                <Info className="h-6 w-6 text-blue-600" />
                <p>
                  <span className="font-semibold">Establishment Type:</span>{" "}
                  {restaurantDetails.typeOfEstablishment}
                </p>
              </div>
            )}

            {/* 3. Phone Number */}
            {restaurantDetails.phoneNumber && (
              <div className="flex items-center space-x-3">
                <Phone className="h-6 w-6 text-blue-600" />
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
                <MapPin className="h-6 w-6 text-blue-600" />
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {restaurantDetails.address}
                </p>
              </div>
            )}

            {/* 2. Country */}
            {restaurantDetails.country && (
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-blue-600" />
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
