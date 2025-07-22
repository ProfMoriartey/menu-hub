// src/components/admin/RestaurantForm.tsx
"use client";

import Image from "next/image";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { UploadButton } from "~/utils/uploadthing";
import { XCircle } from "lucide-react";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

// Import types for restaurant data and form errors
import type { Restaurant } from "~/types/restaurant";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator"; // Potentially useful for spacing, if you have it

interface RestaurantFormProps {
  initialData?: Restaurant;
  formErrors: Record<string, string>;
  onLogoUrlChange: (url: string | null) => void;
  onIsActiveChange: (checked: boolean) => void;
  onIsDisplayedChange: (checked: boolean) => void;
  onCurrencyChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onTypeOfEstablishmentChange: (value: string) => void;

  currentIsActive: boolean;
  currentIsDisplayed: boolean;
  currentLogoUrl: string | null;
  currentCurrency: string;
  currentPhoneNumber: string;
  currentDescription: string;
  currentTheme: string;
  currentTypeOfEstablishment: string;
}

export function RestaurantForm({
  initialData,
  formErrors,
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
}: RestaurantFormProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* LEFT COLUMN: Name, Slug, Country, Food Type, Address, Currency, Phone Number */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData?.name ?? ""}
            required
          />
          {formErrors.name && (
            <p className="text-sm text-red-500">{formErrors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={initialData?.slug ?? ""}
            required
          />
          {formErrors.slug && (
            <p className="text-sm text-red-500">{formErrors.slug}</p>
          )}
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            defaultValue={initialData?.country ?? ""}
            required
          />
          {formErrors.country && (
            <p className="text-sm text-red-500">{formErrors.country}</p>
          )}
        </div>

        <div>
          <Label htmlFor="foodType">Type of Food</Label>
          <Input
            id="foodType"
            name="foodType"
            defaultValue={initialData?.foodType ?? ""}
            required
          />
          {formErrors.foodType && (
            <p className="text-sm text-red-500">{formErrors.foodType}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            defaultValue={initialData?.address ?? ""}
          />
          {formErrors.address && (
            <p className="text-sm text-red-500">{formErrors.address}</p>
          )}
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
          {formErrors.currency && (
            <p className="text-sm text-red-500">{formErrors.currency}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={currentPhoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
          />
          {formErrors.phoneNumber && (
            <p className="text-sm text-red-500">{formErrors.phoneNumber}</p>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Description, Theme, Type of Establishment, Switches, Logo Upload */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={currentDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={5}
          />
          {formErrors.description && (
            <p className="text-sm text-red-500">{formErrors.description}</p>
          )}
        </div>
        {/* START OF THEME INPUT CHANGES */}
        <div>
          <Label htmlFor="theme">Theme</Label>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
            <Input
              id="theme"
              name="theme"
              value={currentTheme}
              onChange={(e) => onThemeChange(e.target.value)}
              className="flex-grow" // Allows input to take available space
            />
            {/* Theme Suggestions */}
            <p className="text-muted-foreground mt-1 text-sm sm:mt-0">
              **Suggestions:** classic, sidebar-list, accordion-card,
              category-cards-image-dominant
            </p>
          </div>
          {formErrors.theme && (
            <p className="text-sm text-red-500">{formErrors.theme}</p>
          )}
        </div>
        {/* END OF THEME INPUT CHANGES */}
        <div>
          <Label htmlFor="typeOfEstablishment">Type of Establishment</Label>
          <Input
            id="typeOfEstablishment"
            name="typeOfEstablishment"
            value={currentTypeOfEstablishment}
            onChange={(e) => onTypeOfEstablishmentChange(e.target.value)}
          />
          {formErrors.typeOfEstablishment && (
            <p className="text-sm text-red-500">
              {formErrors.typeOfEstablishment}
            </p>
          )}
        </div>
        {/* Switches */}
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
          <Label htmlFor="isDisplayed">Display on Public Site</Label>
        </div>
        {/* Logo Upload Section */}
        <div className="space-y-2 pt-2">
          <Label htmlFor="logoUrl">Restaurant Logo</Label>
          {currentLogoUrl && (
            <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-md">
              <Image
                width={250}
                height={250}
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
          {formErrors.logoUrl && (
            <p className="text-sm text-red-500">{formErrors.logoUrl}</p>
          )}
        </div>
      </div>
    </div>
  );
}
