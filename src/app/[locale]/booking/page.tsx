export const dynamic = "force-dynamic";

import { setRequestLocale } from "next-intl/server";
import { getRoutes } from "@/lib/actions";
import { BookingPageClient } from "@/components/booking/booking-page-client";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const routes = await getRoutes();

  return (
    <BookingPageClient
      routes={routes.map((r) => ({
        id: r.id,
        toLocation: r.toLocation,
        priceSom: r.priceSom,
        priceUsd: r.priceUsd,
      }))}
    />
  );
}
