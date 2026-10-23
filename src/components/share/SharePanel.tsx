// src/components/share/SharePanel.tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, CircleAlert, Copy, Download, ExternalLink, EyeOff, Globe, Info } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { loadLogo, qrToPng, qrToSvg } from "~/lib/qr-code";

interface SharePanelProps {
  restaurant: { name: string; slug: string; logoUrl: string | null; isActive: boolean };
  menuUrl: string;
  permanentUrl: string;
  // Where "add a logo" points, or null when the viewer can't edit details.
  detailsHref: string | null;
}

type Logo = Awaited<ReturnType<typeof loadLogo>>;

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function SharePanel({ restaurant, menuUrl, permanentUrl, detailsHref }: SharePanelProps) {
  const t = useTranslations("Share");
  const [withLogo, setWithLogo] = useState(Boolean(restaurant.logoUrl));
  const [logo, setLogo] = useState<Logo | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the logo once; the QR code redraws with or without it.
  useEffect(() => {
    if (!restaurant.logoUrl) return;
    let cancelled = false;
    loadLogo(restaurant.logoUrl)
      .then((loaded) => !cancelled && setLogo(loaded))
      .catch(() => !cancelled && setLogoFailed(true));
    return () => {
      cancelled = true;
    };
  }, [restaurant.logoUrl]);

  // The logo shows once it has loaded and the switch is on.
  const activeLogo = withLogo ? logo : null;
  const svg = qrToSvg(permanentUrl, activeLogo?.dataUrl);
  const fileBase = `${restaurant.slug}-menu-qr`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. without HTTPS); the link is selectable.
    }
  };

  const downloadPng = async () => {
    setError(null);
    try {
      download(await qrToPng(permanentUrl, activeLogo?.image ?? null), `${fileBase}.png`);
    } catch {
      setError(t("downloadFailed"));
    }
  };

  const downloadSvg = () =>
    download(new Blob([svg], { type: "image/svg+xml" }), `${fileBase}.svg`);

  return (
    <div className="space-y-6">
      {/* Live or not */}
      {restaurant.isActive ? (
        <p className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
          <Globe className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
          {t("liveStatus")}
        </p>
      ) : (
        <p className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
          <span>
            {t("notLiveStatus")}{" "}
            <Link href={`/${restaurant.slug}`} target="_blank" className="font-medium underline underline-offset-2">
              {t("previewLink")}
            </Link>
          </span>
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* QR code */}
        <section aria-labelledby="qr-title" className="bg-card border-border rounded-xl border shadow-sm">
          <header className="border-border border-b px-5 py-4 sm:px-6">
            <h2 id="qr-title" className="text-base font-semibold">
              {t("qrTitle")}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">{t("qrDescription")}</p>
          </header>
          <div className="space-y-5 px-5 py-5 sm:px-6">
            <div className="mx-auto w-full max-w-[240px] rounded-xl border border-black/10 bg-white p-2 shadow-sm">
              {/* An <img> of the generated SVG: exactly what gets downloaded. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
                alt={t("qrAlt", { name: restaurant.name })}
                className="aspect-square w-full"
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="qr-logo">{t("logoSwitch")}</Label>
                <p className="text-muted-foreground text-xs">
                  {!restaurant.logoUrl ? (
                    detailsHref ? (
                      <>
                        {t("noLogo")}{" "}
                        <Link href={detailsHref} className="text-primary underline underline-offset-2">
                          {t("addLogo")}
                        </Link>
                      </>
                    ) : (
                      t("noLogoAskOwner")
                    )
                  ) : logoFailed ? (
                    t("logoLoadFailed")
                  ) : (
                    t("logoHint")
                  )}
                </p>
              </div>
              <Switch
                id="qr-logo"
                checked={activeLogo !== null}
                onCheckedChange={setWithLogo}
                disabled={!restaurant.logoUrl || logoFailed || (withLogo && !logo)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={downloadPng}>
                <Download className="h-4 w-4" /> {t("downloadPng")}
              </Button>
              <Button type="button" variant="outline" onClick={downloadSvg}>
                <Download className="h-4 w-4" /> {t("downloadSvg")}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">{t("formatsHint")}</p>
            {error && (
              <p className="text-destructive flex items-center gap-1.5 text-sm" role="alert">
                <CircleAlert className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}
            <p className="text-muted-foreground flex items-start gap-2 text-xs">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {t("testTip")}
            </p>
          </div>
        </section>

        {/* Link */}
        <section aria-labelledby="link-title" className="bg-card border-border h-fit rounded-xl border shadow-sm">
          <header className="border-border border-b px-5 py-4 sm:px-6">
            <h2 id="link-title" className="text-base font-semibold">
              {t("linkTitle")}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">{t("linkDescription")}</p>
          </header>
          <div className="space-y-4 px-5 py-5 sm:px-6">
            <div className="flex gap-2" dir="ltr">
              <Input
                value={menuUrl}
                readOnly
                aria-label={t("linkTitle")}
                onFocus={(e) => e.currentTarget.select()}
                className="font-mono text-sm"
              />
              <Button type="button" variant="outline" onClick={copyLink} className="shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t("copied") : t("copy")}
              </Button>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href={menuUrl} target="_blank" rel="noreferrer">
                {t("openLink")} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
            <p className="text-muted-foreground border-border border-t pt-4 text-xs">
              {t("permanentNote")}{" "}
              <span className="font-mono" dir="ltr">
                {permanentUrl}
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
