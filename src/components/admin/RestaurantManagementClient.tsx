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
import { cn } from "~/lib/utils";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
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
  name: z.string().min(1, { message: "Restaurant name is required." }),
  slug: z
    .string()
    .min(1, { message: "Restaurant slug is required." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must be lowercase, alphanumeric, and can contain hyphens.",
    }),
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
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    slug?: string;
    general?: string;
  }>({});

  const addFormRef = useRef<HTMLFormElement>(null);

  const filteredRestaurants = initialRestaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddSubmit = async (formData: FormData) => {
    setFormErrors({});

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;

    const validationResult = createRestaurantSchema.safeParse({ name, slug });

    if (!validationResult.success) {
      const errors: { name?: string; slug?: string } = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0] === "name") errors.name = err.message;
        if (err.path[0] === "slug") errors.slug = err.message;
      });
      setFormErrors(errors);
      return;
    }

    try {
      await addRestaurantAction(formData);
      setIsAddDialogOpen(false);
      addFormRef.current?.reset();
      setFormErrors({});
    } catch (error) {
      console.error("Error adding restaurant:", error);
      setFormErrors({
        general:
          error instanceof Error ? error.message : "Failed to add restaurant.",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <Input
          type="text"
          placeholder="Search restaurants by name or slug..."
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
                Create a new restaurant entry in your system.
              </DialogDescription>
            </DialogHeader>
            <form
              ref={addFormRef}
              action={handleAddSubmit}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Restaurant Name</Label>
                <Input id="name" name="name" type="text" required />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input id="slug" name="slug" type="text" required />
                <p className="mt-1 text-sm text-gray-500">
                  This will be used in the URL: `/yourdomain.com/pizza-palace`
                </p>
                {formErrors.slug && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.slug}</p>
                )}
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
            <p className="text-center text-gray-500">
              No restaurants found matching your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className="flex h-full flex-col">
                  <CardHeader className="flex-grow">
                    <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Slug: {restaurant.slug}
                    </CardDescription>
                    <p className="mt-1 text-xs text-gray-500">
                      Created:{" "}
                      {new Date(restaurant.createdAt).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent className="mt-auto flex justify-end space-x-2 p-4 pt-0">
                    <Link
                      href={`/admin/restaurants/${restaurant.id}/categories`}
                      passHref
                      legacyBehavior
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
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the
                            <strong> {restaurant.name} </strong> restaurant and
                            all its associated categories and menu items from
                            your database.
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
