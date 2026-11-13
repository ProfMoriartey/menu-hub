// app/[locale]/[restaurantSlug]/_pages/about-page.tsx
// The about page, for a restaurant (/lokanta/about) and for one of its
// branches (/lokanta/kadikoy/about). A restaurant with several branches
// lists them all on its own about page.
import { branchChoices, branchLabel, findBranchPage, getBranchPage } from "~/server/public-branch"
import { BranchPicker } from "~/components/public/BranchPicker"
import { RestaurantLogo } from "~/components/shared/RestaurantLogo"
import { Link } from "~/i18n/navigation"
import { Button } from "~/components/ui/button"
import { 
  MapPin, Phone, Globe, Info, Tag, 
  Instagram, Facebook, Twitter, Music2, UtensilsCrossed 
} from "lucide-react"
import { cn } from "~/lib/utils"
import { getLocale, getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { clip, publicPageMetadata, restaurantPreviewImage } from "~/server/public-metadata"
import { allMenuLanguages, menuLanguagesOf } from "~/lib/menu-languages"
import { localizeDescription } from "~/server/localize-menu"
import { countryName } from "~/lib/countries"
import { venueTypeLabel } from "~/lib/venue-types"

import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas"
import { DeliveryOptionsDialog } from "~/components/public/DeliveryOptionsDialog"
import { OpeningHoursTable, OpeningStatus, OpenStatusText } from "~/components/public/OpeningHours"
import { PublicPageControls } from "~/components/public/PublicPageControls"

interface AboutPageProps {
  restaurantSlug: string
  // Null on the restaurant's own page.
  branchSlug: string | null
}

export async function aboutPageMetadata({ restaurantSlug, branchSlug }: AboutPageProps): Promise<Metadata> {
  const found = await findBranchPage(restaurantSlug, branchSlug)
  if (found.kind !== "page") return {}
  const { restaurant, branch, isMulti, base } = found
  const t = await getTranslations("PublicMenu")
  const name =
    isMulti && branch
      ? t("branchTitle", { name: restaurant.name, branch: branchLabel(branch, t("mainBranch")) })
      : restaurant.name
  // Where it is and how to reach it: what people look for on this page.
  const locale = await getLocale()
  const place = [restaurant.address, restaurant.city, countryName(restaurant.country, locale)]
    .filter(Boolean)
    .join(", ")
  const languages = menuLanguagesOf(restaurant)
  const description = localizeDescription(restaurant, languages, locale).text
  return publicPageMetadata({
    locale,
    path: `${base}/about`,
    title: t("metaAboutTitle", { name }),
    description: clip(
      [place, description].filter(Boolean).join(" · ") ||
        t("metaMenuDescription", { name: restaurant.name }),
    ),
    image: restaurantPreviewImage(restaurant),
    siteName: restaurant.name,
    menuLanguages: languages && allMenuLanguages(languages),
  })
}

export async function AboutPage({ restaurantSlug, branchSlug }: AboutPageProps) {
  const t = await getTranslations("restaurantProfilePage")
  const tMenu = await getTranslations("PublicMenu")
  const tVenue = await getTranslations("VenueTypes")
  const locale = await getLocale()

  const {
    restaurant: rawData,
    branches,
    branch,
    isMulti,
    base,
  } = await getBranchPage(restaurantSlug, branchSlug, "/about")
  const choices = isMulti ? await branchChoices(rawData.slug, branches, branch, "/about") : []
  // The restaurant's own page lists its branches instead of one address.
  const listBranches = isMulti && !branch

  // The JSON columns are untyped in the database schema.
  const restaurantDetails = {
    ...rawData,
    socialMedia: rawData.socialMedia as SocialMediaLinks | null,
    deliveryApps: rawData.deliveryApps as DeliveryAppLinks | null,
  }
  // In the guest's language when the menu has it (translations on).
  const description = localizeDescription(
    restaurantDetails,
    menuLanguagesOf(restaurantDetails),
    locale,
  )
  const venueType = venueTypeLabel(restaurantDetails.typeOfEstablishment, tVenue)
  const cityAndCountry = [restaurantDetails.city, countryName(restaurantDetails.country, locale)]
    .filter(Boolean)
    .join(", ")

  const socials = restaurantDetails.socialMedia ?? ({} as SocialMediaLinks)
  const deliveryApps = restaurantDetails.deliveryApps ?? ({} as DeliveryAppLinks)
  
  const hasSocials = Object.values(socials).some((url) => url && url.trim() !== "")
  const hasDelivery = Object.values(deliveryApps).some((url) => url && url.trim() !== "")

  const themeClass = `theme-${restaurantDetails.theme ?? "default"}`

  return (
    <div className={cn("relative", themeClass)}>
      {/* The band in the restaurant's colour, as under the menu's header. */}
      <div aria-hidden className="bg-brand h-1.5" />
      <div className="relative p-4 sm:p-8">
      
      {/* Theme Toggle - Top Right */}
      <div className="absolute end-4 top-4 z-50">
        {/* On the ground: the controls sit on a paper card. */}
        <PublicPageControls className="bg-card rounded-full p-0.5 shadow-sm" />
      </div>

      <div className="bg-card text-card-foreground border-border/60 container mx-auto mt-14 max-w-4xl rounded-3xl border p-6 shadow-[0_2px_6px_rgb(34_26_23/0.08)] sm:p-8">
        
        {/* Header section - centered for mobile and desktop */}
        <div className="mb-10 flex flex-col items-center border-b pb-8">
          <RestaurantLogo
            restaurant={restaurantDetails}
            className="border-primary/50 mb-6 h-32 w-32 rounded-full border-4 text-4xl shadow-md"
            imageSizes="128px"
            priority
          />

          <h1 className="text-foreground mb-4 text-center text-4xl sm:text-5xl font-extrabold">
            {restaurantDetails.name}
          </h1>
          {isMulti && (
            <BranchPicker
              restaurantName={restaurantDetails.name}
              branches={choices}
              allHref={`/${restaurantDetails.slug}/about`}
              onAll={!branch}
              className="-mt-1 mb-6"
            />
          )}

          {/* Action buttons directly under logo */}
          <div className="mb-6 w-full max-w-sm grid grid-cols-2 gap-3 sm:flex sm:max-w-none sm:justify-center sm:gap-4">
            <Link href={base} passHref className="w-full sm:w-auto">
              <Button size="lg" className="w-full font-bold px-4">
                <UtensilsCrossed className="me-2 h-4 w-4 sm:h-5 sm:w-5" />
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

          {description.text && (
            <p
              className="text-muted-foreground max-w-2xl text-center text-lg leading-relaxed"
              lang={description.lang}
              dir="auto"
            >
              {description.text}
            </p>
          )}

          {/* Social icons under description */}
          {hasSocials && (
            <div className="mt-6 flex gap-2">
              {socials.instagram && (
                <a href={socials.instagram} aria-label="Instagram" title="Instagram" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary inline-flex size-11 items-center justify-center rounded-full transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {socials.facebook && (
                <a href={socials.facebook} aria-label="Facebook" title="Facebook" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary inline-flex size-11 items-center justify-center rounded-full transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} aria-label="Twitter" title="Twitter" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary inline-flex size-11 items-center justify-center rounded-full transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
              )}
              {socials.tiktok && (
                <a href={socials.tiktok} aria-label="TikTok" title="TikTok" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary inline-flex size-11 items-center justify-center rounded-full transition-colors">
                  <Music2 className="h-6 w-6" />
                </a>
              )}
              {socials.website && (
                <a href={socials.website} aria-label={tMenu("websiteLabel")} title={tMenu("websiteLabel")} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary inline-flex size-11 items-center justify-center rounded-full transition-colors">
                  <Globe className="h-6 w-6" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Details and Map section */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          
          {/* Left Column - Contact and Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold border-s-4 border-primary ps-3">
              {t("informationHeading")}
            </h2>
            
            <div className="space-y-4">
              {restaurantDetails.foodType && (
                <div className="flex items-center gap-4">
                  <Tag className="text-primary h-6 w-6 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">{t("foodTypeLabel")}</p>
                    <p className="text-lg">{restaurantDetails.foodType}</p>
                  </div>
                </div>
              )}

              {venueType && (
                <div className="flex items-center gap-4">
                  <Info className="text-primary h-6 w-6 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">{t("establishmentTypeLabel")}</p>
                    <p className="text-lg">{venueType}</p>
                  </div>
                </div>
              )}

{restaurantDetails.phoneNumber && (
                <div className="flex items-center gap-4">
                  <Phone className="text-primary h-6 w-6 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">{t("phoneLabel")}</p>
                    {/* The number reads left to right, but the line still aligns with the page. */}
                    <p className="text-lg"><span dir="ltr">{restaurantDetails.phoneNumber}</span></p>
                  </div>
                </div>
              )}

              {cityAndCountry && (
                <div className="flex items-center gap-4">
                  <Globe className="text-primary h-6 w-6 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">{t("locationLabel")}</p>
                    <p className="text-lg">{cityAndCountry}</p>
                  </div>
                </div>
              )}
            </div>

            {restaurantDetails.openingHours && restaurantDetails.timeZone && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold border-s-4 border-primary ps-3">
                    {tMenu("hoursHeading")}
                  </h2>
                  <OpeningStatus
                    hours={restaurantDetails.openingHours}
                    timeZone={restaurantDetails.timeZone}
                  />
                </div>
                <OpeningHoursTable
                  hours={restaurantDetails.openingHours}
                  timeZone={restaurantDetails.timeZone}
                />
              </div>
            )}
          </div>

          {/* Right Column - every branch, or the address and map */}
          {listBranches ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold border-s-4 border-primary ps-3">
                {t("branchesHeading")}
              </h2>
              <ul className="space-y-3">
                {branches.map((b) => {
                  const choice = choices.find((c) => c.id === b.id)!
                  return (
                    <li key={b.id} className="border-border rounded-xl border p-4">
                      <Link href={choice.href} className="inline-flex min-h-11 items-center text-lg font-semibold hover:underline">
                        {choice.label}
                      </Link>
                      {choice.place && <p className="text-muted-foreground">{choice.place}</p>}
                      <OpenStatusText hours={choice.hours} timeZone={choice.timeZone} className="mt-1 text-sm" />
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 text-sm">
                        {b.phoneNumber && (
                          <a href={`tel:${b.phoneNumber}`} className="text-primary inline-flex min-h-11 items-center gap-1.5 font-medium hover:underline">
                            <Phone className="h-4 w-4" aria-hidden /> <span dir="ltr">{b.phoneNumber}</span>
                          </a>
                        )}
                        {b.mapUrl && (
                          <a href={b.mapUrl} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex min-h-11 items-center font-medium hover:underline">
                            {t("getDirections")}
                          </a>
                        )}
                        <Link href={choice.href} className="text-primary inline-flex min-h-11 items-center font-medium hover:underline">
                          {t("branchDetails")}
                        </Link>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold border-s-4 border-primary ps-3">
              {t("locationHeading")}
            </h2>

            <div className="space-y-4">
              {restaurantDetails.address && (
                <div className="flex items-start gap-4">
                  <MapPin className="text-primary h-6 w-6 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">{t("addressLabel")}</p>
                    <p className="text-lg mb-2">{restaurantDetails.address}</p>
                    {restaurantDetails.mapUrl && (
                      <a 
                        href={restaurantDetails.mapUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary inline-flex min-h-11 items-center font-medium hover:underline"
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
          )}
        </div>
      </div>
      </div>
    </div>
  )
}