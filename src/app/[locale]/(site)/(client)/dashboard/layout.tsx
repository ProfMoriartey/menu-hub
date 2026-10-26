// app/[locale]/(client)/dashboard/layout.tsx
import { getTranslations } from "next-intl/server";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { LanguageSwitcher } from "~/components/shared/LanguageSwitcher";
import { ThemeToggle } from "~/components/shared/ThemeToggle";

// The bar on every dashboard page: back to the dashboard home, language,
// theme and account. Each page below handles its own sign-in check.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("DashboardShell");

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card border-border sticky top-0 z-20 border-b print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="text-primary inline-flex items-center gap-2 font-extrabold tracking-tight">
            <LayoutDashboard className="h-5 w-5" aria-hidden />
            {t("home")}
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="w-auto" />
            <ThemeToggle />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
