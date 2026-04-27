"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { UploadButton } from "~/utils/uploadthing";
import { 
  XCircle, 
  MapPin, 
  ShoppingBag, 
  Link as LinkIcon, 
  Store,
  Globe
} from "lucide-react";
import type { Restaurant } from "~/types/restaurant";
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas";

const CustomImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <img src={src} alt={alt} className={className} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
);

interface UserRestaurantFormProps {
  initialData: Restaurant;
  formErrors: Record<string, string>;

  // Handlers
  onLogoUrlChange: (url: string | null) => void;
  onPhoneNumberChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onMapUrlChange: (value: string) => void;
  onSocialMediaChange: (key: keyof SocialMediaLinks, value: string) => void;
  onDeliveryAppsChange: (key: keyof DeliveryAppLinks, value: string) => void;

  // Values
  currentLogoUrl: string | null;
  currentPhoneNumber: string;
  currentDescription: string;
  currentMapUrl: string;
  currentSocialMedia: SocialMediaLinks;
  currentDeliveryApps: DeliveryAppLinks;
}

export function UserRestaurantForm({
  initialData,
  formErrors,
  onLogoUrlChange,
  onPhoneNumberChange,
  onDescriptionChange,
  onMapUrlChange,
  onSocialMediaChange,
  onDeliveryAppsChange,
  currentLogoUrl,
  currentPhoneNumber,
  currentDescription,
  currentMapUrl,
  currentSocialMedia,
  currentDeliveryApps,
}: UserRestaurantFormProps) {
  const t = useTranslations("RestaurantForm");

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* LEFT COLUMN: Essential Details */}
      <div className="space-y-6">
        <section className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-semibold">
            <Store className="h-5 w-5" /> Restaurant Profile
          </h3>
          
          <div>
            <Label className="mb-2" htmlFor="name">Restaurant Name</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={initialData.name ?? ""} 
              readOnly 
              className="cursor-not-allowed bg-muted/50 text-muted-foreground" 
            />
          </div>

          <div>
            <Label className="mb-2" htmlFor="address">Address</Label>
            <Input 
              id="address" 
              name="address" 
              defaultValue={initialData.address ?? ""} 
              placeholder="Full street address..."
            />
          </div>

          <div>
            <Label className="mb-2" htmlFor="phoneNumber">{t("labelPhoneNumber")}</Label>
            <Input 
              id="phoneNumber" 
              name="phoneNumber" 
              value={currentPhoneNumber} 
              onChange={(e) => onPhoneNumberChange(e.target.value)} 
              type="tel" 
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-2" htmlFor="mapUrl">
              <MapPin className="h-4 w-4" /> {t("labelMapUrl")}
            </Label>
            <Input 
              id="mapUrl" 
              name="mapUrl" 
              value={currentMapUrl} 
              onChange={(e) => onMapUrlChange(e.target.value)} 
              placeholder="Google or Apple Maps link..." 
            />
          </div>

          <div>
            <Label className="mb-2" htmlFor="description">About the Restaurant</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={currentDescription} 
              onChange={(e) => onDescriptionChange(e.target.value)} 
              rows={4} 
              placeholder="Describe your cuisine, atmosphere, and story..."
            />
          </div>

          <div className="pt-2">
            <Label className="mb-2 block">{t("labelLogo")}</Label>
            {currentLogoUrl ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                <CustomImage src={currentLogoUrl} alt="Logo" />
                <Button 
                  type="button"
                  variant="destructive" 
                  size="icon" 
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full" 
                  onClick={() => onLogoUrlChange(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <UploadButton 
                endpoint="logoUploader" 
                className="ut-button:h-10 ut-button:w-32 ut-button:text-sm" 
                onClientUploadComplete={(res) => res?.[0] && onLogoUrlChange(res[0].url)} 
                onUploadError={(error: Error) => console.error(error.message)}
              />
            )}
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: Links & Delivery */}
      <div className="space-y-6">
        <section className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-semibold">
            <LinkIcon className="h-5 w-5" /> Social & Website
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Instagram</Label>
              <Input value={currentSocialMedia.instagram ?? ""} onChange={(e) => onSocialMediaChange("instagram", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Facebook</Label>
              <Input value={currentSocialMedia.facebook ?? ""} onChange={(e) => onSocialMediaChange("facebook", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Twitter</Label>
              <Input value={currentSocialMedia.twitter ?? ""} onChange={(e) => onSocialMediaChange("twitter", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">TikTok</Label>
              <Input value={currentSocialMedia.tiktok ?? ""} onChange={(e) => onSocialMediaChange("tiktok", e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="pt-2">
            <Label className="mb-1 text-xs text-muted-foreground">Official Website</Label>
            <div className="relative">
              <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                value={currentSocialMedia.website ?? ""}
                onChange={(e) => onSocialMediaChange("website", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-semibold">
            <ShoppingBag className="h-5 w-5" /> Delivery Platforms
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Yemeksepeti</Label>
              <Input value={currentDeliveryApps.yemeksepeti ?? ""} onChange={(e) => onDeliveryAppsChange("yemeksepeti", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Getir</Label>
              <Input value={currentDeliveryApps.getir ?? ""} onChange={(e) => onDeliveryAppsChange("getir", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Trendyol Yemek</Label>
              <Input value={currentDeliveryApps.trendyolYemek ?? ""} onChange={(e) => onDeliveryAppsChange("trendyolYemek", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Migros Yemek</Label>
              <Input value={currentDeliveryApps.migrosYemek ?? ""} onChange={(e) => onDeliveryAppsChange("migrosYemek", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">UberEats</Label>
              <Input value={currentDeliveryApps.uberEats ?? ""} onChange={(e) => onDeliveryAppsChange("uberEats", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Deliveroo</Label>
              <Input value={currentDeliveryApps.deliveroo ?? ""} onChange={(e) => onDeliveryAppsChange("deliveroo", e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="pt-2">
            <Label className="mb-1 text-xs text-muted-foreground">Other Delivery Link</Label>
            <Input
              value={currentDeliveryApps.customLink ?? ""}
              onChange={(e) => onDeliveryAppsChange("customLink", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </section>
      </div>
    </div>
  );
}