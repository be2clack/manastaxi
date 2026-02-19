"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Clock,
  Users,
  Mountain,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tourTranslationKeys: Record<string, string> = {
  "issyk-kul-tour": "issykKul",
  "son-kul-tour": "sonKul",
  "ala-archa-day-tour": "alaArcha",
  "silk-road-tour": "silkRoad",
  "osh-bazaar-tour": "osh",
  "horse-trek-tour": "horseTrek",
};

const tourColors = [
  "from-blue-500/20 to-blue-600/10",
  "from-emerald-500/20 to-emerald-600/10",
  "from-amber-500/20 to-amber-600/10",
  "from-purple-500/20 to-purple-600/10",
  "from-rose-500/20 to-rose-600/10",
  "from-cyan-500/20 to-cyan-600/10",
];

type Tour = {
  id: number;
  slug: string;
  durationDays: number;
  priceUsd: number;
  priceSom: number;
  maxGroup: number;
  imageUrl: string | null;
};

export function ToursClient({ tours }: { tours: Tour[] }) {
  const t = useTranslations("tours");
  const locale = useLocale();

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-taxi-yellow/10">
            <Mountain className="h-7 w-7 text-taxi-yellow-dark" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour, i) => {
            const key = tourTranslationKeys[tour.slug] || tour.slug;
            return (
              <Card
                key={tour.id}
                className="group overflow-hidden transition-all hover:shadow-xl border-0"
              >
                {/* Gradient placeholder for tour image */}
                <div
                  className={`h-48 bg-gradient-to-br ${tourColors[i % tourColors.length]} flex items-center justify-center`}
                >
                  <Mountain className="h-16 w-16 text-gray-400/50" />
                </div>
                <CardContent className="p-5">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {t(`${key}.description`)}
                  </p>

                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {tour.durationDays}{" "}
                      {tour.durationDays === 1 ? t("day") : t("days")}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {t("maxGroup")}: {tour.maxGroup}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        {t("from")}
                      </span>
                      <span className="ml-1 text-2xl font-bold text-taxi-blue">
                        ${tour.priceUsd}
                      </span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        / {tour.priceSom} KGS
                      </span>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="mt-4 w-full bg-taxi-blue hover:bg-taxi-blue-dark"
                  >
                    <Link href={`/${locale}/booking`}>
                      {t("bookTour")}
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
