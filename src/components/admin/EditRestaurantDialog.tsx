"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Pencil } from "lucide-react";
import { z } from "zod";
import { useFormStatus } from "react-dom";

import { UploadButton } from "~/utils/uploadthing";
// REMOVED: import { UploadDropzone } from "~/utils/uploadthing";
import { XCircle } from "lucide-react";

import type { Restaurant } from "~/types/restaurant";

const updateRestaurantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must be lowercase, alphanumeric, and can contain hyphens.",
    }),
  country: z.string().min(1),
  foodType: z.string().min(1),
  address: z.string().nullable().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => val === "on"),
  isDisplayed: z
    .string()
    .optional()
    .transform((val) => val === "on"),
  logoUrl: z.string().url().nullable().optional(),
  // REMOVED: galleryUrls from schema
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

interface EditRestaurantDialogProps {
  restaurant: Restaurant;
  updateRestaurantAction: (formData: FormData) => Promise<void>;
}

export function EditRestaurantDialog({
  restaurant,
  updateRestaurantAction,
}: EditRestaurantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isRestaurantActive, setIsRestaurantActive] = useState(
    restaurant.isActive ?? true,
  );
  const [isRestaurantDisplayed, setIsRestaurantDisplayed] = useState(
    restaurant.isDisplayed ?? true,
  );

  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    restaurant.logoUrl ?? null,
  );
  // REMOVED: const [galleryPreviews, setGalleryPreviews] = useState<string[]>(...);

  const handleSubmit = async (formData: FormData) => {
    setFormErrors({});

    formData.set("isActive", isRestaurantActive ? "on" : "");
    formData.set("isDisplayed", isRestaurantDisplayed ? "on" : "");
    formData.set("logoUrl", logoPreviewUrl ?? "");
    // REMOVED: formData.set("galleryUrls", JSON.stringify(galleryPreviews));

    const values = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      country: formData.get("country") as string | null,
      foodType: formData.get("foodType") as string | null,
      address: formData.get("address") as string | null,
      isActive: formData.get("isActive") as string,
      isDisplayed: formData.get("isDisplayed") as string | null,
      logoUrl: formData.get("logoUrl") as string | null,
      // REMOVED: galleryUrls from values
    };

    const result = updateRestaurantSchema.safeParse(values);

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.errors.forEach((_e) => {
        const key =
          Array.isArray(_e.path) && typeof _e.path[0] === "string"
            ? _e.path[0]
            : "general";
        errors[key] = _e.message;
      });

      setFormErrors(errors);
      return;
    }

    try {
      await updateRestaurantAction(formData);
      setIsOpen(false);
    } catch (error) {
      setFormErrors({
        general: error instanceof Error ? error.message : "Update failed.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mr-2">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Restaurant</DialogTitle>
          <DialogDescription>
            Update info for &quot;{restaurant.name}&quot;.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={restaurant.id} />

          {/* Main two-column grid layout for inputs and uploads */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Column: Input Fields */}
            <div className="space-y-4">
              <Label>Name</Label>
              <Input name="name" defaultValue={restaurant.name} required />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}

              <Label>Slug</Label>
              <Input name="slug" defaultValue={restaurant.slug} required />
              {formErrors.slug && (
                <p className="text-sm text-red-500">{formErrors.slug}</p>
              )}

              <Label>Country</Label>
              <Input
                name="country"
                defaultValue={restaurant.country ?? ""}
                required
              />
              {formErrors.country && (
                <p className="text-sm text-red-500">{formErrors.country}</p>
              )}

              <Label>Food Type</Label>
              <Input
                name="foodType"
                defaultValue={restaurant.foodType ?? ""}
                required
              />
              {formErrors.foodType && (
                <p className="text-sm text-red-500">{formErrors.foodType}</p>
              )}

              <Label>Address</Label>
              <Input name="address" defaultValue={restaurant.address ?? ""} />
              {formErrors.address && (
                <p className="text-sm text-red-500">{formErrors.address}</p>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  name="isActive"
                  checked={isRestaurantActive}
                  onCheckedChange={setIsRestaurantActive}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDisplayed"
                  name="isDisplayed"
                  checked={isRestaurantDisplayed}
                  onCheckedChange={setIsRestaurantDisplayed}
                />
                <Label htmlFor="isDisplayed">Display on Public Site</Label>
              </div>
            </div>

            {/* Right Column: Upload Buttons */}
            <div className="space-y-6">
              {/* Logo Upload Section */}
              <div>
                <Label htmlFor="logoUrl">Restaurant Logo</Label>
                {logoPreviewUrl && (
                  <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-md">
                    <Image
                      width={250}
                      height={250}
                      src={logoPreviewUrl}
                      alt="Logo Preview"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => setLogoPreviewUrl(null)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <UploadButton
                  endpoint="logoUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0 && res[0]) {
                      setLogoPreviewUrl(res[0].url);
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

              {/* REMOVED: Gallery Images Upload Section */}
            </div>
          </div>

          {formErrors.general && (
            <p className="col-span-full mt-4 text-center text-sm text-red-500">
              {formErrors.general}
            </p>
          )}

          <DialogFooter className="col-span-full">
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
