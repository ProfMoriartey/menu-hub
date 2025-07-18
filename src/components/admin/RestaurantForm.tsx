// src/components/admin/RestaurantForm.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { UploadButton } from "~/utils/uploadthing";
import { XCircle } from "lucide-react";

// Import types for restaurant data and form errors
import type { Restaurant } from "~/types/restaurant";
import { Button } from "../ui/button";

interface RestaurantFormProps {
  initialData?: Restaurant; // Optional, for editing existing restaurants
  formErrors: Record<string, string>;
  isLogoRequired?: boolean; // If logo is required for new but optional for edit
  onLogoUrlChange: (url: string | null) => void;
  onIsActiveChange: (checked: boolean) => void;
  onIsDisplayedChange: (checked: boolean) => void;
  currentIsActive: boolean;
  currentIsDisplayed: boolean;
  currentLogoUrl: string | null;
}

export function RestaurantForm({
  initialData,
  formErrors,
  onLogoUrlChange,
  onIsActiveChange,
  onIsDisplayedChange,
  currentIsActive,
  currentIsDisplayed,
  currentLogoUrl,
}: RestaurantFormProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Left Column: Input Fields */}
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
      </div>

      {/* Right Column: Upload Buttons */}
      <div className="space-y-6">
        <div>
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
        {/* Gallery Images Upload Section can be added here if needed */}
      </div>
    </div>
  );
}
