"use client";
// app/[locale]/error.tsx
// Shown when a page fails on the server or in the browser, instead of a blank
// screen. A client component with no translation provider above it (public
// menu pages don't load one), so its few lines are kept here per language.
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { RotateCw } from "lucide-react";
import { Button } from "~/components/ui/button";

const COPY = {
  en: [
    "Something went wrong",
    "Please try again. If it keeps happening, reload the page in a moment.",
    "Try again",
  ],
  tr: [
    "Bir şeyler ters gitti",
    "Lütfen tekrar deneyin. Sorun devam ederse birazdan sayfayı yenileyin.",
    "Tekrar dene",
  ],
  ar: [
    "حدث خطأ ما",
    "يرجى المحاولة مرة أخرى. إذا تكرر ذلك، أعد تحميل الصفحة بعد قليل.",
    "حاول مرة أخرى",
  ],
  es: [
    "Algo salió mal",
    "Inténtalo de nuevo. Si sigue pasando, recarga la página en un momento.",
    "Reintentar",
  ],
  ru: [
    "Что-то пошло не так",
    "Попробуйте ещё раз. Если ошибка повторится, обновите страницу чуть позже.",
    "Попробовать снова",
  ],
} as const;

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useParams<{ locale: string }>();
  const [title, text, retry] = COPY[locale as keyof typeof COPY] ?? COPY.en;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-16">
      <div role="alert" className="max-w-md text-center">
        <h1 className="text-foreground text-2xl font-bold text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-3 text-pretty">{text}</p>
        <Button size="lg" className="mt-8" onClick={reset}>
          <RotateCw className="h-4 w-4" aria-hidden />
          {retry}
        </Button>
      </div>
    </main>
  );
}
