"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Car,
  UserCheck,
  Crown,
  Hotel,
  MapPin,
  Briefcase,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
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
  { key: "airportTransfer", icon: "Car", price: "$10", priceSom: "800 KGS" },
  { key: "meetGreet", icon: "UserCheck", price: "$15", priceSom: "1,300 KGS" },
  { key: "vipTransfer", icon: "Crown", price: "$35", priceSom: "3,000 KGS" },
  { key: "hotelBooking", icon: "Hotel", price: null, priceSom: null },
  { key: "cityTour", icon: "MapPin", price: "$50", priceSom: "4,200 KGS" },
  { key: "businessTransfer", icon: "Briefcase", price: "$45", priceSom: "3,800 KGS" },
];

export function ServicesClient() {
  const t = useTranslations("services");
  const locale = useLocale();

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-taxi-blue/10">
            <CheckCircle2 className="h-7 w-7 text-taxi-blue" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serviceKeys.map((service) => {
            const Icon = serviceIcons[service.icon] || Car;
            return (
              <Card
                key={service.key}
                className="group transition-all hover:shadow-xl border-0 bg-white"
              >
                <CardContent className="p-6">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-taxi-blue/10 text-taxi-blue transition-colors group-hover:bg-taxi-blue group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    {t(`${service.key}.title`)}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                    {t(`${service.key}.description`)}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      {service.price ? (
                        <div className="text-lg font-bold text-taxi-blue">
                          {service.price}
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            / {service.priceSom}
                          </span>
                        </div>
                      ) : (
                        <div className="text-lg font-semibold text-green-600">
                          {t("free")}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    asChild
                    className="mt-4 w-full bg-taxi-blue hover:bg-taxi-blue-dark"
                  >
                    <Link href={`/${locale}/booking`}>
                      {t("bookService")}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
