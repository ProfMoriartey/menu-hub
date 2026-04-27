"use client";

import Image from "next/image";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { UploadButton } from "~/utils/uploadthing";
import { XCircle, Link as LinkIcon, MapPin, Search, Utensils, Globe } from "lucide-react";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "../ui/button";

import type { Restaurant } from "~/types/restaurant";
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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
  
  // 🛑 ADDED: Missing foodType props
  currentFoodType: string;
  onFoodTypeChange: (value: string) => void;

  currentIsActive: boolean;
  currentIsDisplayed: boolean;
  currentLogoUrl: string | null;
  currentCurrency: string;
  currentPhoneNumber: string;
  currentDescription: string;
  currentTheme: string;
  currentTypeOfEstablishment: string;
  currentCountry: string;

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
  
  currentFoodType,
  onFoodTypeChange,

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* COLUMN 1: Basic Info */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold flex items-center gap-2 border-b pb-2">
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

        <div className="grid grid-cols-2 gap-3">
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
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              name="currency"
              value={currentCurrency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              required
            />
          </div>
        </div>

        {/* 🛑 RESTORED: Food Type & Establishment Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="foodType" className="flex items-center gap-1">
              <Utensils className="h-3 w-3" /> Food Type
            </Label>
            <Input
              id="foodType"
              name="foodType"
              value={currentFoodType}
              onChange={(e) => onFoodTypeChange(e.target.value)}
              placeholder="e.g., Italian, Fast Food"
            />
          </div>
          <div>
             <Label htmlFor="typeOfEstablishment">Category</Label>
             <Input
               id="typeOfEstablishment"
               name="typeOfEstablishment"
               value={currentTypeOfEstablishment}
               onChange={(e) => onTypeOfEstablishmentChange(e.target.value)}
               placeholder="e.g., Cafe, Fine Dining"
             />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            defaultValue={initialData?.address ?? ""}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
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
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={currentPhoneNumber}
              onChange={(e) => onPhoneNumberChange(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
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
            <Label htmlFor="isDisplayed">Public Visibility</Label>
          </div>
        </div>
      </div>

      {/* COLUMN 2: Branding & External Links */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold flex items-center gap-2 border-b pb-2">
           Branding & Location
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
          <Select value={currentTheme} onValueChange={onThemeChange}>
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="sidebar-list">Sidebar List</SelectItem>
              <SelectItem value="accordion-card">Accordion Card</SelectItem>
              <SelectItem value="category-cards-image-dominant">Image Dominant Cards</SelectItem>
            </SelectContent>
          </Select>
          {/* Hidden input to ensure FormData captures the value if fallback is needed */}
          <input type="hidden" name="theme" value={currentTheme} />
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
        </div>

        {/* Social Media Group */}
        <div className="space-y-3 pt-2">
          <Label className="flex items-center gap-1">
            <LinkIcon className="h-4 w-4" /> Social & Web Links
          </Label>
          <div className="grid grid-cols-2 gap-2">
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
            {/* 🛑 ADDED: Custom Website Link */}
            <div className="relative">
              <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Official Website"
                className="pl-8"
                value={currentSocialMedia?.website ?? ""}
                onChange={(e) => onSocialMediaChange("website", e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Logo Upload */}
        <div className="space-y-2 pt-4">
          <Label htmlFor="logoUrl">Restaurant Logo</Label>
          {currentLogoUrl && (
            <div className="relative mb-2 h-20 w-20 overflow-hidden rounded-md border border-border">
              <Image
                width={80}
                height={80}
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
            className="ut-button:h-10 ut-button:w-32 ut-button:text-sm"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0 && res[0]) {
                onLogoUrlChange(res[0].url);
              }
            }}
            onUploadError={(error: Error) => console.error(`ERROR! ${error.message}`)}
          />
        </div>
      </div>

      {/* COLUMN 3: Delivery Apps & SEO */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        
        {/* Delivery Apps Group */}
        <div className="space-y-3 mb-6">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2 border-b pb-2">
             Delivery Platforms
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Yemeksepeti"
              value={currentDeliveryApps?.yemeksepeti ?? ""}
              onChange={(e) => onDeliveryAppsChange("yemeksepeti", e.target.value)}
            />
            <Input
              placeholder="Getir"
              value={currentDeliveryApps?.getir ?? ""}
              onChange={(e) => onDeliveryAppsChange("getir", e.target.value)}
            />
             <Input
              placeholder="Trendyol Yemek"
              value={currentDeliveryApps?.trendyolYemek ?? ""}
              onChange={(e) => onDeliveryAppsChange("trendyolYemek", e.target.value)}
            />
            <Input
              placeholder="UberEats"
              value={currentDeliveryApps?.uberEats ?? ""}
              onChange={(e) => onDeliveryAppsChange("uberEats", e.target.value)}
            />
          </div>
          {/* 🛑 ADDED: Generic Delivery Link */}
          <div className="pt-2">
             <Label className="text-xs text-muted-foreground mb-1 block">Other Delivery Provider</Label>
             <Input
                placeholder="https://..."
                value={currentDeliveryApps?.customLink ?? ""}
                onChange={(e) => onDeliveryAppsChange("customLink", e.target.value)}
              />
          </div>
        </div>

        {/* SEO Group */}
        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Search className="h-4 w-4" /> SEO Metadata
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
              rows={3}
              placeholder="Short description for search results..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}