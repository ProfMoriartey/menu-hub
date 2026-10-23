// src/components/share/TableCardSheet.tsx
"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, EyeOff, Info, Printer } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { loadLogo, qrToSvg } from "~/lib/qr-code";
import {
  CARD_HEADLINES,
  CARD_LANGUAGE_NAMES,
  isCardLanguage,
  type CardLanguage,
} from "~/lib/table-card-text";
import { cn } from "~/lib/utils";

type SheetLayout = "a6" | "a4";
type Logo = Awaited<ReturnType<typeof loadLogo>>;

interface TableCardSheetProps {
  restaurant: { name: string; slug: string; logoUrl: string | null; isActive: boolean };
  menuUrl: string;
  permanentUrl: string;
  backHref: string;
}

const NO_SECOND_LANGUAGE = "none";

// One A6 card (105 × 148 mm), always black on white for print.
function TableCard({
  restaurantName,
  logoDataUrl,
  qrSvg,
  headline,
  secondHeadline,
  linkText,
  cutLines,
}: {
  restaurantName: string;
  logoDataUrl: string | null;
  qrSvg: string;
  headline: { text: string; lang: CardLanguage };
  secondHeadline: { text: string; lang: CardLanguage } | null;
  linkText: string;
  cutLines: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-[148mm] w-[105mm] flex-col items-center justify-between bg-white px-[9mm] py-[10mm] text-center text-black",
        cutLines && "border border-dashed border-neutral-400",
      )}
    >
      <div className="flex flex-col items-center gap-[3mm]">
        {logoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoDataUrl} alt="" className="h-[18mm] w-[18mm] object-contain" />
        )}
        <p className="text-[5.5mm] leading-tight font-semibold">{restaurantName}</p>
      </div>

      <div className="flex flex-col items-center gap-[1.5mm]">
        <p
          lang={headline.lang}
          dir={headline.lang === "ar" ? "rtl" : "ltr"}
          className="text-[8mm] leading-tight font-extrabold tracking-tight"
        >
          {headline.text}
        </p>
        {secondHeadline && (
          <p
            lang={secondHeadline.lang}
            dir={secondHeadline.lang === "ar" ? "rtl" : "ltr"}
            className="text-[5mm] leading-tight font-medium text-neutral-600"
          >
            {secondHeadline.text}
          </p>
        )}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`}
        alt=""
        className="h-[58mm] w-[58mm]"
      />

      <p className="font-mono text-[3.6mm] text-neutral-700" dir="ltr">
        {linkText}
      </p>
    </div>
  );
}

export function TableCardSheet({ restaurant, menuUrl, permanentUrl, backHref }: TableCardSheetProps) {
  const t = useTranslations("Share");
  const locale = useLocale();

  const [layout, setLayout] = useState<SheetLayout>("a4");
  const [language, setLanguage] = useState<CardLanguage>(isCardLanguage(locale) ? locale : "en");
  // A second line in English helps tourists, unless the card is English already.
  const [secondLanguage, setSecondLanguage] = useState<string>(
    isCardLanguage(locale) && locale !== "en" ? "en" : NO_SECOND_LANGUAGE,
  );
  const [withQrLogo, setWithQrLogo] = useState(Boolean(restaurant.logoUrl));
  const [logo, setLogo] = useState<Logo | null>(null);

  useEffect(() => {
    if (!restaurant.logoUrl) return;
    let cancelled = false;
    loadLogo(restaurant.logoUrl)
      .then((loaded) => !cancelled && setLogo(loaded))
      .catch(() => undefined); // The card simply goes without the logo.
    return () => {
      cancelled = true;
    };
  }, [restaurant.logoUrl]);

  const qrSvg = qrToSvg(permanentUrl, withQrLogo ? logo?.dataUrl : null);
  const second = isCardLanguage(secondLanguage) && secondLanguage !== language ? secondLanguage : null;
  const card = (
    <TableCard
      restaurantName={restaurant.name}
      logoDataUrl={logo?.dataUrl ?? null}
      qrSvg={qrSvg}
      headline={{ text: CARD_HEADLINES[language], lang: language }}
      secondHeadline={second ? { text: CARD_HEADLINES[second], lang: second } : null}
      linkText={menuUrl.replace(/^https?:\/\//, "")}
      cutLines={layout === "a4"}
    />
  );

  return (
    <div className="space-y-6">
      {/* Paper size and margins for the browser's print dialog. */}
      <style>{`@page { size: ${layout === "a4" ? "A4" : "A6"} portrait; margin: 0; }`}</style>

      {/* Settings: not printed */}
      <div className="space-y-4 print:hidden">
        <Link href={backHref} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" /> {t("backToShare")}
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("printTitle")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("printDescription")}</p>
        </div>

        {!restaurant.isActive && (
          <p className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
            <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            {t("printNotLive")}
          </p>
        )}

        <div className="bg-card border-border flex flex-wrap items-end gap-4 rounded-xl border p-4 shadow-sm">
          <div className="space-y-1.5">
            <Label htmlFor="card-layout">{t("layout")}</Label>
            <Select value={layout} onValueChange={(v) => setLayout(v as SheetLayout)}>
              <SelectTrigger id="card-layout" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">{t("layoutA4")}</SelectItem>
                <SelectItem value="a6">{t("layoutA6")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-language">{t("cardLanguage")}</Label>
            <Select
              value={language}
              onValueChange={(v) => {
                if (!isCardLanguage(v)) return;
                setLanguage(v);
                // The same language twice would just repeat the line.
                if (v === secondLanguage) setSecondLanguage(NO_SECOND_LANGUAGE);
              }}
            >
              <SelectTrigger id="card-language" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CARD_LANGUAGE_NAMES).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-second-language">{t("secondLanguage")}</Label>
            <Select value={secondLanguage} onValueChange={setSecondLanguage}>
              <SelectTrigger id="card-second-language" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SECOND_LANGUAGE}>{t("noSecondLanguage")}</SelectItem>
                {Object.entries(CARD_LANGUAGE_NAMES)
                  .filter(([code]) => code !== language)
                  .map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex h-9 items-center gap-2">
            <Switch
              id="card-qr-logo"
              checked={withQrLogo && logo !== null}
              onCheckedChange={setWithQrLogo}
              disabled={!logo}
            />
            <Label htmlFor="card-qr-logo">{t("logoSwitch")}</Label>
          </div>
          <Button type="button" onClick={() => window.print()} className="ms-auto">
            <Printer className="h-4 w-4" /> {t("print")}
          </Button>
        </div>

        <p className="text-muted-foreground flex items-start gap-2 text-xs">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {t("printScaleTip")}
        </p>
      </div>

      {/* The printed sheet. On screen it scrolls sideways on narrow phones. */}
      <div className="overflow-x-auto print:overflow-visible">
        <div
          dir="ltr"
          className={cn(
            "mx-auto w-fit bg-white shadow-md print:shadow-none",
            layout === "a4" && "grid h-[297mm] w-[210mm] grid-cols-2 grid-rows-2",
          )}
        >
          {layout === "a4" ? (
            <>
              {card}
              {card}
              {card}
              {card}
            </>
          ) : (
            card
          )}
        </div>
      </div>
    </div>
  );
}
