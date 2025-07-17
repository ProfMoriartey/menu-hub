"use client";
import Image from "next/image.js";
import { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useFormStatus } from "react-dom";
import { z } from "zod";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { EditRestaurantDialog } from "~/components/admin/EditRestaurantDialog";
import { Switch } from "~/components/ui/switch"; // Ensure Switch is imported
import { UploadButton, UploadDropzone } from "~/utils/uploadthing"; // Ensure UploadButton is imported
import { XCircle } from "lucide-react"; // Ensure XCircle is imported

import type { Restaurant } from "~/types/restaurant";

interface RestaurantManagementClientProps {
  initialRestaurants: Restaurant[];
  addRestaurantAction: (formData: FormData) => Promise<void>;
  deleteRestaurantAction: (restaurantId: string) => Promise<void>;
  updateRestaurantAction: (formData: FormData) => Promise<void>;
}

const createRestaurantSchema = z.object({
  name: z.string().min(1, { message: "Restaurant name is required." }),
  slug: z
    .string()
    .min(1, { message: "Restaurant slug is required." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must be lowercase, alphanumeric, and can contain hyphens.",
    }),
  country: z.string().min(1, { message: "Country is required." }), // Added message
  foodType: z.string().min(1, { message: "Food type is required." }), // Added message
  address: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => val === "on"),
  logoUrl: z.string().url().nullable().optional(), // Added for add form schema
  galleryUrls: z
    .string()
    .optional()
    .transform((val) => {
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
      {pending ? "Adding..." : "Add Restaurant"}
    </Button>
  );
}

export function RestaurantManagementClient({
  initialRestaurants,
  addRestaurantAction,
  deleteRestaurantAction,
  updateRestaurantAction,
}: RestaurantManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isNewRestaurantActive, setIsNewRestaurantActive] = useState(true); // State for add form's isActive
  const [newRestaurantLogoUrl, setNewRestaurantLogoUrl] = useState<
    string | null
  >(null); // State for add form's logo
  const [newRestaurantGalleryUrls, setNewRestaurantGalleryUrls] = useState<
    string[]
  >([]); // State for add form's gallery

  const addFormRef = useRef<HTMLFormElement>(null);

  const filteredRestaurants = initialRestaurants.filter((restaurant) => {
    const term = searchTerm.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(term) ||
      restaurant.slug.toLowerCase().includes(term) ||
      (restaurant.country?.toLowerCase().includes(term) ?? false) ||
      (restaurant.foodType?.toLowerCase().includes(term) ?? false) ||
      (restaurant.address?.toLowerCase().includes(term) ?? false)
    );
  });

  const handleAddSubmit = async (formData: FormData) => {
    setFormErrors({});

    // Manually append isActive, logoUrl, and galleryUrls to formData for the add action
    formData.set("isActive", isNewRestaurantActive ? "on" : "");
    formData.set("logoUrl", newRestaurantLogoUrl ?? "");
    formData.set("galleryUrls", JSON.stringify(newRestaurantGalleryUrls));

    const values = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      country: formData.get("country") as string,
      foodType: formData.get("foodType") as string,
      address: formData.get("address") as string,
      isActive: formData.get("isActive") as string,
      logoUrl: formData.get("logoUrl") as string | null,
      galleryUrls: formData.get("galleryUrls") as string | null,
    };

    const result = createRestaurantSchema.safeParse(values);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key =
          Array.isArray(err.path) && typeof err.path[0] === "string"
            ? err.path[0]
            : "general";
        errors[key] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    try {
      await addRestaurantAction(formData);
      setIsAddDialogOpen(false);
      addFormRef.current?.reset();
      setFormErrors({});
      setIsNewRestaurantActive(true); // Reset switch state for next add
      setNewRestaurantLogoUrl(null); // Reset logo URL for next add
      setNewRestaurantGalleryUrls([]); // Reset gallery URLs for next add
    } catch (error) {
      setFormErrors({
        general: error instanceof Error ? error.message : "Add failed.",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <Input
          type="text"
          placeholder="Search by name, slug, country, type, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow md:w-2/3"
        />
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-1/3">Add New Restaurant</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl lg:max-w-3xl">
            {" "}
            {/* Adjusted width for add dialog too */}
            <DialogHeader>
              <DialogTitle>Add New Restaurant</DialogTitle>
              <DialogDescription>
                Fill out the details below to create a new restaurant.
              </DialogDescription>
            </DialogHeader>
            <form
              ref={addFormRef}
              action={handleAddSubmit}
              className="grid gap-4 py-4"
            >
              {/* Two-column layout for add form */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left Column: Input Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required />
                    {formErrors.name && (
                      <p className="text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" required />
                    {formErrors.slug && (
                      <p className="text-sm text-red-500">{formErrors.slug}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" required />
                    {formErrors.country && (
                      <p className="text-sm text-red-500">
                        {formErrors.country}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="foodType">Type of Food</Label>
                    <Input id="foodType" name="foodType" required />
                    {formErrors.foodType && (
                      <p className="text-sm text-red-500">
                        {formErrors.foodType}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      name="isActive"
                      checked={isNewRestaurantActive}
                      onCheckedChange={setIsNewRestaurantActive}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>

                {/* Right Column: Upload Buttons for Add Form */}
                <div className="space-y-6">
                  {/* Logo Upload Section for Add Form */}
                  <div>
                    <Label htmlFor="newLogoUrl">Restaurant Logo</Label>
                    {newRestaurantLogoUrl && (
                      <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-md">
                        <Image
                          src={newRestaurantLogoUrl}
                          alt="Logo Preview"
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => setNewRestaurantLogoUrl(null)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <UploadButton
                      endpoint="logoUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res.length > 0 && res[0]) {
                          setNewRestaurantLogoUrl(res[0].url);
                        }
                      }}
                      onUploadError={(error: Error) => {
                        console.error(`ERROR! ${error.message}`);
                        alert(`ERROR! ${error.message}`);
                      }}
                    />
                    {formErrors.logoUrl && (
                      <p className="text-sm text-red-500">
                        {formErrors.logoUrl}
                      </p>
                    )}
                  </div>

                  {/* Gallery Images Upload Section for Add Form */}
                  <div>
                    <Label htmlFor="newGalleryUrls">Restaurant Gallery</Label>
                    <div className="mb-2 grid grid-cols-3 gap-2">
                      {newRestaurantGalleryUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative h-24 w-full overflow-hidden rounded-md"
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
                              setNewRestaurantGalleryUrls((prev) =>
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
                          setNewRestaurantGalleryUrls((prev) => [
                            ...prev,
                            ...res.map((file) => file.url),
                          ]);
                        }
                      }}
                      onUploadError={(error: Error) => {
                        console.error(`ERROR! ${error.message}`);
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
              {/* End of two-column grid for add form */}
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Restaurants</CardTitle>
          <CardDescription>
            A list of all restaurants currently in your database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRestaurants.length === 0 ? (
            <p className="text-center text-gray-500">No results found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className="flex h-full flex-col">
                  <CardHeader className="flex-grow">
                    {/* Display Logo here */}
                    {restaurant.logoUrl && (
                      <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-md">
                        <Image
                          src={restaurant.logoUrl}
                          alt={`${restaurant.name} Logo`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardTitle>{restaurant.name}</CardTitle>
                    <CardDescription>Slug: {restaurant.slug}</CardDescription>
                    <p className="text-xs text-gray-500">
                      Created:{" "}
                      {new Date(restaurant.createdAt).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent className="mt-auto flex justify-end space-x-2 p-4 pt-0">
                    <Link
                      href={`/admin/restaurants/${restaurant.id}/categories`}
                    >
                      <Button variant="secondary" size="sm">
                        Categories
                      </Button>
                    </Link>
                    <EditRestaurantDialog
                      restaurant={restaurant}
                      updateRestaurantAction={updateRestaurantAction}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete{" "}
                            <strong>{restaurant.name}</strong> and all its data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <form
                              action={async () =>
                                await deleteRestaurantAction(restaurant.id)
                              }
                            >
                              <Button variant="destructive" type="submit">
                                Delete
                              </Button>
                            </form>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
