"use client";

import React from "react";
// Local component to replace next/image
const CustomImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => (
  <img
    src={src}
    alt={alt}
    className={className}
    style={{ width: "100%", height: "100%" }}
  />
);
import { useTranslations } from "next-intl"; // Import next-intl hook
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { UploadButton } from "~/utils/uploadthing";
import { XCircle } from "lucide-react";
import type { Restaurant } from "~/types/restaurant";
import { cn } from "~/lib/utils";

interface UserRestaurantFormProps {
  initialData: Restaurant;
  formErrors: Record<string, string>;

  // Handlers for state changes
  onLogoUrlChange: (url: string | null) => void;
  onCurrencyChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTypeOfEstablishmentChange: (value: string) => void;
  onCountryChange: (value: string) => void;

  // Current state values
  currentLogoUrl: string | null;
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
  const t = useTranslations("RestaurantForm"); // Base namespace for this form

  return (
    <div className="bg-card grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* LEFT COLUMN: Essential Details */}
      <div className="space-y-6">
        {/* 1. Name (Read-only for users) */}
        <div>
          <Label className="mb-2" htmlFor="name">
            {t("labelName")}
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData.name ?? ""}
            readOnly
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
            {t("labelCountry")}
          </Label>
          <Input
            id="country"
            name="country"
            value={currentCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            placeholder={t("placeholderCountry")}
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
            {t("labelCurrency")}
          </Label>
          <Input
            id="currency"
            name="currency"
            value={currentCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            placeholder={t("placeholderCurrency")}
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
            {t("labelPhoneNumber")}
          </Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={currentPhoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            type="tel"
            placeholder={t("placeholderPhoneNumber")}
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
            {t("labelAddress")}
          </Label>
          <Input
            id="address"
            name="address"
            defaultValue={initialData.address ?? ""}
            placeholder={t("placeholderAddress")}
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
            {t("labelShortDescription")}
          </Label>
          <Textarea
            id="description"
            name="description"
            value={currentDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={t("placeholderDescription")}
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
            {t("labelTypeOfEstablishment")}
          </Label>
          <Input
            id="typeOfEstablishment"
            name="typeOfEstablishment"
            value={currentTypeOfEstablishment}
            onChange={(e) => onTypeOfEstablishmentChange(e.target.value)}
            placeholder={t("placeholderTypeOfEstablishment")}
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
            {t("labelRestaurantLogo")}
          </Label>
          {currentLogoUrl && (
            <div className="border-border relative mb-2 h-24 w-24 overflow-hidden rounded-md border">
              <CustomImage
                src={currentLogoUrl}
                // Translated alt text
                alt={t("logoPreviewAlt")}
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
          {!currentLogoUrl && (
            // Translated No Image fallback
            <div className="border-border bg-muted text-muted-foreground flex h-24 w-24 items-center justify-center rounded-md border text-sm">
              {t("noLogo")}
            </div>
          )}
          <UploadButton
            endpoint="logoUploader"
            // Apply theme overrides
            className={cn(
              "ut-button:bg-primary ut-button:hover:bg-primary/90 ut-button:text-primary-foreground",
              "ut-allowed-content:text-muted-foreground",
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
