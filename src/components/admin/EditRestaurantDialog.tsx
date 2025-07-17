"use client";

import Image from "next/image.js";
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

import { UploadButton } from "~/utils/uploadthing"; // Adjust path if different
import { UploadDropzone } from "~/utils/uploadthing"; // For the gallery, allows drag and drop
import { XCircle } from "lucide-react"; // For removing gallery images

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
  address: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => val === "on"),
  logoUrl: z.string().url().nullable().optional(), // Add this: expects URL or null
  galleryUrls: z
    .string()
    .optional()
    .transform((val) => {
      // Add this: parse JSON string
      if (!val) return null;
      try {
        const parsed: unknown = JSON.parse(val);
        return Array.isArray(parsed) &&
          parsed.every((item): item is string => typeof item === "string")
          ? parsed
          : null;
      } catch {
        return null;
      }
    })
    .nullable()
    .optional(),
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
  // Add state for the isActive switch
  const [isRestaurantActive, setIsRestaurantActive] = useState(
    restaurant.isActive ?? true,
  );

  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    restaurant.logoUrl ?? null,
  );
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    restaurant.galleryUrls ?? [],
  );
  console.log(
    "EditRestaurantDialog: Initial galleryPreviews state:",
    galleryPreviews,
  );

  const handleSubmit = async (formData: FormData) => {
    setFormErrors({});

    formData.set("isActive", isRestaurantActive ? "on" : "");
    formData.set("logoUrl", logoPreviewUrl ?? ""); // Add logo URL

    formData.set("galleryUrls", JSON.stringify(galleryPreviews));

    const values = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      country: formData.get("country") as string,
      foodType: formData.get("foodType") as string,
      address: formData.get("address") as string,
      isActive: formData.get("isActive") as string,
      logoUrl: formData.get("logoUrl") as string | null,
      galleryUrls: formData.get("galleryUrls") as string | null,
    };

    // Make sure your updateRestaurantSchema also accepts these new fields
    // (We will adjust this in the next section if not already done)
    const result = updateRestaurantSchema.safeParse(values);

    if (!result.success) {
      // ... existing error handling ...
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
        {" "}
        {/* Adjusted width for a wider, more square dialog */}
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
              />{" "}
              {/* Add defaultValue here too */}
              {formErrors.country && (
                <p className="text-sm text-red-500">{formErrors.country}</p>
              )}
              <Label>Food Type</Label>
              <Input
                name="foodType"
                defaultValue={restaurant.foodType ?? ""}
                required
              />{" "}
              {/* Add defaultValue here too */}
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
            </div>

            {/* Right Column: Upload Buttons */}
            <div className="space-y-6">
              {" "}
              {/* Use space-y to add vertical spacing between upload sections */}
              {/* Logo Upload Section */}
              <div>
                <Label htmlFor="logoUrl">Restaurant Logo</Label>
                {logoPreviewUrl && (
                  <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-md">
                    <Image
                      src={logoPreviewUrl}
                      alt="Logo Preview"
                      fill
                      className="object-cover"
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
                    alert(`ERROR! ${error.message}`);
                  }}
                />
                {formErrors.logoUrl && (
                  <p className="text-sm text-red-500">{formErrors.logoUrl}</p>
                )}
              </div>
              {/* Gallery Images Upload Section */}
              <div>
                <Label htmlFor="galleryUrls">Restaurant Gallery</Label>
                <div className="mb-2 grid grid-cols-3 gap-2">
                  {" "}
                  {/* Responsive grid for gallery previews */}
                  {galleryPreviews.map((url, index) => (
                    <div
                      key={index}
                      className="relative h-12 w-full overflow-hidden rounded-md"
                    >
                      <Image
                        src={url}
                        alt={`Gallery ${index}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() =>
                          setGalleryPreviews((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <UploadDropzone
                  endpoint="galleryUploader"
                  onClientUploadComplete={(res) => {
                    if (res) {
                      setGalleryPreviews((prev) => [
                        ...prev,
                        ...res.map((file) => file.url),
                      ]);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`ERROR! ${error.message}`);
                  }}
                />
                {formErrors.galleryUrls && (
                  <p className="text-sm text-red-500">
                    {formErrors.galleryUrls}
                  </p>
                )}
              </div>
            </div>
          </div>{" "}
          {/* End of Main two-column grid */}
          {/* General errors (span both columns if needed) */}
          {formErrors.general && (
            <p className="col-span-full mt-4 text-center text-sm text-red-500">
              {formErrors.general}
            </p>
          )}
          <DialogFooter className="col-span-full">
            {" "}
            {/* Footer spans full width */}
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
