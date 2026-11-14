// Fake data only. Re-running deletes the demo restaurants and inserts them again.
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Run `pnpm dev:setup` first.");
  process.exit(1);
}
// It deletes and inserts rows: only ever against the local throwaway database.
const { hostname } = new URL(process.env.DATABASE_URL);
if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname)) {
  console.error(`Refusing to seed ${hostname}: only a local database (see pnpm dev:setup).`);
  process.exit(1);
}
const sql = postgres(process.env.DATABASE_URL, { onnotice: () => {} });

const LANGS = ["en", "tr", "ar", "es", "ru"];
const CATS = [
  { slug: "starters", en: "Starters", tr: "Başlangıçlar", ar: "المقبلات", es: "Entradas", ru: "Закуски" },
  { slug: "mains", en: "Mains", tr: "Ana yemekler", ar: "الأطباق الرئيسية", es: "Platos principales", ru: "Основные блюда" },
  { slug: "desserts", en: "Desserts", tr: "Tatlılar", ar: "الحلويات", es: "Postres", ru: "Десерты" },
  { slug: "drinks", en: "Drinks", tr: "İçecekler", ar: "المشروبات", es: "Bebidas", ru: "Напитки" },
];
const t = (en, tr, ar, es, ru) => ({ en, tr, ar, es, ru });
// photo: file in public/demo; avail: available | sold_out | hidden
const DISHES = [
  { slug: "hummus", cat: "starters", price: "6.50", photo: "hummus.jpg", name: t("Hummus", "Humus", "حمص", "Hummus", "Хумус"), desc: t("Chickpea purée with tahini and olive oil", "Tahinli ve zeytinyağlı nohut ezmesi", "هريس الحمص مع الطحينة وزيت الزيتون", "Puré de garbanzos con tahini y aceite de oliva", "Пюре из нута с тахини и оливковым маслом"), ing: t("Chickpeas, tahini, lemon", "Nohut, tahin, limon", "حمص، طحينة، ليمون", "Garbanzos, tahini, limón", "Нут, тахини, лимон") },
  { slug: "lentil-soup", cat: "starters", price: "5.00", photo: "lentil-soup.jpg", name: t("Lentil soup", "Mercimek çorbası", "شوربة العدس", "Sopa de lentejas", "Чечевичный суп"), desc: t("Red lentil soup with lemon", "Limonlu kırmızı mercimek çorbası", "شوربة عدس أحمر مع الليمون", "Sopa de lentejas rojas con limón", "Суп из красной чечевицы с лимоном"), ing: t("Red lentils, onion, cumin", "Kırmızı mercimek, soğan, kimyon", "عدس أحمر، بصل، كمون", "Lentejas rojas, cebolla, comino", "Красная чечевица, лук, кумин") },
  { slug: "adana-kebab", cat: "mains", price: "14.00", photo: "adana-kebab.jpg", name: t("Adana kebab", "Adana kebap", "كباب أضنة", "Kebab de Adana", "Кебаб адана"), desc: t("Spiced minced lamb grilled on a skewer", "Şişte ızgara baharatlı kuzu kıyma", "لحم ضأن مفروم متبل مشوي على سيخ", "Cordero picado especiado asado en brocheta", "Острый бараний фарш, жаренный на шпажке"), ing: t("Lamb, red pepper, flatbread", "Kuzu, kırmızı biber, lavaş", "ضأن، فلفل أحمر، خبز", "Cordero, pimiento rojo, pan plano", "Баранина, красный перец, лепёшка") },
  { slug: "baklava", cat: "desserts", price: "7.00", photo: "baklava.jpg", name: t("Baklava", "Baklava", "بقلاوة", "Baklava", "Пахлава"), desc: t("Layered pastry with pistachio and syrup", "Antep fıstıklı, şerbetli katmer", "معجنات طبقات بالفستق والقطر", "Hojaldre en capas con pistacho y almíbar", "Слоёная выпечка с фисташками и сиропом"), ing: t("Phyllo, pistachio, syrup", "Yufka, fıstık, şerbet", "عجين فيلو، فستق، قطر", "Pasta filo, pistacho, almíbar", "Тесто фило, фисташки, сироп") },
  { slug: "turkish-tea", cat: "drinks", price: "2.00", photo: "turkish-tea.jpg", name: t("Turkish tea", "Türk çayı", "شاي تركي", "Té turco", "Турецкий чай"), desc: t("Black tea in a tulip glass", "İnce belli bardakta demli çay", "شاي أسود في كأس ضيق", "Té negro en vaso de tulipán", "Чёрный чай в стакане-тюльпане"), ing: t("Black tea", "Siyah çay", "شاي أسود", "Té negro", "Чёрный чай") },
  // Edge cases
  { slug: "sold-out-manti", cat: "mains", price: "11.50", photo: "adana-kebab.jpg", avail: "sold_out", name: t("Manti", "Mantı", "مانتي", "Mantı", "Манты"), desc: t("Small dumplings with yoghurt", "Yoğurtlu küçük mantı", "فطائر صغيرة مع اللبن", "Raviolis pequeños con yogur", "Маленькие пельмени с йогуртом"), ing: t("Beef, yoghurt, mint", "Dana, yoğurt, nane", "لحم بقري، لبن، نعناع", "Ternera, yogur, menta", "Говядина, йогурт, мята") },
  { slug: "hidden-special", cat: "desserts", price: "9.00", photo: null, avail: "hidden", name: t("Hidden special", "Gizli özel", "طبق خاص مخفي", "Especial oculto", "Скрытое блюдо"), desc: t("Not shown to guests", "Misafirlere gösterilmez", "لا يظهر للضيوف", "No se muestra a los clientes", "Гостям не показывается"), ing: t("-", "-", "-", "-", "-") },
  { slug: "no-photo-pide", cat: "mains", price: "10.00", photo: null, name: t("Cheese pide", "Peynirli pide", "بيدا بالجبن", "Pide de queso", "Пиде с сыром"), desc: t("Boat-shaped bread with melted cheese", "Eritilmiş peynirli kayık ekmek", "خبز على شكل قارب مع جبن مذاب", "Pan en forma de barco con queso fundido", "Хлеб-лодочка с расплавленным сыром"), ing: t("Dough, kashar cheese", "Hamur, kaşar", "عجين، جبن كشكوان", "Masa, queso kashar", "Тесто, сыр кашар") },
  { slug: "long-names", cat: "mains", price: "18.00", photo: null, name: t("Slow-cooked lamb shank with smoked aubergine purée and roasted tomato", "Közlenmüş patlıcan ezmesi ve fırınlanmış domates eşliğinde yavaş pişirilmiş kuzu incik, ev yapımı yoğurtlu pilav ve taze nane yapraklarıyla servis edilir", "ساق ضأن مطبوخة ببطء مع هريس الباذنجان المدخن والطماطم المشوية", "Jarrete de cordero cocinado a fuego lento con puré de berenjena ahumada y tomate asado", "Медленно приготовленная баранья голень с пюре из копчёных баклажанов, запечёнными помидорами и домашним рисовым пловом с йогуртом и свежей мятой"), desc: t("A deliberately long name to test wrapping", "Taşma testi için kasıtlı olarak uzun bir ad: kuzu incik, patlıcan, domates ve pilav", "اسم طويل عمدا لاختبار التفاف النص", "Un nombre deliberadamente largo para probar el ajuste de línea", "Намеренно длинное название для проверки переноса строк"), ing: t("Lamb, aubergine, tomato", "Kuzu, patlıcan, domates", "ضأن، باذنجان، طماطم", "Cordero, berenjena, tomate", "Баранина, баклажан, помидор") },
];

const pal = (background, card, header, text, primary, secondary, accent) => ({ background, card, header, text, primary, secondary, accent });
const GREEN = { light: pal("#f3faf3", "#ffffff", "#d7efd9", "#14301a", "#1f7a3a", "#d7efd9", "#2e9e4f"), dark: pal("#0e1f12", "#16301c", "#1d4126", "#e3f3e5", "#5fd17f", "#1d4126", "#7fe29a") };
const YELLOW = { light: pal("#fffdf0", "#ffffff", "#fff7c2", "#3b3200", "#8a6d00", "#fff7c2", "#b38f00"), dark: pal("#201c07", "#2d2810", "#3d3612", "#f5efc4", "#f2d34a", "#3d3612", "#ffe36b") };
const NAVY = { light: pal("#0b1a33", "#13264a", "#0f2142", "#e8edf8", "#7fb2ff", "#1b3563", "#9cc4ff"), dark: pal("#0b1a33", "#13264a", "#0f2142", "#e8edf8", "#7fb2ff", "#1b3563", "#9cc4ff") };

const HOURS = (r) => Object.fromEntries(["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => [d, r(d)]));
const LUNCH_DINNER = HOURS((d) => (d === "mon" ? [] : [{ open: "11:30", close: "15:00" }, { open: "18:00", close: "23:30" }]));
const LATE = HOURS(() => [{ open: "12:00", close: "02:00" }]);

const RESTAURANTS = [
  { slug: "demo-lokanta", name: "Lokanta Yeşil", main: "tr", design: "classic", color: "#1f7a3a", theme: GREEN, logo: "/demo/lokanta-logo.svg", branches: [{ slug: "main", name: null, hours: LUNCH_DINNER }] },
  { slug: "demo-limon-cafe", name: "Café Limon", main: "en", design: "photo-grid", color: "#8a6d00", theme: YELLOW, logo: null, branches: [{ slug: "main", name: null, hours: null }] },
  { slug: "demo-nacht-bistro", name: "Nacht Bistro", main: "en", design: "compact", color: "#7fb2ff", theme: NAVY, logo: "/demo/lokanta-logo.svg", branches: [{ slug: "main", name: null, hours: LATE }] },
  { slug: "demo-bosphorus", name: "Bosphorus Table", main: "ru", design: "classic", color: null, theme: null, logo: null,
    branches: [
      { slug: "kadikoy", name: "Kadıköy", hours: LUNCH_DINNER, city: "Istanbul" },
      { slug: "besiktas", name: "Beşiktaş", hours: LATE, city: "Istanbul" },
      { slug: "sisli", name: "Şişli", hours: null, city: "Istanbul" },
    ] },
];

const pick = (o, lang) => o[lang];
const trans = (o, main, fields) =>
  Object.fromEntries(LANGS.filter((l) => l !== main).map((l) => [l, Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v[l]]))]));

const slugs = RESTAURANTS.map((r) => r.slug);
await sql.begin(async (tx) => {
  await tx`delete from "menu-hub_restaurants" where slug = any(${slugs})`;
  for (const r of RESTAURANTS) {
    const [row] = await tx`insert into "menu-hub_restaurants"
      (name, slug, is_active, is_displayed, logo_url, currency, theme, multilingual_enabled, main_language, extra_languages,
       brand_color_enabled, brand_color, color_theme, max_extra_languages, max_branches, type_of_establishment)
      values (${r.name}, ${r.slug}, true, true, ${r.logo}, 'USD', ${r.design}, true, ${r.main},
              ${tx.json(LANGS.filter((l) => l !== r.main))}, ${!!r.theme}, ${r.color}, ${r.theme ? tx.json(r.theme) : null}, 4, 5, 'restaurant')
      returning id`;
    for (const [i, b] of r.branches.entries()) {
      await tx`insert into "menu-hub_branches" (restaurant_id, name, slug, "order", city, country, time_zone, opening_hours)
        values (${row.id}, ${b.name}, ${b.slug}, ${i}, ${b.city ?? "Istanbul"}, 'TR', 'Europe/Istanbul', ${b.hours ? tx.json(b.hours) : null})`;
    }
    const catId = {};
    for (const [i, c] of CATS.entries()) {
      const [cr] = await tx`insert into "menu-hub_categories" (restaurant_id, name, slug, "order", translations)
        values (${row.id}, ${pick(c, r.main)}, ${c.slug}, ${i}, ${tx.json(trans(c, r.main, { name: c }))}) returning id`;
      catId[c.slug] = cr.id;
    }
    for (const [i, d] of DISHES.entries()) {
      await tx`insert into "menu-hub_menu_items"
        (category_id, restaurant_id, name, slug, description, price, ingredients, availability, translations, image_url, "order")
        values (${catId[d.cat]}, ${row.id}, ${pick(d.name, r.main)}, ${d.slug}, ${pick(d.desc, r.main)}, ${d.price}, ${pick(d.ing, r.main)},
                ${d.avail ?? "available"}, ${tx.json(trans(d, r.main, { name: d.name, description: d.desc, ingredients: d.ing }))},
                ${d.photo ? `/demo/${d.photo}` : null}, ${i})`;
    }
  }
});
await sql.end();

const base = process.env.BASE_URL ?? "http://localhost:3000";
console.log("Seeded. Open:");
for (const r of RESTAURANTS) {
  console.log(`  ${base}/en/${r.slug}  (${r.design}, ${r.theme ? r.color : "default colours"}, main ${r.main})`);
  if (r.branches.length > 1) for (const b of r.branches) console.log(`  ${base}/en/${r.slug}/${b.slug}`);
}
