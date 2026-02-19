export const locales = ["ru", "en", "ky", "zh", "hi", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

export const localeNames: Record<Locale, string> = {
  ru: "Русский",
  en: "English",
  ky: "Кыргызча",
  zh: "中文",
  hi: "हिन्दी",
  ar: "العربية",
};

export const localeFlags: Record<Locale, string> = {
  ru: "🇷🇺",
  en: "🇬🇧",
  ky: "🇰🇬",
  zh: "🇨🇳",
  hi: "🇮🇳",
  ar: "🇸🇦",
};

export const rtlLocales: Locale[] = ["ar"];
