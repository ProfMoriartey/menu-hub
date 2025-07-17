"use client";

import Image from "next/image";
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
import { Switch } from "~/components/ui/switch";
import { UploadButton } from "~/utils/uploadthing";

import { XCircle } from "lucide-react";

import type { Restaurant } from "~/types/restaurant"; // IMPORTANT: Ensure this path is correct
// IMPORTANT: Ensure this path is correct

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
  country: z.string().min(1, { message: "Country is required." }),
  foodType: z.string().min(1, { message: "Food type is required." }),
  address: z.string().nullable().optional(), // Ensure consistency with shared type
  isActive: z
    .string()
    .optional()
    .transform((val) => val === "on"),
  // NEW: Add isDisplayed to the schema
  isDisplayed: z
    .string()
    .optional()
    .transform((val) => val === "on"),
  logoUrl: z.string().url().nullable().optional(),
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
  const [isNewRestaurantActive, setIsNewRestaurantActive] = useState(true);
  // NEW: State for isDisplayed in the add form
  const [isNewRestaurantDisplayed, setIsNewRestaurantDisplayed] =
    useState(true);
  const [newRestaurantLogoUrl, setNewRestaurantLogoUrl] = useState<
    string | null
  >(null);

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

    formData.set("isActive", isNewRestaurantActive ? "on" : "");
    // NEW: Set isDisplayed in formData
    formData.set("isDisplayed", isNewRestaurantDisplayed ? "on" : "");
    formData.set("logoUrl", newRestaurantLogoUrl ?? "");

    const values = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      country: formData.get("country") as string | null,
      foodType: formData.get("foodType") as string | null,
      address: formData.get("address") as string | null,
      isActive: formData.get("isActive") as string,
      // NEW: Get isDisplayed from formData
      isDisplayed: formData.get("isDisplayed") as string | null,
      logoUrl: formData.get("logoUrl") as string | null,
    };

    const result = createRestaurantSchema.safeParse(values);

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
      await addRestaurantAction(formData);
      setIsAddDialogOpen(false);
      addFormRef.current?.reset();
      setFormErrors({});
      setIsNewRestaurantActive(true);
      // NEW: Reset isDisplayed state for next add
      setIsNewRestaurantDisplayed(true);
      setNewRestaurantLogoUrl(null);
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  {/* NEW: isDisplayed Switch */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDisplayed"
                      name="isDisplayed"
                      checked={isNewRestaurantDisplayed}
                      onCheckedChange={setIsNewRestaurantDisplayed}
                    />
                    <Label htmlFor="isDisplayed">Display on Public Site</Label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="newLogoUrl">Restaurant Logo</Label>
                    {newRestaurantLogoUrl && (
                      <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-md">
                        <Image
                          src={newRestaurantLogoUrl}
                          alt="Logo Preview"
                          className="h-full w-full object-cover"
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
                      }}
                    />
                    {formErrors.logoUrl && (
                      <p className="text-sm text-red-500">
                        {formErrors.logoUrl}
                      </p>
                    )}
                  </div>
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
                    {restaurant.logoUrl && (
                      <div className="mb-2 h-24 w-24 overflow-hidden rounded-md">
                        <Image
                          src={restaurant.logoUrl}
                          alt={`${restaurant.name} Logo`}
                          className="h-full w-full object-cover"
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
