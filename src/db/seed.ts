import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashSync } from "bcryptjs";
import {
  users,
  routes,
  tours,
  services,
  settings,
  seoMeta,
} from "./schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log("Seeding database...");

  // ============ ADMIN USER ============
  await db.insert(users).values({
    name: "Admin",
    email: "admin@manastaxi.kg",
    password: hashSync("admin123", 10),
    role: "admin",
  });
  console.log("Admin user created");

  // ============ ROUTES ============
  await db.insert(routes).values([
    // Bishkek city zones
    { slug: "bishkek-center", fromLocation: "Аэропорт Манас", toLocation: "Бишкек центр", distanceKm: 25, durationMin: 30, priceSom: 800, priceUsd: 10, isPopular: true, sortOrder: 1 },
    { slug: "bishkek-south", fromLocation: "Аэропорт Манас", toLocation: "Бишкек южная часть", distanceKm: 30, durationMin: 40, priceSom: 1000, priceUsd: 12, isPopular: true, sortOrder: 2 },
    { slug: "bishkek-north", fromLocation: "Аэропорт Манас", toLocation: "Бишкек северная часть", distanceKm: 20, durationMin: 25, priceSom: 700, priceUsd: 8, isPopular: false, sortOrder: 3 },
    { slug: "bishkek-west", fromLocation: "Аэропорт Манас", toLocation: "Бишкек западная часть", distanceKm: 18, durationMin: 22, priceSom: 650, priceUsd: 8, isPopular: false, sortOrder: 4 },
    { slug: "bishkek-east", fromLocation: "Аэропорт Манас", toLocation: "Бишкек восточная часть", distanceKm: 35, durationMin: 45, priceSom: 1200, priceUsd: 14, isPopular: false, sortOrder: 5 },

    // Chuy region
    { slug: "tokmok", fromLocation: "Аэропорт Манас", toLocation: "Токмок", distanceKm: 70, durationMin: 60, priceSom: 2000, priceUsd: 24, isPopular: false, sortOrder: 10 },
    { slug: "kara-balta", fromLocation: "Аэропорт Манас", toLocation: "Кара-Балта", distanceKm: 40, durationMin: 35, priceSom: 1200, priceUsd: 14, isPopular: false, sortOrder: 11 },
    { slug: "kemin", fromLocation: "Аэропорт Манас", toLocation: "Кемин", distanceKm: 90, durationMin: 80, priceSom: 2500, priceUsd: 30, isPopular: false, sortOrder: 12 },

    // Issyk-Kul region
    { slug: "balykchy", fromLocation: "Аэропорт Манас", toLocation: "Балыкчы", distanceKm: 170, durationMin: 150, priceSom: 4500, priceUsd: 53, isPopular: false, sortOrder: 20 },
    { slug: "cholpon-ata", fromLocation: "Аэропорт Манас", toLocation: "Чолпон-Ата", distanceKm: 240, durationMin: 210, priceSom: 6000, priceUsd: 71, isPopular: true, sortOrder: 21 },
    { slug: "bosteri", fromLocation: "Аэропорт Манас", toLocation: "Бостери", distanceKm: 250, durationMin: 220, priceSom: 6500, priceUsd: 76, isPopular: true, sortOrder: 22 },
    { slug: "karakol", fromLocation: "Аэропорт Манас", toLocation: "Каракол", distanceKm: 390, durationMin: 330, priceSom: 9000, priceUsd: 106, isPopular: true, sortOrder: 23 },
    { slug: "tamga", fromLocation: "Аэропорт Манас", toLocation: "Тамга", distanceKm: 340, durationMin: 300, priceSom: 8000, priceUsd: 94, isPopular: false, sortOrder: 24 },
    { slug: "barskoon", fromLocation: "Аэропорт Манас", toLocation: "Барскоон", distanceKm: 330, durationMin: 290, priceSom: 7500, priceUsd: 88, isPopular: false, sortOrder: 25 },

    // Naryn region
    { slug: "naryn", fromLocation: "Аэропорт Манас", toLocation: "Нарын", distanceKm: 320, durationMin: 300, priceSom: 8000, priceUsd: 94, isPopular: false, sortOrder: 30 },
    { slug: "tash-rabat", fromLocation: "Аэропорт Манас", toLocation: "Таш-Рабат", distanceKm: 450, durationMin: 420, priceSom: 12000, priceUsd: 141, isPopular: false, sortOrder: 31 },
    { slug: "son-kul", fromLocation: "Аэропорт Манас", toLocation: "Сон-Куль", distanceKm: 350, durationMin: 360, priceSom: 10000, priceUsd: 118, isPopular: true, sortOrder: 32 },

    // Jalal-Abad region
    { slug: "jalal-abad", fromLocation: "Аэропорт Манас", toLocation: "Джалал-Абад", distanceKm: 600, durationMin: 540, priceSom: 15000, priceUsd: 176, isPopular: false, sortOrder: 40 },
    { slug: "arslanbob", fromLocation: "Аэропорт Манас", toLocation: "Арсланбоб", distanceKm: 650, durationMin: 600, priceSom: 16000, priceUsd: 188, isPopular: false, sortOrder: 41 },

    // Osh region
    { slug: "osh", fromLocation: "Аэропорт Манас", toLocation: "Ош", distanceKm: 680, durationMin: 620, priceSom: 17000, priceUsd: 200, isPopular: true, sortOrder: 50 },
    { slug: "uzgen", fromLocation: "Аэропорт Манас", toLocation: "Узген", distanceKm: 720, durationMin: 660, priceSom: 18000, priceUsd: 212, isPopular: false, sortOrder: 51 },

    // Batken region
    { slug: "batken", fromLocation: "Аэропорт Манас", toLocation: "Баткен", distanceKm: 850, durationMin: 780, priceSom: 22000, priceUsd: 259, isPopular: false, sortOrder: 60 },

    // Talas region
    { slug: "talas", fromLocation: "Аэропорт Манас", toLocation: "Талас", distanceKm: 300, durationMin: 280, priceSom: 7500, priceUsd: 88, isPopular: false, sortOrder: 70 },

    // Popular tourist spots
    { slug: "ala-archa", fromLocation: "Аэропорт Манас", toLocation: "Ала-Арча (нац. парк)", distanceKm: 55, durationMin: 50, priceSom: 1500, priceUsd: 18, isPopular: true, sortOrder: 80 },
    { slug: "burana", fromLocation: "Аэропорт Манас", toLocation: "Башня Бурана", distanceKm: 75, durationMin: 65, priceSom: 2000, priceUsd: 24, isPopular: false, sortOrder: 81 },
    { slug: "suusamyr", fromLocation: "Аэропорт Манас", toLocation: "Суусамыр", distanceKm: 180, durationMin: 160, priceSom: 5000, priceUsd: 59, isPopular: false, sortOrder: 82 },
    { slug: "too-ashuu", fromLocation: "Аэропорт Манас", toLocation: "Перевал Тоо-Ашуу", distanceKm: 135, durationMin: 120, priceSom: 3500, priceUsd: 41, isPopular: false, sortOrder: 83 },
    { slug: "issyk-ata", fromLocation: "Аэропорт Манас", toLocation: "Иссык-Ата (курорт)", distanceKm: 100, durationMin: 90, priceSom: 3000, priceUsd: 35, isPopular: false, sortOrder: 84 },
    { slug: "altyn-arashan", fromLocation: "Аэропорт Манас", toLocation: "Алтын-Арашан", distanceKm: 400, durationMin: 360, priceSom: 10000, priceUsd: 118, isPopular: false, sortOrder: 85 },
    { slug: "jeti-oguz", fromLocation: "Аэропорт Манас", toLocation: "Джети-Огуз", distanceKm: 380, durationMin: 340, priceSom: 9500, priceUsd: 112, isPopular: false, sortOrder: 86 },
  ]);
  console.log("Routes seeded");

  // ============ TOURS ============
  await db.insert(tours).values([
    {
      slug: "issyk-kul-tour",
      durationDays: 3,
      priceUsd: 350,
      priceSom: 30000,
      maxGroup: 8,
      sortOrder: 1,
      imageUrl: "/images/tours/issyk-kul.jpg",
    },
    {
      slug: "son-kul-tour",
      durationDays: 2,
      priceUsd: 280,
      priceSom: 24000,
      maxGroup: 6,
      sortOrder: 2,
      imageUrl: "/images/tours/son-kul.jpg",
    },
    {
      slug: "ala-archa-day-tour",
      durationDays: 1,
      priceUsd: 80,
      priceSom: 7000,
      maxGroup: 10,
      sortOrder: 3,
      imageUrl: "/images/tours/ala-archa.jpg",
    },
    {
      slug: "silk-road-tour",
      durationDays: 7,
      priceUsd: 850,
      priceSom: 72000,
      maxGroup: 8,
      sortOrder: 4,
      imageUrl: "/images/tours/silk-road.jpg",
    },
    {
      slug: "osh-bazaar-tour",
      durationDays: 4,
      priceUsd: 500,
      priceSom: 42000,
      maxGroup: 6,
      sortOrder: 5,
      imageUrl: "/images/tours/osh.jpg",
    },
    {
      slug: "horse-trek-tour",
      durationDays: 5,
      priceUsd: 600,
      priceSom: 51000,
      maxGroup: 6,
      sortOrder: 6,
      imageUrl: "/images/tours/horse-trek.jpg",
    },
  ]);
  console.log("Tours seeded");

  // ============ SERVICES ============
  await db.insert(services).values([
    { slug: "airport-transfer", priceUsd: "10.00", priceSom: "800.00", iconName: "Car", sortOrder: 1 },
    { slug: "meet-greet", priceUsd: "15.00", priceSom: "1300.00", iconName: "UserCheck", sortOrder: 2 },
    { slug: "vip-transfer", priceUsd: "35.00", priceSom: "3000.00", iconName: "Crown", sortOrder: 3 },
    { slug: "hotel-booking", priceUsd: "0.00", priceSom: "0.00", iconName: "Hotel", sortOrder: 4 },
    { slug: "city-tour", priceUsd: "50.00", priceSom: "4200.00", iconName: "MapPin", sortOrder: 5 },
    { slug: "business-transfer", priceUsd: "45.00", priceSom: "3800.00", iconName: "Briefcase", sortOrder: 6 },
  ]);
  console.log("Services seeded");

  // ============ SETTINGS ============
  await db.insert(settings).values([
    { key: "phone_primary", value: "+996 550 693 000" },
    { key: "phone_secondary", value: "+996 550 693 000" },
    { key: "email", value: "info@manastaxi.kg" },
    { key: "address_ru", value: "Аэропорт Манас, Бишкек, Кыргызстан" },
    { key: "address_en", value: "Manas Airport, Bishkek, Kyrgyzstan" },
    { key: "whatsapp", value: "+996550693000" },
    { key: "telegram", value: "+996550693000" },
    { key: "viber", value: "+996550693000" },
    { key: "wechat", value: "manastaxi" },
    { key: "instagram", value: "https://instagram.com/manastaxi" },
    { key: "facebook", value: "https://facebook.com/manastaxi" },
    { key: "tiktok", value: "https://tiktok.com/@manastaxi" },
    { key: "working_hours", value: "24/7" },
    { key: "currency_rate", value: "85" },
  ]);
  console.log("Settings seeded");

  // ============ SEO META ============
  const seoData = [
    // Home page
    { pageSlug: "home", locale: "ru", title: "Manas Taxi — Официальное такси аэропорта Манас | Бишкек, Кыргызстан", description: "Официальный сервис такси аэропорта Манас. Трансфер из аэропорта Бишкек в любую точку Кыргызстана. Фиксированные цены, встреча с табличкой, отслеживание рейсов. Круглосуточно.", keywords: "такси аэропорт манас, трансфер бишкек, такси бишкек аэропорт, такси кыргызстан, manas taxi" },
    { pageSlug: "home", locale: "en", title: "Manas Taxi — Official Manas Airport Taxi Service | Bishkek, Kyrgyzstan", description: "Official taxi service at Manas Airport. Airport transfers from Bishkek to anywhere in Kyrgyzstan. Fixed prices, meet & greet, flight tracking. Available 24/7.", keywords: "manas airport taxi, bishkek airport transfer, kyrgyzstan taxi service, airport taxi bishkek" },
    { pageSlug: "home", locale: "ky", title: "Manas Taxi — Манас аэропортунун расмий такси кызматы | Бишкек, Кыргызстан", description: "Манас аэропортунун расмий такси кызматы. Бишкектен Кыргызстандын каалаган жерине трансфер. Белгиленген баалар, тосуп алуу кызматы, учуулерду көзөмөлдөө. Күнү-түнү иштейт.", keywords: "манас аэропорт такси, бишкек трансфер, кыргызстан такси, манас такси" },
    { pageSlug: "home", locale: "zh", title: "Manas Taxi — 玛纳斯机场官方出租车服务 | 比什凯克，吉尔吉斯斯坦", description: "玛纳斯机场官方出租车服务。从比什凯克机场到吉尔吉斯斯坦任何地方的接送服务。固定价格、接机服务、航班跟踪。全天候服务。", keywords: "玛纳斯机场出租车, 比什凯克机场接送, 吉尔吉斯斯坦出租车, 机场出租车" },
    { pageSlug: "home", locale: "hi", title: "Manas Taxi — मानस हवाई अड्डा आधिकारिक टैक्सी सेवा | बिश्केक, किर्गिस्तान", description: "मानस हवाई अड्डे की आधिकारिक टैक्सी सेवा। बिश्केक हवाई अड्डे से किर्गिस्तान में कहीं भी ट्रांसफर। निश्चित मूल्य, मिलने की सेवा, उड़ान ट्रैकिंग। 24/7 उपलब्ध।", keywords: "मानस हवाई अड्डा टैक्सी, बिश्केक एयरपोर्ट ट्रांसफर, किर्गिस्तान टैक्सी" },

    // Routes page
    { pageSlug: "routes", locale: "ru", title: "Маршруты и цены — Такси из аэропорта Манас | Manas Taxi", description: "Все маршруты такси из аэропорта Манас. Цены на трансфер в Бишкек, Иссык-Куль, Каракол, Ош, Нарын и другие города Кыргызстана. Фиксированные тарифы.", keywords: "маршруты такси манас, цены такси бишкек, трансфер иссык-куль, такси каракол" },
    { pageSlug: "routes", locale: "en", title: "Routes & Prices — Taxi from Manas Airport | Manas Taxi", description: "All taxi routes from Manas Airport. Transfer prices to Bishkek, Issyk-Kul, Karakol, Osh, Naryn and other cities in Kyrgyzstan. Fixed rates.", keywords: "manas airport taxi routes, bishkek taxi prices, issyk-kul transfer, karakol taxi" },
    { pageSlug: "routes", locale: "ky", title: "Маршруттар жана баалар — Манас аэропортунан такси | Manas Taxi", description: "Манас аэропортунан бардык такси маршруттары. Бишкек, Ысык-Көл, Каракол, Ош, Нарын жана Кыргызстандын башка шаарларына трансфер баалары.", keywords: "манас аэропорт маршруттар, бишкек такси баалар, ысык-көл трансфер" },
    { pageSlug: "routes", locale: "zh", title: "路线和价格 — 玛纳斯机场出租车 | Manas Taxi", description: "玛纳斯机场所有出租车路线。到比什凯克、伊塞克湖、卡拉科尔、奥什、纳伦等城市的接送价格。固定费率。", keywords: "玛纳斯机场出租车路线, 比什凯克出租车价格" },
    { pageSlug: "routes", locale: "hi", title: "मार्ग और कीमतें — मानस हवाई अड्डे से टैक्सी | Manas Taxi", description: "मानस हवाई अड्डे से सभी टैक्सी मार्ग। बिश्केक, इस्सिक-कुल, कारकोल, ओश और किर्गिस्तान के अन्य शहरों में ट्रांसफर की कीमतें।", keywords: "मानस हवाई अड्डा टैक्सी मार्ग, बिश्केक टैक्सी कीमतें" },

    // Booking page
    { pageSlug: "booking", locale: "ru", title: "Забронировать такси — Аэропорт Манас | Manas Taxi", description: "Забронируйте такси из аэропорта Манас онлайн. Быстрая заявка, подтверждение за минуту. Встреча в аэропорту с табличкой.", keywords: "забронировать такси манас, заказать трансфер бишкек, бронирование такси аэропорт" },
    { pageSlug: "booking", locale: "en", title: "Book a Taxi — Manas Airport | Manas Taxi", description: "Book a taxi from Manas Airport online. Quick booking, confirmation within minutes. Airport meet & greet service available.", keywords: "book taxi manas airport, airport transfer booking bishkek" },
    { pageSlug: "booking", locale: "ky", title: "Такси буйрутмалоо — Манас аэропорту | Manas Taxi", description: "Манас аэропортунан онлайн такси буйрутмалаңыз. Тез буйрутма, мүнөттөрдө ырастоо. Аэропортто тосуп алуу кызматы.", keywords: "манас аэропорт такси буйрутма, бишкек трансфер буйрутмалоо" },
    { pageSlug: "booking", locale: "zh", title: "预订出租车 — 玛纳斯机场 | Manas Taxi", description: "在线预订玛纳斯机场出租车。快速预订，几分钟内确认。提供机场接机服务。", keywords: "预订玛纳斯机场出租车, 比什凯克机场接送预订" },
    { pageSlug: "booking", locale: "hi", title: "टैक्सी बुक करें — मानस हवाई अड्डा | Manas Taxi", description: "मानस हवाई अड्डे से ऑनलाइन टैक्सी बुक करें। त्वरित बुकिंग, मिनटों में पुष्टि।", keywords: "मानस हवाई अड्डा टैक्सी बुक करें" },

    // Flights page
    { pageSlug: "flights", locale: "ru", title: "Отслеживание рейсов — Аэропорт Манас | Manas Taxi", description: "Отслеживайте рейсы аэропорта Манас в реальном времени. Прилёты и вылеты, статус рейсов. Закажите такси к прибытию вашего рейса.", keywords: "рейсы аэропорт манас, табло прилётов бишкек, отслеживание рейсов" },
    { pageSlug: "flights", locale: "en", title: "Flight Tracking — Manas Airport | Manas Taxi", description: "Track Manas Airport flights in real-time. Arrivals and departures, flight status. Book a taxi for your flight arrival.", keywords: "manas airport flights, bishkek arrivals, flight tracking" },
    { pageSlug: "flights", locale: "ky", title: "Учууларды көзөмөлдөө — Манас аэропорту | Manas Taxi", description: "Манас аэропортунун учууларын реалдуу убакытта көзөмөлдөңүз. Келүүлөр жана учуулар, учуу статусу.", keywords: "манас аэропорт учуулар, бишкек келүүлөр" },
    { pageSlug: "flights", locale: "zh", title: "航班跟踪 — 玛纳斯机场 | Manas Taxi", description: "实时跟踪玛纳斯机场航班。到达和出发，航班状态。为您的航班到达预订出租车。", keywords: "玛纳斯机场航班, 比什凯克到达" },
    { pageSlug: "flights", locale: "hi", title: "उड़ान ट्रैकिंग — मानस हवाई अड्डा | Manas Taxi", description: "मानस हवाई अड्डे की उड़ानों को रीयल-टाइम में ट्रैक करें। आगमन और प्रस्थान, उड़ान स्थिति।", keywords: "मानस हवाई अड्डा उड़ानें" },

    // Tours page
    { pageSlug: "tours", locale: "ru", title: "Туры по Кыргызстану — Экскурсии из Бишкека | Manas Taxi", description: "Незабываемые туры по Кыргызстану: Иссык-Куль, Сон-Куль, Ала-Арча, Шёлковый путь. Комфортный транспорт, опытные водители. Бронируйте онлайн.", keywords: "туры кыргызстан, экскурсии бишкек, тур иссык-куль, тур сон-куль, кыргызстан туризм" },
    { pageSlug: "tours", locale: "en", title: "Tours in Kyrgyzstan — Excursions from Bishkek | Manas Taxi", description: "Unforgettable tours in Kyrgyzstan: Issyk-Kul, Son-Kul, Ala-Archa, Silk Road. Comfortable transport, experienced drivers. Book online.", keywords: "kyrgyzstan tours, bishkek excursions, issyk-kul tour, son-kul tour, kyrgyzstan tourism" },
    { pageSlug: "tours", locale: "ky", title: "Кыргызстан боюнча турлар — Бишкектен экскурсиялар | Manas Taxi", description: "Кыргызстан боюнча унутулгус турлар: Ысык-Көл, Соң-Көл, Ала-Арча, Жибек Жолу. Ыңгайлуу транспорт, тажрыйбалуу айдоочулар.", keywords: "кыргызстан турлар, бишкек экскурсиялар" },
    { pageSlug: "tours", locale: "zh", title: "吉尔吉斯斯坦旅游 — 从比什凯克出发的旅行 | Manas Taxi", description: "难忘的吉尔吉斯斯坦之旅：伊塞克湖、松库尔、阿拉阿查、丝绸之路。舒适的交通，经验丰富的司机。", keywords: "吉尔吉斯斯坦旅游, 比什凯克旅行" },
    { pageSlug: "tours", locale: "hi", title: "किर्गिस्तान में पर्यटन — बिश्केक से भ्रमण | Manas Taxi", description: "किर्गिस्तान में अविस्मरणीय यात्राएं: इस्सिक-कुल, सोन-कुल, अला-अर्चा, सिल्क रोड। आरामदायक परिवहन।", keywords: "किर्गिस्तान पर्यटन, बिश्केक भ्रमण" },

    // Services page
    { pageSlug: "services", locale: "ru", title: "Услуги — Трансфер, VIP, встреча с табличкой | Manas Taxi", description: "Полный спектр услуг: аэропортный трансфер, VIP-обслуживание, встреча с табличкой, бронирование отелей, экскурсии по городу. Manas Taxi — ваш надёжный партнёр.", keywords: "услуги такси манас, vip трансфер бишкек, встреча с табличкой аэропорт" },
    { pageSlug: "services", locale: "en", title: "Services — Transfer, VIP, Meet & Greet | Manas Taxi", description: "Full range of services: airport transfer, VIP service, meet & greet, hotel booking, city tours. Manas Taxi — your reliable partner.", keywords: "manas taxi services, vip transfer bishkek, meet and greet airport" },
    { pageSlug: "services", locale: "ky", title: "Кызматтар — Трансфер, VIP, тосуп алуу | Manas Taxi", description: "Толук кызмат спектри: аэропорт трансфер, VIP тейлөө, тосуп алуу кызматы, мейманкана бронирование.", keywords: "манас такси кызматтар, vip трансфер бишкек" },
    { pageSlug: "services", locale: "zh", title: "服务 — 接送、VIP、接机 | Manas Taxi", description: "全方位服务：机场接送、VIP服务、接机举牌、酒店预订、城市游览。Manas Taxi — 您可靠的合作伙伴。", keywords: "玛纳斯出租车服务, VIP接送比什凯克" },
    { pageSlug: "services", locale: "hi", title: "सेवाएं — ट्रांसफर, VIP, मिलने की सेवा | Manas Taxi", description: "सेवाओं की पूरी श्रृंखला: एयरपोर्ट ट्रांसफर, VIP सेवा, मिलने की सेवा, होटल बुकिंग, शहर भ्रमण।", keywords: "मानस टैक्सी सेवाएं, VIP ट्रांसफर बिश्केक" },

    // Contacts page
    { pageSlug: "contacts", locale: "ru", title: "Контакты — Свяжитесь с нами | Manas Taxi", description: "Свяжитесь с Manas Taxi: телефон, WhatsApp, Telegram, email. Мы работаем круглосуточно. Офис в аэропорту Манас, Бишкек.", keywords: "контакты manas taxi, телефон такси манас, связаться такси бишкек" },
    { pageSlug: "contacts", locale: "en", title: "Contacts — Get in Touch | Manas Taxi", description: "Contact Manas Taxi: phone, WhatsApp, Telegram, email. We work 24/7. Office at Manas Airport, Bishkek.", keywords: "contact manas taxi, manas taxi phone, bishkek taxi contact" },
    { pageSlug: "contacts", locale: "ky", title: "Байланыш — Биз менен байланышыңыз | Manas Taxi", description: "Manas Taxi менен байланышыңыз: телефон, WhatsApp, Telegram, email. Биз күнү-түнү иштейбиз.", keywords: "manas taxi байланыш, манас такси телефон" },
    { pageSlug: "contacts", locale: "zh", title: "联系方式 — 联系我们 | Manas Taxi", description: "联系Manas Taxi：电话、WhatsApp、Telegram、电子邮件。我们全天候服务。玛纳斯机场办公室。", keywords: "联系玛纳斯出租车, 玛纳斯出租车电话" },
    { pageSlug: "contacts", locale: "hi", title: "संपर्क — हमसे संपर्क करें | Manas Taxi", description: "Manas Taxi से संपर्क करें: फोन, WhatsApp, Telegram, ईमेल। हम 24/7 काम करते हैं।", keywords: "manas taxi संपर्क, मानस टैक्सी फोन" },
  ];

  await db.insert(seoMeta).values(seoData);
  console.log("SEO meta seeded");

  console.log("Database seeding complete!");
}

seed().catch(console.error);
