export const dynamic = "force-dynamic";

import { setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/home/hero-section";
import { QuickBookingForm } from "@/components/home/quick-booking-form";
import { PopularRoutes } from "@/components/home/popular-routes";
import { ServicesPreview } from "@/components/home/services-preview";
import { WhyUs } from "@/components/home/why-us";
import { getPopularRoutes, getRoutes } from "@/lib/actions";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [popularRoutes, allRoutes] = await Promise.all([
    getPopularRoutes(),
    getRoutes(),
  ]);

  return (
    <>
      <HeroSection />
      <QuickBookingForm
        routes={allRoutes.map((r) => ({
          id: r.id,
          toLocation: r.toLocation,
          priceSom: r.priceSom,
        }))}
      />
      <PopularRoutes routes={popularRoutes} />
      <ServicesPreview />
      <WhyUs />
    </>
  );
}
