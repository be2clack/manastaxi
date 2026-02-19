"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Plane, DollarSign, UserCheck, Radio, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const t = useTranslations("hero");
  const locale = useLocale();

  const features = [
    { icon: DollarSign, label: t("features.fixedPrices") },
    { icon: UserCheck, label: t("features.meetGreet") },
    { icon: Radio, label: t("features.flightTracking") },
    { icon: Clock, label: t("features.available247") },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-taxi-blue-dark via-taxi-blue to-taxi-blue-light">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-taxi-yellow" />
        <div className="absolute -bottom-32 right-10 h-96 w-96 rounded-full bg-taxi-yellow" />
      </div>

      <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <Plane className="h-4 w-4 text-taxi-yellow" />
            <span>manastaxi.kg</span>
          </div>

          {/* Title */}
          <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
            {t("title")}
          </h1>

          {/* Subtitle */}
          <p className="mb-10 text-lg text-blue-100 md:text-xl">
            {t("subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-taxi-yellow text-taxi-blue-dark hover:bg-taxi-yellow-light text-base font-semibold px-8 py-6"
            >
              <Link href={`/${locale}/booking`}>{t("cta")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 text-base px-8 py-6"
            >
              <a
                href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "996550693000").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("ctaWhatsapp")}
              </a>
            </Button>
          </div>

          {/* Features */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col items-center gap-2 rounded-xl bg-white/10 px-4 py-4 backdrop-blur-sm"
              >
                <feature.icon className="h-6 w-6 text-taxi-yellow" />
                <span className="text-sm font-medium text-white">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
