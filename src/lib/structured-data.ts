export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    name: "Manas Taxi",
    description:
      "Official taxi service at Manas Airport, Bishkek. Airport transfers across Kyrgyzstan.",
    url: "https://manastaxi.kg",
    telephone: "+996XXXXXXXXX",
    email: "info@manastaxi.kg",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Manas International Airport",
      addressLocality: "Bishkek",
      addressCountry: "KG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.0553,
      longitude: 74.4774,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    priceRange: "$8-$250",
    areaServed: {
      "@type": "Country",
      name: "Kyrgyzstan",
    },
    sameAs: [
      "https://instagram.com/manastaxi",
      "https://facebook.com/manastaxi",
      "https://t.me/manastaxi",
    ],
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Manas Taxi",
    url: "https://manastaxi.kg",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://manastaxi.kg/ru/routes?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}
