"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Route = {
  id: number;
  slug: string;
  toLocation: string;
  distanceKm: number;
  durationMin: number;
  priceSom: number;
  priceUsd: number;
};

export function PopularRoutes({ routes }: { routes: Route[] }) {
  const t = useTranslations("routes");
  const locale = useLocale();

  function formatDuration(min: number) {
    if (min < 60) return `${min} ${t("min")}`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h} ${t("hour")} ${m} ${t("min")}` : `${h} ${t("hour")}`;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-3 bg-taxi-yellow/10 text-taxi-yellow-dark">
            {t("popular")}
          </Badge>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <Card
              key={route.id}
              className="group transition-all hover:shadow-lg hover:border-taxi-blue/20"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-taxi-blue" />
                      <span>{route.toLocation}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{route.distanceKm} {t("km")}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(route.durationMin)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-taxi-blue">
                      {route.priceSom}
                      <span className="text-sm font-normal text-muted-foreground ml-1">KGS</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${route.priceUsd}
                    </div>
                  </div>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full text-taxi-blue hover:text-taxi-blue-dark hover:bg-taxi-blue/5"
                >
                  <Link href={`/${locale}/booking?route=${route.id}`}>
                    {t("bookNow")}
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg" className="border-taxi-blue text-taxi-blue hover:bg-taxi-blue/5">
            <Link href={`/${locale}/routes`}>
              {t("all")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
