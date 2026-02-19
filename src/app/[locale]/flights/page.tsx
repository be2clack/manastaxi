export const dynamic = "force-dynamic";

import { setRequestLocale } from "next-intl/server";
import { FlightsClient } from "@/components/flights/flights-client";
import { getManasFlights } from "@/lib/aviationstack";

export default async function FlightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [arrivals, departures] = await Promise.all([
    getManasFlights("arrivals"),
    getManasFlights("departures"),
  ]);

  return <FlightsClient arrivals={arrivals} departures={departures} />;
}
