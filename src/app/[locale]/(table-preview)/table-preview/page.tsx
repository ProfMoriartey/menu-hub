// Dev-only preview of The Table's primitives (ticket 1). Removed before
// the branch is final.
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Cloth } from "~/components/table/Cloth";
import { LeaderRow } from "~/components/table/LeaderRow";
import { PlaceCard } from "~/components/table/PlaceCard";
import { Plate, PlatePhoto } from "~/components/table/Plate";
import { Stamp } from "~/components/table/Stamp";
import { TableWorld } from "~/components/table/TableWorld";

const copy = {
  en: {
    eyebrow: "Digital menus for restaurants and cafés",
    h1: "Every seat reads your menu in their language.",
    p: "One QR code on the table. Guests open your menu on their own phone, with photos and prices, in English, Türkçe, العربية, Español or Русский. You change it yourself, any time.",
    cta: "Create your menu",
    note: "Free for 6 months, then $25 a month",
    nav: ["Features", "Example menus", "Pricing", "Sign in"],
    start: "Start free",
    seat: "Seat",
    open: "Open now · until 23:00",
    chips: ["Starters", "Mains", "Desserts"],
    dishes: [
      ["Red lentil soup", "4.50", "/demo/lentil-soup.jpg"],
      ["Hummus with warm pide and a long name that wraps", "7.00", "/demo/hummus.jpg"],
      ["Lamb adana", "16.50", "/demo/adana-kebab.jpg"],
      ["Chicken shish", "14.00", null],
      ["Baklava", "5.00", "/demo/baklava.jpg"],
    ],
    soldOut: "Sold out",
  },
  ar: {
    eyebrow: "قوائم طعام رقمية للمطاعم والمقاهي",
    h1: "كل ضيف على الطاولة يقرأ قائمتك بلغته.",
    p: "رمز QR واحد على الطاولة. يفتح الضيوف قائمتك على هواتفهم، بالصور والأسعار، بالإنجليزية أو التركية أو العربية أو الإسبانية أو الروسية. وأنت تعدّلها بنفسك متى شئت.",
    cta: "أنشئ قائمتك",
    note: "مجانًا لمدة 6 أشهر، ثم 25 دولارًا شهريًا",
    nav: ["الميزات", "قوائم للمثال", "الأسعار", "تسجيل الدخول"],
    start: "ابدأ مجانًا",
    seat: "مقعد",
    open: "مفتوح الآن · حتى 23:00",
    chips: ["المقبلات", "الأطباق الرئيسية", "الحلويات"],
    dishes: [
      ["شوربة العدس الأحمر", "4.50", "/demo/lentil-soup.jpg"],
      ["حمص مع خبز البيدا الساخن واسم طويل يلتف إلى سطر ثانٍ", "7.00", "/demo/hummus.jpg"],
      ["كباب أضنة باللحم", "16.50", "/demo/adana-kebab.jpg"],
      ["شيش دجاج", "14.00", null],
      ["بقلاوة", "5.00", "/demo/baklava.jpg"],
    ],
    soldOut: "نفدت الكمية",
  },
} as const;

const seats = [
  { name: "English", lang: "en", label: "Seat 1", tilt: -6 },
  { name: "Türkçe", lang: "tr", label: "Koltuk 2", tilt: 5 },
  { name: "العربية", lang: "ar", label: "مقعد ٣", tilt: -4 },
  { name: "Español", lang: "es", label: "Asiento 4", tilt: 7 },
  { name: "Русский", lang: "ru", label: "Место 5", tilt: -3 },
];
const seatPos = [
  "lg:start-10 lg:top-[640px]",
  "lg:start-[600px] lg:top-2.5",
  "lg:start-[1130px] lg:top-[120px]",
  "lg:start-[1180px] lg:top-[430px]",
  "lg:start-[720px] lg:top-[640px]",
];

export default async function TablePreview({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = locale === "ar" ? copy.ar : copy.en;
  const active = locale === "ar" ? "ar" : "en";
  return (
    <TableWorld>
      <Cloth as="main" className="min-h-screen overflow-x-hidden">
        <nav className="flex items-center gap-7 px-4 py-4 text-[0.9375rem] font-medium lg:px-12 lg:py-5">
          <Image src="/brand/menupedia-wordmark-dark.svg" alt="Menupedia" width={469} height={100} unoptimized className="h-7 w-auto" />
          <span className="flex-1" />
          <span className="hidden gap-7 lg:flex">
            {t.nav.map((n) => (
              <a key={n} href="#" className="text-on-cloth-muted hover:text-on-cloth">{n}</a>
            ))}
          </span>
          <Button variant="tableOnCloth" size="pill">{t.start}</Button>
        </nav>

        <div className="relative mx-auto max-w-[1440px] pb-10 lg:h-[760px]">
          <div className="flex justify-center lg:contents">
          <Plate size="hero" className="text-start lg:absolute lg:start-[90px] lg:top-10">
            <div className="w-[min(72%,100vw-2.5rem)]">
              <p className="text-cloth-ink text-[clamp(0.6875rem,1.4vw,0.8125rem)] font-bold tracking-[0.14em] uppercase">{t.eyebrow}</p>
              <h1 className="mt-2 mb-2 text-[clamp(1.75rem,7.4vw,3.625rem)] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance lg:mt-3.5 lg:mb-4">{t.h1}</h1>
              <p className="text-ink-muted text-[clamp(0.875rem,3.6vw,1.09rem)] leading-snug">{t.p}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3.5 lg:mt-6">
                <Button variant="table" size="pill">{t.cta}</Button>
                <span className="text-ink-muted max-w-[11rem] text-[0.84rem] leading-tight">{t.note}</span>
              </div>
            </div>
          </Plate>
          </div>

          {/* The phone lying on the table. */}
          <div className="relative mx-auto -mt-10 h-[470px] w-[250px] rotate-4 rounded-[38px] bg-[#141112] p-3 shadow-[-18px_30px_50px_rgb(0_0_0/0.4)] lg:absolute lg:start-[820px] lg:top-[70px] lg:mt-0 lg:h-[590px] lg:w-[290px] lg:rotate-8 [[dir=rtl]_&]:-rotate-4 lg:[[dir=rtl]_&]:-rotate-8">
            <div className="bg-plate text-ink h-full overflow-hidden rounded-[28px] px-3.5 py-4">
              <p className="text-lg font-bold">Lokanta Demo</p>
              <p className="mt-0.5 mb-3 text-[0.6875rem] font-bold text-[#2f7d32]">● {t.open}</p>
              <div className="flex gap-1">
                {t.chips.map((c, i) => (
                  <span key={c} className={`rounded-full px-2.5 py-1.5 text-[0.6875rem] font-bold ${i === 0 ? "bg-[#2f7d32] text-white" : "bg-plate-rim"}`}>{c}</span>
                ))}
              </div>
              <ul>
                {t.dishes.map(([name, price, src], i) => (
                  <li key={name} className="relative grid grid-cols-[56px_1fr] items-center gap-2.5 border-b border-dashed border-[#ddd] py-2.5">
                    <PlatePhoto src={src} alt="" size={56} />
                    <LeaderRow name={name} price={price} muted={i === 3} nameClassName="text-[0.84rem]" priceClassName={i === 3 ? "" : "text-[#2f7d32]"} />
                    {i === 3 ? <Stamp className="absolute start-0 top-8 text-[0.6875rem]">{t.soldOut}</Stamp> : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4 px-4 lg:contents">
            {seats.map((s, i) => (
              <PlaceCard
                key={s.lang}
                label={s.label}
                name={s.name}
                lang={s.lang}
                tilt={s.tilt}
                active={s.lang === active}
                className={`lg:absolute ${seatPos[i]}`}
              />
            ))}
          </div>
        </div>
      </Cloth>
    </TableWorld>
  );
}
