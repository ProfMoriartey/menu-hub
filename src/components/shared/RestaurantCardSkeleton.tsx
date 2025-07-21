// src/components/shared/RestaurantCardSkeleton.tsx
import { Card, CardContent, CardHeader } from "~/components/ui/card"; // Assuming shadcn/ui Card
import { Skeleton } from "~/components/ui/skeleton"; // Assuming shadcn/ui Skeleton

export function RestaurantCardSkeleton() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-grow">
        <div className="mb-4 h-40 w-full overflow-hidden rounded-md bg-gray-200">
          <Skeleton className="h-full w-full" />
        </div>
        <Skeleton className="mb-2 h-6 w-3/4" /> {/* For title */}
        <Skeleton className="h-4 w-1/2" /> {/* For description */}
      </CardHeader>
      <CardContent className="mt-auto">
        <Skeleton className="h-10 w-full" /> {/* For button */}
      </CardContent>
    </Card>
  );
}
