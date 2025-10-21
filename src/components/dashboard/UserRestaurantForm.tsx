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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* LEFT COLUMN: Essential Details */}
      <div className="space-y-4">
        {/* 1. Name (Read-only for users, but editable in RestaurantDetailsForm) */}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData.name ?? ""}
            required
          />
          {formErrors.name && (
            <p className="text-sm text-red-500">{formErrors.name}</p>
          )}
        </div>

        {/* 2. Country */}
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={currentCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            required
          />
          {formErrors.country && (
            <p className="text-sm text-red-500">{formErrors.country}</p>
          )}
        </div>

        {/* 3. Currency */}
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

        {/* 4. Phone Number */}
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

        {/* 5. Address */}
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            defaultValue={initialData.address ?? ""}
          />
          {formErrors.address && (
            <p className="text-sm text-red-500">{formErrors.address}</p>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Description, Type of Establishment, Logo Upload */}
      <div className="space-y-4">
        {/* 6. Description */}
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

        {/* 7. Type of Establishment */}
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

        {/* 8. Logo Upload Section 🛑 RE-INTEGRATED */}
        <div className="space-y-2 pt-2">
          <Label htmlFor="logoUrl">Restaurant Logo</Label>
          {currentLogoUrl && (
            <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-md border">
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
            className="border-2 border-b-amber-500 bg-amber-400 text-violet-700"
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
          <input type="hidden" name="logoUrl" value={currentLogoUrl ?? ""} />
          {formErrors.logoUrl && (
            <p className="text-sm text-red-500">{formErrors.logoUrl}</p>
          )}
        </div>
      </div>
    </div>
  );
}
