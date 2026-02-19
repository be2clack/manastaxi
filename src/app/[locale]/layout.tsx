import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { locales, type Locale } from "@/i18n/config";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { StructuredData } from "@/components/layout/structured-data";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://manastaxi.kg";

const seoTitles: Record<Locale, string> = {
  ru: "Manas Taxi — Официальное такси аэропорта Манас | Бишкек, Кыргызстан",
  en: "Manas Taxi — Official Manas Airport Taxi Service | Bishkek, Kyrgyzstan",
  ky: "Manas Taxi — Манас аэропортунун расмий такси кызматы | Бишкек",
  zh: "Manas Taxi — 玛纳斯机场官方出租车服务 | 比什凯克，吉尔吉斯斯坦",
  hi: "Manas Taxi — मानस हवाई अड्डा आधिकारिक टैक्सी सेवा | बिश्केक",
};

const seoDescriptions: Record<Locale, string> = {
  ru: "Официальный сервис такси аэропорта Манас. Трансфер из аэропорта Бишкек в любую точку Кыргызстана. Фиксированные цены, встреча с табличкой, отслеживание рейсов. 24/7.",
  en: "Official taxi service at Manas Airport. Airport transfers from Bishkek to anywhere in Kyrgyzstan. Fixed prices, meet & greet, flight tracking. Available 24/7.",
  ky: "Манас аэропортунун расмий такси кызматы. Бишкектен Кыргызстандын каалаган жерине трансфер. Белгиленген баалар, тосуп алуу кызматы. Күнү-түнү.",
  zh: "玛纳斯机场官方出租车服务。从比什凯克机场到吉尔吉斯斯坦任何地方的接送服务。固定价格、接机服务、航班跟踪。全天候服务。",
  hi: "मानस हवाई अड्डे की आधिकारिक टैक्सी सेवा। बिश्केक हवाई अड्डे से किर्गिस्तान में कहीं भी ट्रांसफर। निश्चित मूल्य, मिलने की सेवा। 24/7।",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;

  return {
    title: {
      default: seoTitles[loc] || seoTitles.en,
      template: `%s | Manas Taxi`,
    },
    description: seoDescriptions[loc] || seoDescriptions.en,
    keywords: [
      "manas taxi",
      "airport taxi bishkek",
      "kyrgyzstan taxi",
      "manas airport transfer",
      "bishkek airport",
      "такси аэропорт манас",
      "трансфер бишкек",
    ],
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}`])
      ),
    },
    openGraph: {
      type: "website",
      locale: locale === "zh" ? "zh_CN" : locale === "hi" ? "hi_IN" : locale,
      url: `${BASE_URL}/${locale}`,
      siteName: "Manas Taxi",
      title: seoTitles[loc] || seoTitles.en,
      description: seoDescriptions[loc] || seoDescriptions.en,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitles[loc] || seoTitles.en,
      description: seoDescriptions[loc] || seoDescriptions.en,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <WhatsAppButton />
          <Toaster richColors position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
