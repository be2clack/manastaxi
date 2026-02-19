import { MetadataRoute } from "next";
import { locales } from "@/i18n/config";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://manastaxi.kg";

const pages = [
  "",
  "/routes",
  "/booking",
  "/flights",
  "/tours",
  "/services",
  "/contacts",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}${page}`])
          ),
        },
      });
    }
  }

  return entries;
}
