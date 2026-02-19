"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Car, UserCheck, Crown, Hotel, MapPin, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const serviceIcons: Record<string, React.ElementType> = {
  Car,
  UserCheck,
  Crown,
  Hotel,
  MapPin,
  Briefcase,
};

const serviceKeys = [
  { slug: "airport-transfer", key: "airportTransfer", icon: "Car" },
  { slug: "meet-greet", key: "meetGreet", icon: "UserCheck" },
  { slug: "vip-transfer", key: "vipTransfer", icon: "Crown" },
  { slug: "hotel-booking", key: "hotelBooking", icon: "Hotel" },
  { slug: "city-tour", key: "cityTour", icon: "MapPin" },
  { slug: "business-transfer", key: "businessTransfer", icon: "Briefcase" },
];

export function ServicesPreview() {
  const t = useTranslations("services");
  const locale = useLocale();

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serviceKeys.map((service) => {
            const Icon = serviceIcons[service.icon] || Car;
            return (
              <Card
                key={service.slug}
                className="group transition-all hover:shadow-lg border-0 bg-white"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-taxi-blue/10 text-taxi-blue transition-colors group-hover:bg-taxi-blue group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {t(`${service.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`${service.key}.description`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button
            asChild
            size="lg"
            className="bg-taxi-blue hover:bg-taxi-blue-dark"
          >
            <Link href={`/${locale}/services`}>
              {t("bookService")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
