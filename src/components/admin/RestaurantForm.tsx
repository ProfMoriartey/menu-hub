// src/components/admin/RestaurantForm.tsx
"use client";

import Image from "next/image";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { UploadButton } from "~/utils/uploadthing";
import { XCircle, Link as LinkIcon, MapPin, Search } from "lucide-react";
import { Textarea } from "~/components/ui/textarea";
import { useTranslations } from "next-intl";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";

import type { Restaurant } from "~/types/restaurant";
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas";

interface RestaurantFormProps {
  initialData?: Restaurant;
  formErrors: Record<string, string>;

  currentName: string;
  onNameChange: (value: string) => void;
  onLogoUrlChange: (url: string | null) => void;
  onIsActiveChange: (checked: boolean) => void;
  onIsDisplayedChange: (checked: boolean) => void;
  onCurrencyChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onTypeOfEstablishmentChange: (value: string) => void;
  onCountryChange: (value: string) => void;

  currentIsActive: boolean;
  currentIsDisplayed: boolean;
  currentLogoUrl: string | null;
  currentCurrency: string;
  currentPhoneNumber: string;
  currentDescription: string;
  currentTheme: string;
  currentTypeOfEstablishment: string;
  currentCountry: string;

  // --- NEW PROPS FOR SEO, MAP & LINKS ---
  currentMapUrl: string;
  onMapUrlChange: (value: string) => void;
  currentMetaTitle: string;
  onMetaTitleChange: (value: string) => void;
  currentMetaDescription: string;
  onMetaDescriptionChange: (value: string) => void;
  
  currentSocialMedia: SocialMediaLinks;
  onSocialMediaChange: (key: keyof SocialMediaLinks, value: string) => void;
  
  currentDeliveryApps: DeliveryAppLinks;
  onDeliveryAppsChange: (key: keyof DeliveryAppLinks, value: string) => void;
}

export function RestaurantForm({
  initialData,
  formErrors,

  currentName,
  onNameChange,
  onLogoUrlChange,
  onIsActiveChange,
  onIsDisplayedChange,
  onCurrencyChange,
  onPhoneNumberChange,
  onDescriptionChange,
  onThemeChange,
  onTypeOfEstablishmentChange,
  currentIsActive,
  currentIsDisplayed,
  currentLogoUrl,
  currentCurrency,
  currentPhoneNumber,
  currentDescription,
  currentTheme,
  currentTypeOfEstablishment,
  onCountryChange,
  currentCountry,

  // NEW DESTRUCTURED PROPS
  currentMapUrl,
  onMapUrlChange,
  currentMetaTitle,
  onMetaTitleChange,
  currentMetaDescription,
  onMetaDescriptionChange,
  currentSocialMedia,
  onSocialMediaChange,
  currentDeliveryApps,
  onDeliveryAppsChange,
}: RestaurantFormProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {/* COLUMN 1: Basic Info */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
           Basic Details
        </h3>
        
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={currentName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Restaurant Name"
            required
          />
          {formErrors.name && <p className="mt-1 text-sm text-destructive">{formErrors.name}</p>}
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={initialData?.slug ?? ""}
            required
          />
          {formErrors.slug && <p className="mt-1 text-sm text-destructive">{formErrors.slug}</p>}
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={currentCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            defaultValue={initialData?.address ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            name="currency"
            value={currentCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={currentPhoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
          />
        </div>
        
         <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="isActive"
            name="isActive"
            checked={currentIsActive}
            onCheckedChange={onIsActiveChange}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isDisplayed"
            name="isDisplayed"
            checked={currentIsDisplayed}
            onCheckedChange={onIsDisplayedChange}
          />
          <Label htmlFor="isDisplayed">Display on Public Site</Label>
        </div>
      </div>

      {/* COLUMN 2: Branding & External Links */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
           Branding & External Links
        </h3>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={currentDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="theme">Theme</Label>
          <Input
            id="theme"
            name="theme"
            value={currentTheme}
            onChange={(e) => onThemeChange(e.target.value)}
            placeholder="e.g., classic, sidebar-list"
          />
        </div>

        <div>
          <Label htmlFor="mapUrl" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> Map Link (Google/Apple)
          </Label>
          <Input
            id="mapUrl"
            name="mapUrl"
            type="url"
            value={currentMapUrl}
            onChange={(e) => onMapUrlChange(e.target.value)}
            placeholder="https://maps.google.com/..."
          />
          {formErrors.mapUrl && <p className="mt-1 text-sm text-destructive">{formErrors.mapUrl}</p>}
        </div>

        {/* Social Media Group */}
        <div className="space-y-3 pt-2">
          <Label className="flex items-center gap-1">
            <LinkIcon className="h-4 w-4" /> Social Media Links
          </Label>
          <Input
            placeholder="Instagram URL"
            value={currentSocialMedia?.instagram ?? ""}
            onChange={(e) => onSocialMediaChange("instagram", e.target.value)}
          />
          <Input
            placeholder="Facebook URL"
            value={currentSocialMedia?.facebook ?? ""}
            onChange={(e) => onSocialMediaChange("facebook", e.target.value)}
          />
          <Input
            placeholder="TikTok URL"
            value={currentSocialMedia?.tiktok ?? ""}
            onChange={(e) => onSocialMediaChange("tiktok", e.target.value)}
          />
        </div>
        
        {/* Logo Upload */}
        <div className="space-y-2 pt-4">
          <Label htmlFor="logoUrl">Restaurant Logo</Label>
          {currentLogoUrl && (
            <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-md border border-border">
              <Image
                width={96}
                height={96}
                src={currentLogoUrl}
                alt="Logo Preview"
                className="h-full w-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => onLogoUrlChange(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
          <UploadButton
            endpoint="logoUploader"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0 && res[0]) {
                onLogoUrlChange(res[0].url);
              }
            }}
            onUploadError={(error: Error) => {
              console.error(`ERROR! ${error.message}`);
            }}
          />
        </div>
      </div>

      {/* COLUMN 3: Delivery Apps & SEO */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        
        {/* SEO Group */}
        <div className="space-y-3 mb-6">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Search className="h-4 w-4" /> Search Engine Optimization (SEO)
          </h3>
          
          <div>
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              name="metaTitle"
              value={currentMetaTitle}
              onChange={(e) => onMetaTitleChange(e.target.value)}
              placeholder="e.g., Best Pizza in Town | Mario's"
            />
          </div>
          
          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              name="metaDescription"
              value={currentMetaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              rows={2}
              placeholder="Short description for search results..."
            />
          </div>
        </div>

        {/* Delivery Apps Group */}
        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
             Delivery Platforms
          </h3>
          
          <Input
            placeholder="Yemeksepeti URL"
            value={currentDeliveryApps?.yemeksepeti ?? ""}
            onChange={(e) => onDeliveryAppsChange("yemeksepeti", e.target.value)}
          />
          <Input
            placeholder="Getir URL"
            value={currentDeliveryApps?.getir ?? ""}
            onChange={(e) => onDeliveryAppsChange("getir", e.target.value)}
          />
           <Input
            placeholder="Trendyol Yemek URL"
            value={currentDeliveryApps?.trendyolYemek ?? ""}
            onChange={(e) => onDeliveryAppsChange("trendyolYemek", e.target.value)}
          />
          <Input
            placeholder="UberEats URL"
            value={currentDeliveryApps?.uberEats ?? ""}
            onChange={(e) => onDeliveryAppsChange("uberEats", e.target.value)}
          />
        </div>
      </div>

    </div>
  );
}