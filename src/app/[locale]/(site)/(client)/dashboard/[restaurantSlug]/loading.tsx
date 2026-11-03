// app/[locale]/(site)/(client)/dashboard/[restaurantSlug]/loading.tsx
// Shown while switching between a restaurant's dashboard tabs: the shape of
// DashboardRestaurantHeader and a page under it, so the screen doesn't blank
// out to the site-wide spinner on every tab.
import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true">
      <div className="mb-8 space-y-5">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="border-border flex gap-1 border-b pb-2.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-20" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
