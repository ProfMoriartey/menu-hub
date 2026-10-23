// src/components/menu-editor/CategorySwitcher.tsx
import { Link } from "~/i18n/navigation";
import { cn } from "~/lib/utils";

// Chips for jumping between a restaurant's categories on the items page.
export function CategorySwitcher({
  categories,
  currentId,
  basePath,
  label,
}: {
  categories: { id: string; slug: string; name: string }[];
  currentId: string;
  basePath: string;
  label: string;
}) {
  if (categories.length < 2) return null;

  return (
    <nav
      aria-label={label}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`${basePath}/${c.slug}`}
          aria-current={c.id === currentId ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
            c.id === currentId
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {c.name}
        </Link>
      ))}
    </nav>
  );
}
