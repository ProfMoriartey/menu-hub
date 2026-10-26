// app/loading.tsx
import { Loader2 } from "lucide-react"; // Import the spinner icon
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

export default function Loading() {
  return (
    // UPDATED: Use bg-background for the background
    <div
      className={cn(
        "flex min-h-screen items-center justify-center",
        "bg-background",
      )}
    >
      <div className="flex flex-col items-center">
        {/* UPDATED: Use text-primary for the spinner color */}
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
      </div>
    </div>
  );
}
