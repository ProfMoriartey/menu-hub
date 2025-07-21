// src/components/shared/MenuItemCardSkeleton.tsx
import { Skeleton } from "~/components/ui/skeleton"; // Assuming shadcn/ui Skeleton

export function MenuItemCardSkeleton() {
  return (
    <div className="flex flex-row items-start space-x-4 rounded-lg bg-white p-4 shadow-md">
      {/* Text Content Skeleton */}
      <div className="order-first flex-grow space-y-2 text-left">
        <Skeleton className="h-6 w-3/4" /> {/* For name */}
        <Skeleton className="h-4 w-full" /> {/* For description line 1 */}
        <Skeleton className="h-4 w-1/2" /> {/* For description line 2 */}
        <Skeleton className="mt-2 h-5 w-1/4" /> {/* For price */}
        <div className="mt-2 flex flex-wrap gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />{" "}
          {/* For dietary label 1 */}
          <Skeleton className="h-5 w-20 rounded-full" />{" "}
          {/* For dietary label 2 */}
        </div>
      </div>
      {/* Image Skeleton */}
      <div className="order-last flex-shrink-0">
        <Skeleton className="h-24 w-24 rounded-md sm:h-32 sm:w-32" />
      </div>
    </div>
  );
}
