// app/admin/restaurants/new/page.tsx
import { ChevronLeft } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { addRestaurant } from "~/app/actions/restaurant";
import { AdminRestaurantForm } from "~/components/admin/restaurant-form/AdminRestaurantForm";

export default function NewRestaurantPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/admin/restaurants"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Restaurants
        </Link>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">New restaurant</h1>
        <p className="text-muted-foreground">
          Only the name and menu address are required. You can fill in the rest later.
        </p>
      </div>
      <AdminRestaurantForm action={addRestaurant} />
    </div>
  );
}
