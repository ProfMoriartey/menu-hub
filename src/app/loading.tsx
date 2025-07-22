// app/loading.tsx
import { Loader2 } from "lucide-react"; // Import the spinner icon

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    </div>
  );
}
