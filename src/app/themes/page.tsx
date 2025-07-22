// src/app/themes/page.tsx
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

export default function ThemesPage() {
  return (
    // UPDATED: Use bg-background and text-foreground for the main container
    <div
      className={cn(
        "flex min-h-screen items-center justify-center p-8",
        "bg-background text-foreground",
      )}
    >
      {/* UPDATED: Heading uses text-foreground */}
      <h1 className="text-foreground text-4xl font-bold">Themes</h1>
      {/* UPDATED: Paragraph uses text-muted-foreground */}
      <p className="text-muted-foreground mt-4 text-lg">
        (Information about themes will go here)
      </p>
    </div>
  );
}
