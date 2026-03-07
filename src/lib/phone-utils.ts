const COUNTRY_CODES: Record<string, { code: string; name: string }> = {
  "996": { code: "KG", name: "Kyrgyzstan" },
  "998": { code: "UZ", name: "Uzbekistan" },
  "993": { code: "TM", name: "Turkmenistan" },
  "992": { code: "TJ", name: "Tajikistan" },
  "86": { code: "CN", name: "China" },
  "82": { code: "KR", name: "South Korea" },
  "81": { code: "JP", name: "Japan" },
  "91": { code: "IN", name: "India" },
  "90": { code: "TR", name: "Turkey" },
  "49": { code: "DE", name: "Germany" },
  "44": { code: "GB", name: "United Kingdom" },
  "33": { code: "FR", name: "France" },
  "39": { code: "IT", name: "Italy" },
  "34": { code: "ES", name: "Spain" },
  "1": { code: "US", name: "United States" },
  "7": { code: "RU", name: "Russia" },
  "971": { code: "AE", name: "UAE" },
  "966": { code: "SA", name: "Saudi Arabia" },
  "974": { code: "QA", name: "Qatar" },
  "972": { code: "IL", name: "Israel" },
};

export function detectCountryFromPhone(
  phone: string,
): { code: string; name: string; countryCode: string } | null {
  const cleaned = phone.replace(/[^0-9]/g, "");
  for (const len of [3, 2, 1]) {
    const prefix = cleaned.substring(0, len);
    if (COUNTRY_CODES[prefix]) {
      return { ...COUNTRY_CODES[prefix], countryCode: `+${prefix}` };
    }
  }
  return null;
}
