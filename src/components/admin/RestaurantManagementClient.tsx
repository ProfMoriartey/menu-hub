// src/components/admin/RestaurantManagementClient.tsx
"use client";

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
import { Switch } from "../ui/switch";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address?: string;
  country?: string;
  foodType?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

interface RestaurantManagementClientProps {
  initialRestaurants: Restaurant[];
  addRestaurantAction: (formData: FormData) => Promise<void>;
  deleteRestaurantAction: (restaurantId: string) => Promise<void>;
  updateRestaurantAction: (formData: FormData) => Promise<void>;
}

const createRestaurantSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  country: z.string().min(1),
  foodType: z.string().min(1),
  address: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => val === "on"),
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
  const [isNewRestaurantActive, setIsNewRestaurantActive] = useState(true); // New state for add form

  const addFormRef = useRef<HTMLFormElement>(null);
  const filteredRestaurants = initialRestaurants.filter((restaurant) => {
    const term = searchTerm.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(term) ||
      restaurant.slug.toLowerCase().includes(term) ||
      restaurant.country?.toLowerCase().includes(term) ||
      restaurant.foodType?.toLowerCase().includes(term) ||
      restaurant.address?.toLowerCase().includes(term)
    );
  });

  const handleAddSubmit = async (formData: FormData) => {
    setFormErrors({});

    // Manually append isActive to formData for the add action
    formData.set("isActive", isNewRestaurantActive ? "on" : ""); // Ensure 'on' or empty string is sent

    const values = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      country: formData.get("country") as string,
      foodType: formData.get("foodType") as string,
      address: formData.get("address") as string,
      isActive: formData.get("isActive") as string,
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Restaurant</DialogTitle>
              <DialogDescription>
                Fill out the details below to create a new restaurant.
              </DialogDescription>
            </DialogHeader>
            <form
              ref={addFormRef}
              action={handleAddSubmit}
              className="space-y-4"
            >
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
                  <p className="text-sm text-red-500">{formErrors.country}</p>
                )}
              </div>
              <div>
                <Label htmlFor="foodType">Type of Food</Label>
                <Input id="foodType" name="foodType" required />
                {formErrors.foodType && (
                  <p className="text-sm text-red-500">{formErrors.foodType}</p>
                )}
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  name="isActive" // Important for FormData
                  checked={isNewRestaurantActive} // Controlled state
                  onCheckedChange={setIsNewRestaurantActive} // Update state
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              {formErrors.general && (
                <p className="text-center text-sm text-red-500">
                  {formErrors.general}
                </p>
              )}
              <DialogFooter>
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
