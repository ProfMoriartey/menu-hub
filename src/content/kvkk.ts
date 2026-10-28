// src/content/kvkk.ts
// The privacy notice (KVKK aydınlatma metni, Law No. 6698, Article 10) shown
// at /kvkk. Turkish is the binding text; the English one is a translation
// for other visitors. It describes what this app actually does: keep both
// in step with each other and with the code (services used, data stored).
// Have a lawyer review it before going live.

export interface NoticeSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  // After the list.
  note?: string;
}

export interface Notice {
  title: string;
  updated: string;
  intro: string;
  sections: NoticeSection[];
}

// The day the text last changed (YYYY-MM-DD).
export const NOTICE_UPDATED = "2026-10-28";

export function kvkkNotice(
  language: "tr" | "en",
  controller: { name: string; address: string },
  email: string,
): Notice {
  const name = controller.name || "Menupedia";
  const address = controller.address;
  if (language === "tr") {
    return {
      title: "KVKK Aydınlatma Metni",
      updated: "Son güncelleme",
      intro: `Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Menupedia web sitesini ve hizmetlerini kullanırken kişisel verilerinizin nasıl işlendiği hakkında sizi bilgilendirmek için hazırlanmıştır.`,
      sections: [
        {
          heading: "1. Veri sorumlusu",
          paragraphs: [
            `Kişisel verileriniz, veri sorumlusu sıfatıyla ${name} tarafından işlenmektedir.${address ? ` Adres: ${address}.` : ""} İletişim: ${email}.`,
          ],
        },
        {
          heading: "2. İşlenen kişisel veriler",
          list: [
            "Kimlik ve iletişim: ad, e-posta adresi, telefon numarası.",
            "Hesap: giriş bilgileri ve oturum kayıtları (kimlik doğrulama hizmet sağlayıcımız tarafından tutulur; şifreniz bize iletilmez).",
            "İşletme bilgileri: restoran adı, adresi, şubeleri, çalışma saatleri, sosyal medya ve teslimat bağlantıları, yüklediğiniz logo ve menü görselleri.",
            "Ödeme kayıtları: plan, tutar, tarih ve ödeme yöntemi. Kart bilgileri tarafımızca alınmaz ve saklanmaz.",
            "İşlem güvenliği: IP adresi, tarayıcı bilgisi ve sunucu kayıtları.",
          ],
          note: "Menüleri görüntüleyen misafirlerden kişisel veri toplanmaz. QR kod okutmaları yalnızca günlük sayı olarak tutulur. Size yakın menüleri göstermek için ülkeniz IP adresinizden o anlık tahmin edilir ve saklanmaz.",
        },
        {
          heading: "3. İşleme amaçları",
          list: [
            "Hesabınızı oluşturmak ve hizmeti sunmak (menü oluşturma, yayınlama, paylaşma).",
            "Plan ve ödeme süreçlerini yürütmek, sizinle ödeme ve destek için iletişime geçmek.",
            "Hizmetin güvenliğini sağlamak ve kötüye kullanımı önlemek.",
            "Yasal yükümlülükleri yerine getirmek.",
          ],
        },
        {
          heading: "4. Hukuki sebepler",
          paragraphs: [
            "Kişisel verileriniz KVKK'nın 5. maddesinin 2. fıkrasındaki şu sebeplere dayanılarak işlenir: bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (c), hukuki yükümlülüğün yerine getirilmesi (ç) ve temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatimiz (f). Bu sebeplerin dışında kalan durumlarda açık rızanıza başvurulur.",
          ],
        },
        {
          heading: "5. Aktarım",
          paragraphs: [
            "Kişisel verileriniz, hizmetin sunulması için kullandığımız hizmet sağlayıcılarına aktarılabilir: kimlik doğrulama (Clerk), dosya depolama (UploadThing), barındırma ve veritabanı hizmet sağlayıcılarımız. Bu sağlayıcıların bir kısmının sunucuları yurt dışındadır; yurt dışına aktarım KVKK'nın 9. maddesine uygun olarak yapılır.",
            "Kişisel verileriniz, kanunen yetkili kamu kurum ve kuruluşlarına, talep halinde ve mevzuatın gerektirdiği ölçüde aktarılabilir. Verileriniz satılmaz ve reklam amacıyla paylaşılmaz.",
          ],
        },
        {
          heading: "6. Toplama yöntemi",
          paragraphs: [
            "Kişisel verileriniz; web sitesindeki formlar, hesap oluşturma ve giriş işlemleri, yüklediğiniz içerikler ve çerezler aracılığıyla elektronik ortamda toplanır.",
          ],
        },
        {
          heading: "7. Çerezler",
          paragraphs: [
            "Oturumunuzu açık tutmak için zorunlu çerezler kullanılır. Tema ve dil gibi tercihleriniz tarayıcınızda saklanır. Reklam veya izleme çerezi kullanılmaz.",
          ],
        },
        {
          heading: "8. Saklama süresi",
          paragraphs: [
            "Kişisel verileriniz hesabınız açık olduğu sürece ve ilgili mevzuatta öngörülen süreler boyunca (örneğin ödeme kayıtları için vergi mevzuatındaki süreler) saklanır. Bu süreler sona erdiğinde silinir, yok edilir veya anonim hâle getirilir.",
          ],
        },
        {
          heading: "9. Haklarınız",
          paragraphs: ["KVKK'nın 11. maddesi uyarınca veri sorumlusuna başvurarak:"],
          list: [
            "Kişisel verilerinizin işlenip işlenmediğini öğrenme,",
            "İşlenmişse buna ilişkin bilgi talep etme,",
            "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,",
            "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,",
            "Eksik veya yanlış işlenmişse düzeltilmesini isteme,",
            "KVKK'nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,",
            "Düzeltme, silme veya yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme,",
            "Münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme,",
            "Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.",
          ],
        },
        {
          heading: "10. Başvuru",
          paragraphs: [
            `Haklarınıza ilişkin taleplerinizi ${email} adresine e-posta ile iletebilirsiniz. Başvurunuz, niteliğine göre en geç 30 gün içinde ücretsiz olarak sonuçlandırılır; işlemin ayrıca bir maliyet gerektirmesi hâlinde Kişisel Verileri Koruma Kurulunca belirlenen tarifedeki ücret alınabilir.`,
          ],
        },
      ],
    };
  }
  return {
    title: "Privacy notice (KVKK)",
    updated: "Last updated",
    intro: `This notice explains, as required by Turkey's Personal Data Protection Law No. 6698 ("KVKK"), how your personal data is processed when you use the Menupedia website and services. The Turkish version is the binding one.`,
    sections: [
      {
        heading: "1. Data controller",
        paragraphs: [
          `Your personal data is processed by ${name}, as the data controller.${address ? ` Address: ${address}.` : ""} Contact: ${email}.`,
        ],
      },
      {
        heading: "2. Personal data we process",
        list: [
          "Identity and contact: name, email address, phone number.",
          "Account: sign-in details and session records (kept by our sign-in provider; your password is never sent to us).",
          "Business details: restaurant name, address, branches, opening hours, social media and delivery links, and the logo and menu photos you upload.",
          "Payment records: plan, amount, date and payment method. We don't receive or store card details.",
          "Security: IP address, browser details and server logs.",
        ],
        note: "We don't collect personal data from guests who view menus. QR code scans are kept only as a daily count. To show menus near you, your country is estimated from your IP address at that moment and isn't stored.",
      },
      {
        heading: "3. Why we process it",
        list: [
          "To create your account and provide the service (building, publishing and sharing menus).",
          "To run plans and payments, and to contact you about payment and support.",
          "To keep the service secure and prevent misuse.",
          "To meet our legal obligations.",
        ],
      },
      {
        heading: "4. Legal grounds",
        paragraphs: [
          "Your personal data is processed on these grounds in Article 5(2) of the KVKK: it is directly needed to set up or perform a contract (c), to meet a legal obligation (ç), and for our legitimate interests, provided this doesn't harm your fundamental rights and freedoms (f). Where none of these applies, we ask for your explicit consent.",
        ],
      },
      {
        heading: "5. Who we share it with",
        paragraphs: [
          "Your personal data may be shared with the service providers we use to run the service: sign-in (Clerk), file storage (UploadThing), and our hosting and database providers. Some of them have servers outside Turkey; such transfers abroad follow Article 9 of the KVKK.",
          "It may be shared with public authorities that are legally entitled to it, on request and as far as the law requires. Your data is never sold or shared for advertising.",
        ],
      },
      {
        heading: "6. How we collect it",
        paragraphs: [
          "Electronically: through the website's forms, creating an account and signing in, the content you upload, and cookies.",
        ],
      },
      {
        heading: "7. Cookies",
        paragraphs: [
          "Essential cookies keep you signed in. Preferences such as theme and language are stored in your browser. No advertising or tracking cookies are used.",
        ],
      },
      {
        heading: "8. How long we keep it",
        paragraphs: [
          "Your personal data is kept while your account is open and for the periods the law requires (for example, tax law's periods for payment records). After that, it is deleted, destroyed or anonymised.",
        ],
      },
      {
        heading: "9. Your rights",
        paragraphs: ["Under Article 11 of the KVKK, you can ask the data controller to:"],
        list: [
          "tell you whether your personal data is processed;",
          "give you information about it if so;",
          "tell you why it is processed and whether it's used for that purpose;",
          "tell you which third parties, in Turkey or abroad, it is shared with;",
          "correct it if it is incomplete or wrong;",
          "delete or destroy it, under the conditions in Article 7 of the KVKK;",
          "tell the third parties it was shared with about a correction or deletion;",
          "object to a decision against you that results only from automated analysis;",
          "compensate you for damage caused by unlawful processing.",
        ],
      },
      {
        heading: "10. How to apply",
        paragraphs: [
          `Send your request by email to ${email}. It will be answered free of charge within 30 days at the latest; if it involves an additional cost, a fee from the Personal Data Protection Board's tariff may be charged.`,
        ],
      },
    ],
  };
}
