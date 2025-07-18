// src/components/admin/MenuItemsTable.tsx
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
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
import { EditMenuItemDialog } from "~/components/admin/EditMenuItemDialog";
import { deleteMenuItem, updateMenuItem } from "~/app/actions/menu-item";

// Import InferSelectModel and menuItems from your schema
import type { InferSelectModel } from "drizzle-orm";
import { menuItems } from "~/server/db/schema";

// Define MenuItemType directly from your Drizzle schema
type MenuItemType = InferSelectModel<typeof menuItems>;

interface MenuItemsTableProps {
  menuItems: MenuItemType[];
  restaurantId: string;
  categoryId: string;
}

export function MenuItemsTable({
  menuItems,
  restaurantId,
  categoryId,
}: MenuItemsTableProps) {
  const fallbackImageUrl = `https://placehold.co/64x64/E0E0E0/333333?text=No+Img`;

  if (menuItems.length === 0) {
    return (
      <p className="text-gray-500">
        No menu items added yet for this category. Use the form above to add
        one!
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Dietary</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Image
                  src={item.imageUrl ?? fallbackImageUrl}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="rounded-md object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>${item.price}</TableCell>
              <TableCell>
                {item.dietaryLabels && item.dietaryLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {item.dietaryLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800"
                      >
                        {label.charAt(0).toUpperCase() +
                          label.slice(1).replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">None</span>
                )}
              </TableCell>
              <TableCell className="flex items-center justify-end space-x-2 text-right">
                <EditMenuItemDialog
                  menuItem={item} // 'item' now has the full MenuItemType
                  updateMenuItemAction={updateMenuItem}
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
                        <strong> {item.name} </strong> menu item from your
                        database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <form
                          action={async () => {
                            await deleteMenuItem(
                              item.id,
                              restaurantId,
                              categoryId,
                            );
                          }}
                        >
                          <Button variant="destructive" type="submit">
                            Delete
                          </Button>
                        </form>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
