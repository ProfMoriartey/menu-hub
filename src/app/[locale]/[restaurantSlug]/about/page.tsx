// app/[locale]/(public)/[restaurantSlug]/about/page.tsx
import { db } from "~/server/db"
import { restaurants } from "~/server/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { 
  ChevronLeft, MapPin, Phone, Globe, Info, Tag, 
  Instagram, Facebook, Twitter, Music2, UtensilsCrossed 
} from "lucide-react"
import { cn } from "~/lib/utils"
import { getTranslations } from "next-intl/server"

import type { Restaurant } from "~/types/restaurant"
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas"
import { DeliveryOptionsDialog } from "~/components/public/DeliveryOptionsDialog"

interface PageProps {
  params: Promise<{
    restaurantSlug: string
  }>
}

export default async function RestaurantProfilePage({ params }: PageProps) {
  const { restaurantSlug } = await params
  const t = await getTranslations("restaurantProfilePage")

  const rawData = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
    with: {
      categories: true,
    },
  })

  if (!rawData) {
    notFound()
  }

  const restaurantDetails = {
    ...rawData,
    socialMedia: rawData.socialMedia as SocialMediaLinks,
    deliveryApps: rawData.deliveryApps as DeliveryAppLinks,
  } as Restaurant

  const socials = restaurantDetails.socialMedia ?? ({} as SocialMediaLinks)
  const deliveryApps = restaurantDetails.deliveryApps ?? ({} as DeliveryAppLinks)
  
  const hasSocials = Object.values(socials).some((url) => url && url.trim() !== "")
  const hasDelivery = Object.values(deliveryApps).some((url) => url && url.trim() !== "")

  const fallbackLogoUrl = `https://placehold.co/150x150/E0E0E0/333333?text=Logo`

  return (
    <div className={cn("min-h-screen p-4 sm:p-8", "bg-background text-foreground")}>
      <div className={cn("container mx-auto max-w-4xl rounded-lg p-6 shadow-lg sm:p-8", "bg-card")}>
        
        {/* Navigation row */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        </div>

        {/* Header section - centered for mobile and desktop */}
        <div className="mb-10 flex flex-col items-center border-b pb-8">
          <div className={cn("relative mb-6 h-32 w-32 overflow-hidden rounded-full border-4 shadow-md", "border-primary/50")}>
            <Image
              src={restaurantDetails.logoUrl ?? fallbackLogoUrl}
              alt={`${restaurantDetails.name} Logo`}
              fill
              className="object-cover"
            />
          </div>

          <h1 className="text-foreground mb-4 text-center text-4xl sm:text-5xl font-extrabold">
            {restaurantDetails.name}
          </h1>

          {/* Action buttons directly under logo */}
          <div className="mb-6 w-full max-w-sm grid grid-cols-2 gap-3 sm:flex sm:max-w-none sm:justify-center sm:gap-4">
            <Link href={`/${restaurantSlug}`} passHref className="w-full sm:w-auto">
              <Button size="lg" className="w-full font-bold px-4">
                <UtensilsCrossed className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {t("menuButton")}
              </Button>
            </Link>
            {hasDelivery && (
              <div className="w-full sm:w-auto">
                <DeliveryOptionsDialog 
                  deliveryApps={deliveryApps} 
                  restaurantName={restaurantDetails.name}
                  buttonLabel={t("orderButton")} 
                />
              </div>
            )}
          </div>

          {restaurantDetails.description && (
            <p className="text-muted-foreground max-w-2xl text-center text-lg leading-relaxed">
              {restaurantDetails.description}
            </p>
          )}

          {/* Social icons under description */}
          {hasSocials && (
            <div className="mt-6 flex gap-5">
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-7 w-7" />
                </a>
              )}
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-7 w-7" />
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-7 w-7" />
                </a>
              )}
              {socials.tiktok && (
                <a href={socials.tiktok} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Music2 className="h-7 w-7" />
                </a>
              )}
              {socials.website && (
                <a href={socials.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Globe className="h-7 w-7" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Details and Map section */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          
          {/* Left Column - Contact and Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold border-l-4 border-primary pl-3">
              {t("informationHeading")}
            </h2>
            
            <div className="space-y-4">
              {restaurantDetails.foodType && (
                <div className="flex items-center space-x-4">
                  <Tag className="text-primary h-6 w-6 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">{t("foodTypeLabel")}</p>
                    <p className="text-lg">{restaurantDetails.foodType}</p>
                  </div>
                </div>
              )}

              {restaurantDetails.typeOfEstablishment && (
                <div className="flex items-center space-x-4">
                  <Info className="text-primary h-6 w-6 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">{t("establishmentTypeLabel")}</p>
                    <p className="text-lg">{restaurantDetails.typeOfEstablishment}</p>
                  </div>
                </div>
              )}

              {restaurantDetails.phoneNumber && (
                <div className="flex items-center space-x-4">
                  <Phone className="text-primary h-6 w-6 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">{t("phoneLabel")}</p>
                    <p className="text-lg">{restaurantDetails.phoneNumber}</p>
                  </div>
                </div>
              )}

              {restaurantDetails.country && (
                <div className="flex items-center space-x-4">
                  <Globe className="text-primary h-6 w-6 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">{t("countryLabel")}</p>
                    <p className="text-lg">{restaurantDetails.country}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Address and Map */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold border-l-4 border-primary pl-3">
              {t("locationHeading")}
            </h2>

            <div className="space-y-4">
              {restaurantDetails.address && (
                <div className="flex items-start space-x-4">
                  <MapPin className="text-primary h-6 w-6 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">{t("addressLabel")}</p>
                    <p className="text-lg mb-2">{restaurantDetails.address}</p>
                    {restaurantDetails.mapUrl && (
                      <a 
                        href={restaurantDetails.mapUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        {t("getDirections")}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Map Embed element */}
              {restaurantDetails.address && (
                <div className="mt-4 h-64 w-full overflow-hidden rounded-xl border border-border shadow-inner">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(restaurantDetails.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="filter contrast-125 opacity-90"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}