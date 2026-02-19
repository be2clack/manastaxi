"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Search, MapPin, Clock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Route = {
  id: number;
  slug: string;
  fromLocation: string;
  toLocation: string;
  distanceKm: number;
  durationMin: number;
  priceSom: number;
  priceUsd: number;
  isPopular: boolean;
};

export function RoutesClient({ routes }: { routes: Route[] }) {
  const t = useTranslations("routes");
  const locale = useLocale();
  const [search, setSearch] = useState("");

  const filtered = routes.filter((r) =>
    r.toLocation.toLowerCase().includes(search.toLowerCase())
  );

  function formatDuration(min: number) {
    if (min < 60) return `${min} ${t("min")}`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h} ${t("hour")} ${m} ${t("min")}` : `${h} ${t("hour")}`;
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Routes grid */}
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">{t("noResults")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((route) => (
              <Card
                key={route.id}
                className="group transition-all hover:shadow-lg hover:border-taxi-blue/20"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-taxi-blue" />
                        <span className="font-semibold text-gray-900">
                          {route.toLocation}
                        </span>
                        {route.isPopular && (
                          <Badge className="bg-taxi-yellow/10 text-taxi-yellow-dark text-xs">
                            {t("popular")}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{route.distanceKm} {t("km")}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(route.durationMin)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-taxi-blue">
                        {route.priceSom}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          KGS
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${route.priceUsd}
                      </div>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="mt-4 w-full bg-taxi-blue hover:bg-taxi-blue-dark"
                  >
                    <Link href={`/${locale}/booking?route=${route.id}`}>
                      {t("bookNow")}
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
