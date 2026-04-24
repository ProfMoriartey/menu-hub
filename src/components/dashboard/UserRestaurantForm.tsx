"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { UploadButton } from "~/utils/uploadthing";
import { XCircle, Instagram, Facebook, Twitter, MapPin, Search, ShoppingBag, Link as LinkIcon } from "lucide-react";
import type { Restaurant } from "~/types/restaurant";
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas";
import { cn } from "~/lib/utils";

// Local component to replace next/image
const CustomImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <img src={src} alt={alt} className={className} style={{ width: "100%", height: "100%" }} />
);

interface UserRestaurantFormProps {
  initialData: Restaurant;
  formErrors: Record<string, string>;

  // Handlers
  onLogoUrlChange: (url: string | null) => void;
  onCurrencyChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTypeOfEstablishmentChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  
  // NEW Handlers
  onMapUrlChange: (value: string) => void;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onSocialMediaChange: (key: keyof SocialMediaLinks, value: string) => void;
  onDeliveryAppsChange: (key: keyof DeliveryAppLinks, value: string) => void;

  // Current values
  currentLogoUrl: string | null;
  currentCurrency: string;
  currentPhoneNumber: string;
  currentDescription: string;
  currentTypeOfEstablishment: string;
  currentCountry: string;
  
  // NEW Values
  currentMapUrl: string;
  currentMetaTitle: string;
  currentMetaDescription: string;
  currentSocialMedia: SocialMediaLinks;
  currentDeliveryApps: DeliveryAppLinks;
}

export function UserRestaurantForm({
  initialData,
  formErrors,
  onLogoUrlChange,
  onCurrencyChange,
  onPhoneNumberChange,
  onDescriptionChange,
  onTypeOfEstablishmentChange,
  onCountryChange,
  onMapUrlChange,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onSocialMediaChange,
  onDeliveryAppsChange,
  currentLogoUrl,
  currentCurrency,
  currentPhoneNumber,
  currentDescription,
  currentTypeOfEstablishment,
  currentCountry,
  currentMapUrl,
  currentMetaTitle,
  currentMetaDescription,
  currentSocialMedia,
  currentDeliveryApps,
}: UserRestaurantFormProps) {
  const t = useTranslations("RestaurantForm");

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* LEFT COLUMN: Essential Details & Branding */}
      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">{t("sectionBasicInfo")}</h3>
          
          <div>
            <Label className="mb-2" htmlFor="name">{t("labelName")}</Label>
            <Input id="name" name="name" defaultValue={initialData.name ?? ""} readOnly className="bg-muted/50 text-muted-foreground cursor-not-allowed" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2" htmlFor="country">{t("labelCountry")}</Label>
              <Input id="country" name="country" value={currentCountry} onChange={(e) => onCountryChange(e.target.value)} required />
            </div>
            <div>
              <Label className="mb-2" htmlFor="currency">{t("labelCurrency")}</Label>
              <Input id="currency" name="currency" value={currentCurrency} onChange={(e) => onCurrencyChange(e.target.value)} required />
            </div>
          </div>

          <div>
            <Label className="mb-2" htmlFor="phoneNumber">{t("labelPhoneNumber")}</Label>
            <Input id="phoneNumber" name="phoneNumber" value={currentPhoneNumber} onChange={(e) => onPhoneNumberChange(e.target.value)} type="tel" />
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-2" htmlFor="mapUrl">
              <MapPin className="h-4 w-4" /> {t("labelMapUrl")}
            </Label>
            <Input id="mapUrl" name="mapUrl" value={currentMapUrl} onChange={(e) => onMapUrlChange(e.target.value)} placeholder="Google Maps link..." />
          </div>
        </section>

        <section className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
            <LinkIcon className="h-4 w-4" /> {t("sectionSocialMedia")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">Instagram</Label>
              <Input value={currentSocialMedia.instagram ?? ""} onChange={(e) => onSocialMediaChange("instagram", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">Facebook</Label>
              <Input value={currentSocialMedia.facebook ?? ""} onChange={(e) => onSocialMediaChange("facebook", e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: Marketing, Delivery & SEO */}
      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">{t("sectionBranding")}</h3>
          
          <div>
            <Label className="mb-2" htmlFor="description">{t("labelShortDescription")}</Label>
            <Textarea id="description" value={currentDescription} onChange={(e) => onDescriptionChange(e.target.value)} rows={3} />
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-1">
              <Label className="mb-2" htmlFor="typeOfEstablishment">{t("labelTypeOfEstablishment")}</Label>
              <Input id="typeOfEstablishment" value={currentTypeOfEstablishment} onChange={(e) => onTypeOfEstablishmentChange(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("labelLogo")}</Label>
              {currentLogoUrl ? (
                <div className="relative h-20 w-20 border rounded-md overflow-hidden">
                  <CustomImage src={currentLogoUrl} alt="Logo" />
                  <Button variant="destructive" size="icon" className="absolute -top-1 -right-1 h-5 w-5 rounded-full" onClick={() => onLogoUrlChange(null)}>
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <UploadButton 
                  endpoint="logoUploader" 
                  className="ut-button:h-20 ut-button:w-20 ut-button:text-[10px]" 
                  onClientUploadComplete={(res) => res?.[0] && onLogoUrlChange(res[0].url)} 
                />
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> {t("sectionDelivery")}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Yemeksepeti" value={currentDeliveryApps.yemeksepeti ?? ""} onChange={(e) => onDeliveryAppsChange("yemeksepeti", e.target.value)} />
            <Input placeholder="Getir" value={currentDeliveryApps.getir ?? ""} onChange={(e) => onDeliveryAppsChange("getir", e.target.value)} />
          </div>
        </section>

        <section className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
            <Search className="h-4 w-4" /> {t("sectionSEO")}
          </h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">{t("labelMetaTitle")}</Label>
              <Input value={currentMetaTitle} onChange={(e) => onMetaTitleChange(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">{t("labelMetaDescription")}</Label>
              <Textarea value={currentMetaDescription} onChange={(e) => onMetaDescriptionChange(e.target.value)} rows={2} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}