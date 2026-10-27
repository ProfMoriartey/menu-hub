// src/lib/demo-menu.ts
// The made-up restaurant on the Features and home pages: a small menu in
// all five languages, so visitors can try designs, colours and languages.
// Not in the database; prices are formatted per language by the page.
//
// Photos: public/ (bowl, fries, cheesecake, cola) and public/demo/, from
// Unsplash under the Unsplash License (free, no attribution required):
// lentil-soup  Max Griss            unsplash.com/photos/xVgE_mCA8fk
// hummus       Imad 786             unsplash.com/photos/n5I4Ix008-0
// adana-kebab  Husien Bisky         unsplash.com/photos/0gSpvtwdKuk
// baklava      Benjamin Chambon     unsplash.com/photos/OEDeQheVySQ
// turkish-tea  Mehrshad Rajabi      unsplash.com/photos/BRVpzGwNzzI
import type { MenuLanguage } from "~/lib/menu-languages";
import type { PublicCategory } from "~/components/public/menu-types";
import type { DietaryLabel, MenuItem } from "~/types/restaurant";

type Text = Record<MenuLanguage, string>;

interface DemoDish {
  slug: string;
  name: Text;
  description: Text;
  price: string;
  imageUrl: string | null;
  dietaryLabels: DietaryLabel[];
  availability: MenuItem["availability"];
}

export const DEMO_RESTAURANT = {
  name: "Lokanta Demo",
  slug: "demo",
  logoUrl: "/demo/lokanta-logo.svg",
  currency: "TRY",
  description: {
    en: "Home-style Turkish cooking, fresh every day.",
    tr: "Her gün taze, ev usulü Türk mutfağı.",
    ar: "مطبخ تركي منزلي، طازج كل يوم.",
    es: "Cocina turca casera, fresca cada día.",
    ru: "Домашняя турецкая кухня, свежая каждый день.",
  } satisfies Text,
};

const CATEGORIES: { slug: string; name: Text; dishes: DemoDish[] }[] = [
  {
    slug: "starters",
    name: {
      en: "Starters",
      tr: "Başlangıçlar",
      ar: "المقبلات",
      es: "Entrantes",
      ru: "Закуски",
    },
    dishes: [
      {
        slug: "lentil-soup",
        name: {
          en: "Lentil soup",
          tr: "Mercimek çorbası",
          ar: "شوربة العدس",
          es: "Sopa de lentejas",
          ru: "Чечевичный суп",
        },
        description: {
          en: "Red lentils, butter and a squeeze of lemon.",
          tr: "Kırmızı mercimek, tereyağı ve limon.",
          ar: "عدس أحمر وزبدة وعصرة ليمون.",
          es: "Lentejas rojas, mantequilla y un toque de limón.",
          ru: "Красная чечевица, сливочное масло и лимон.",
        },
        price: "120",
        imageUrl: "/demo/lentil-soup.jpg",
        dietaryLabels: ["vegetarian", "gluten-free"],
        availability: "available",
      },
      {
        slug: "hummus",
        name: {
          en: "Hummus with warm bread",
          tr: "Sıcak ekmekle humus",
          ar: "حمص مع خبز ساخن",
          es: "Hummus con pan caliente",
          ru: "Хумус с тёплым хлебом",
        },
        description: {
          en: "Chickpeas, tahini and olive oil.",
          tr: "Nohut, tahin ve zeytinyağı.",
          ar: "حمص وطحينة وزيت زيتون.",
          es: "Garbanzos, tahini y aceite de oliva.",
          ru: "Нут, тахини и оливковое масло.",
        },
        price: "145",
        imageUrl: "/demo/hummus.jpg",
        dietaryLabels: ["vegan"],
        availability: "available",
      },
    ],
  },
  {
    slug: "mains",
    name: {
      en: "Mains",
      tr: "Ana yemekler",
      ar: "الأطباق الرئيسية",
      es: "Principales",
      ru: "Основные блюда",
    },
    dishes: [
      {
        slug: "chicken-bowl",
        name: {
          en: "Grilled chicken bowl",
          tr: "Izgara tavuk kase",
          ar: "وعاء دجاج مشوي",
          es: "Bol de pollo a la parrilla",
          ru: "Боул с курицей гриль",
        },
        description: {
          en: "Rice, grilled chicken, seasonal vegetables and yoghurt sauce.",
          tr: "Pilav, ızgara tavuk, mevsim sebzeleri ve yoğurt sos.",
          ar: "أرز ودجاج مشوي وخضار موسمية وصلصة لبن.",
          es: "Arroz, pollo a la parrilla, verduras de temporada y salsa de yogur.",
          ru: "Рис, курица гриль, сезонные овощи и йогуртовый соус.",
        },
        price: "320",
        imageUrl: "/bowl.png",
        dietaryLabels: ["gluten-free"],
        availability: "available",
      },
      {
        slug: "adana-kebab",
        name: {
          en: "Adana kebab",
          tr: "Adana kebap",
          ar: "كباب أضنة",
          es: "Kebab Adana",
          ru: "Адана-кебаб",
        },
        description: {
          en: "Spicy minced lamb on the grill, with lavash and onions.",
          tr: "Lavaş ve soğanla, közde acılı kıyma kebabı.",
          ar: "لحم ضأن مفروم حار على الفحم، مع خبز اللواش والبصل.",
          es: "Cordero picado y picante a la brasa, con lavash y cebolla.",
          ru: "Острый рубленый барашек на углях, с лавашом и луком.",
        },
        price: "380",
        imageUrl: "/demo/adana-kebab.jpg",
        dietaryLabels: [],
        // Shows how sold-out dishes look.
        availability: "sold_out",
      },
      {
        slug: "fries",
        name: {
          en: "Crispy fries",
          tr: "Çıtır patates",
          ar: "بطاطا مقرمشة",
          es: "Patatas crujientes",
          ru: "Хрустящий картофель фри",
        },
        description: {
          en: "Hand-cut, with house seasoning.",
          tr: "Elde kesilmiş, özel baharatla.",
          ar: "مقطّعة يدويًا مع توابل البيت.",
          es: "Cortadas a mano, con nuestro aliño.",
          ru: "Нарезка вручную, с фирменными специями.",
        },
        price: "95",
        imageUrl: "/french-fries.jpg",
        dietaryLabels: ["vegan"],
        availability: "available",
      },
    ],
  },
  {
    slug: "desserts",
    name: {
      en: "Desserts",
      tr: "Tatlılar",
      ar: "الحلويات",
      es: "Postres",
      ru: "Десерты",
    },
    dishes: [
      {
        slug: "lemon-cheesecake",
        name: {
          en: "Lemon cheesecake",
          tr: "Limonlu cheesecake",
          ar: "تشيز كيك بالليمون",
          es: "Tarta de queso con limón",
          ru: "Лимонный чизкейк",
        },
        description: {
          en: "Creamy, fresh and light.",
          tr: "Kremalı, ferah ve hafif.",
          ar: "كريمي ومنعش وخفيف.",
          es: "Cremosa, fresca y ligera.",
          ru: "Нежный, свежий и лёгкий.",
        },
        price: "160",
        imageUrl: "/Limon-cheesecake.jpg",
        dietaryLabels: ["vegetarian"],
        availability: "available",
      },
      {
        slug: "baklava",
        name: {
          en: "Pistachio baklava",
          tr: "Fıstıklı baklava",
          ar: "بقلاوة بالفستق",
          es: "Baklava de pistacho",
          ru: "Пахлава с фисташками",
        },
        description: {
          en: "Thin layers of pastry, pistachios and syrup.",
          tr: "İnce yufka, Antep fıstığı ve şerbet.",
          ar: "رقائق عجين رفيعة وفستق وقطر.",
          es: "Finas capas de masa, pistachos y almíbar.",
          ru: "Тонкие слои теста, фисташки и сироп.",
        },
        price: "150",
        imageUrl: "/demo/baklava.jpg",
        dietaryLabels: ["vegetarian"],
        availability: "available",
      },
    ],
  },
  {
    slug: "drinks",
    name: {
      en: "Drinks",
      tr: "İçecekler",
      ar: "المشروبات",
      es: "Bebidas",
      ru: "Напитки",
    },
    dishes: [
      {
        slug: "turkish-tea",
        name: {
          en: "Turkish tea",
          tr: "Çay",
          ar: "شاي تركي",
          es: "Té turco",
          ru: "Турецкий чай",
        },
        description: {
          en: "Brewed fresh, served in a tulip glass.",
          tr: "Taze demlenmiş, ince belli bardakta.",
          ar: "مُحضّر طازجًا ويُقدَّم في كأس التوليب.",
          es: "Recién hecho, servido en vaso de tulipán.",
          ru: "Свежезаваренный, в стаканчике-тюльпане.",
        },
        price: "25",
        imageUrl: "/demo/turkish-tea.jpg",
        dietaryLabels: ["vegan"],
        availability: "available",
      },
      {
        slug: "cola",
        name: { en: "Cola", tr: "Kola", ar: "كولا", es: "Cola", ru: "Кола" },
        description: {
          en: "Ice-cold, 330 ml.",
          tr: "Buz gibi, 330 ml.",
          ar: "باردة جدًا، 330 مل.",
          es: "Bien fría, 330 ml.",
          ru: "Ледяная, 330 мл.",
        },
        price: "60",
        imageUrl: "/cocacola.jpg",
        dietaryLabels: ["vegan"],
        availability: "available",
      },
    ],
  },
];

/** The demo menu in one language, prices formatted by `formatPrice`. */
export function demoMenuIn(
  lang: MenuLanguage,
  formatPrice: (price: string) => string,
): PublicCategory[] {
  return CATEGORIES.map((category) => ({
    id: category.slug,
    slug: category.slug,
    name: category.name[lang],
    menuItems: category.dishes.map((dish) => ({
      id: dish.slug,
      slug: dish.slug,
      name: dish.name[lang],
      description: dish.description[lang],
      ingredients: null,
      price: dish.price,
      displayPrice: formatPrice(dish.price),
      imageUrl: dish.imageUrl,
      dietaryLabels: dish.dietaryLabels,
      availability: dish.availability,
    })),
  }));
}
