// src/components/dashboard/UserRestaurantForm.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { UploadButton } from "~/utils/uploadthing"; // Assuming this utility is correctly configured
import { XCircle } from "lucide-react";
import type { Restaurant } from "~/types/restaurant";
import { cn } from "~/lib/utils";

interface UserRestaurantFormProps {
  initialData: Restaurant;
  formErrors: Record<string, string>;

  // Handlers for state changes
  onLogoUrlChange: (url: string | null) => void; // 🛑 Re-integrated
  onCurrencyChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTypeOfEstablishmentChange: (value: string) => void;
  onCountryChange: (value: string) => void;

  // Current state values
  currentLogoUrl: string | null; // 🛑 Re-integrated
  currentCurrency: string;
  currentPhoneNumber: string;
  currentDescription: string;
  currentTypeOfEstablishment: string;
  currentCountry: string;
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
  currentLogoUrl,
  currentCurrency,
  currentPhoneNumber,
  currentDescription,
  currentTypeOfEstablishment,
  currentCountry,
}: UserRestaurantFormProps) {
  // NOTE: Slug, isActive, isDisplayed, and Theme inputs are intentionally excluded.
  return (
    <div className="bg-background grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* LEFT COLUMN: Essential Details */}
      <div className="space-y-6">
        {/* 1. Name (Read-only for users) */}
        <div>
          <Label className="mb-2" htmlFor="name">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData.name ?? ""}
            readOnly
            // Ensure read-only field uses muted background
            className="bg-muted/50 text-muted-foreground cursor-not-allowed"
            required
          />
          {formErrors.name && (
            <p className="text-destructive mt-1 text-sm">{formErrors.name}</p>
          )}
        </div>

        {/* 2. Country */}
        <div>
          <Label className="mb-2" htmlFor="country">
            Country
          </Label>
          <Input
            id="country"
            name="country"
            value={currentCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            placeholder="e.g., United States"
            required
          />
          {formErrors.country && (
            <p className="text-destructive mt-1 text-sm">
              {formErrors.country}
            </p>
          )}
        </div>

        {/* 3. Currency */}
        <div>
          <Label className="mb-2" htmlFor="currency">
            Currency Code
          </Label>
          <Input
            id="currency"
            name="currency"
            value={currentCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            placeholder="e.g., USD, EUR"
            required
          />
          {formErrors.currency && (
            <p className="text-destructive mt-1 text-sm">
              {formErrors.currency}
            </p>
          )}
        </div>

        {/* 4. Phone Number */}
        <div>
          <Label className="mb-2" htmlFor="phoneNumber">
            Phone Number
          </Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={currentPhoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            type="tel"
            placeholder="+1 555-123-4567"
          />
          {formErrors.phoneNumber && (
            <p className="text-destructive mt-1 text-sm">
              {formErrors.phoneNumber}
            </p>
          )}
        </div>

        {/* 5. Address */}
        <div>
          <Label className="mb-2" htmlFor="address">
            Address
          </Label>
          <Input
            id="address"
            name="address"
            defaultValue={initialData.address ?? ""}
            placeholder="Street, City, Postal Code"
          />
          {formErrors.address && (
            <p className="text-destructive mt-1 text-sm">
              {formErrors.address}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Description, Type of Establishment, Logo Upload */}
      <div className="space-y-6">
        {/* 6. Description */}
        <div>
          <Label className="mb-2" htmlFor="description">
            Short Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={currentDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="A brief, engaging summary of your restaurant."
            rows={5}
          />
          {formErrors.description && (
            <p className="text-destructive mt-1 text-sm">
              {formErrors.description}
            </p>
          )}
        </div>

        {/* 7. Type of Establishment */}
        <div>
          <Label className="mb-2" htmlFor="typeOfEstablishment">
            Type of Establishment
          </Label>
          <Input
            id="typeOfEstablishment"
            name="typeOfEstablishment"
            value={currentTypeOfEstablishment}
            onChange={(e) => onTypeOfEstablishmentChange(e.target.value)}
            placeholder="e.g., Casual Dining, Cafe, Fine Dining"
          />
          {formErrors.typeOfEstablishment && (
            <p className="text-destructive mt-1 text-sm">
              {formErrors.typeOfEstablishment}
            </p>
          )}
        </div>

        {/* 8. Logo Upload Section */}
        <div className="space-y-2 pt-2">
          <Label className="mb-2" htmlFor="logoUrl">
            Restaurant Logo
          </Label>
          {currentLogoUrl && (
            <div className="border-border relative mb-2 h-24 w-24 overflow-hidden rounded-md border">
              <Image
                src={currentLogoUrl}
                alt="Logo Preview"
                width={100}
                height={100}
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
            // Ensure all colors use theme tokens to respect dark mode
            className={cn(
              "ut-button:bg-primary ut-button:hover:bg-primary/90 ut-button:text-primary-foreground",
              "ut-allowed-content:text-muted-foreground",
              // Use card background for the container, border-border for the outline
              "ut-container:bg-card ut-container:border-border ut-container:hover:bg-accent/10 ut-container:transition-colors",
              "ut-readying:bg-muted ut-readying:text-muted-foreground",
              "ut-label:text-foreground",
            )}
            onClientUploadComplete={(res) => {
              if (res && res.length > 0 && res[0]) {
                onLogoUrlChange(res[0].url);
              }
            }}
            onUploadError={(error: Error) => {
              console.error(`ERROR! ${error.message}`);
            }}
          />
          <input type="hidden" name="logoUrl" value={currentLogoUrl ?? ""} />
          {formErrors.logoUrl && (
            <p className="text-destructive mt-1 text-sm">
              {formErrors.logoUrl}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
