"use client";

import { useTranslations } from "next-intl";
import { DollarSign, Shield, Radio, Clock, Car, Languages } from "lucide-react";

const features = [
  { key: "fixedPrices", icon: DollarSign },
  { key: "professional", icon: Shield },
  { key: "flightTracking", icon: Radio },
  { key: "available247", icon: Clock },
  { key: "comfortable", icon: Car },
  { key: "languages", icon: Languages },
];

export function WhyUs() {
  const t = useTranslations("whyUs");

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.key} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-taxi-yellow/10 text-taxi-yellow-dark">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold text-gray-900">
                  {t(`${feature.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`${feature.key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
