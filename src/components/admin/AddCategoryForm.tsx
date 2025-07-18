// src/components/admin/AddCategoryForm.tsx
"use client";

import { useState } from "react";
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

// Import the addCategory action
import { addCategory } from "~/app/actions/category";

interface AddCategoryFormProps {
  restaurantId: string;
  restaurantName: string;
}

export function AddCategoryForm({
  restaurantId,
  restaurantName,
}: AddCategoryFormProps) {
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = async (formData: FormData) => {
    // You can add client-side validation here if needed before calling the server action
    // For now, relying on server-side Zod validation from the action
    try {
      await addCategory(formData);
      setCategoryName(""); // Clear the input field on success
    } catch (error) {
      // Handle errors, e.g., display a toast notification
      console.error("Failed to add category:", error);
      alert((error as Error).message); // Simple alert for demonstration
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Category</CardTitle>
        <CardDescription>
          Create a new menu category for {restaurantName}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="restaurantId" value={restaurantId} />
          <div>
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              name="name"
              type="text"
              placeholder="e.g., Appetizers"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
          <Button type="submit">Add Category</Button>
        </form>
      </CardContent>
    </Card>
  );
}
