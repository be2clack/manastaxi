"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { FaWhatsapp, FaTelegram, FaViber, FaWeixin } from "react-icons/fa6";

const messengers = [
  { name: "WhatsApp", href: "https://wa.me/996550693000", color: "bg-[#25D366] hover:bg-[#1da851]", icon: FaWhatsapp },
  { name: "Telegram", href: "https://t.me/+996550693000", color: "bg-[#26A5E4] hover:bg-[#1e8cbf]", icon: FaTelegram },
  { name: "Viber", href: "viber://chat?number=+996550693000", color: "bg-[#7360F2] hover:bg-[#5a48d4]", icon: FaViber },
  { name: "WeChat", href: "#", color: "bg-[#07C160] hover:bg-[#06a350]", icon: FaWeixin },
];

export function ContactsClient() {
  const t = useTranslations("contacts");

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Contact info cards */}
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 bg-taxi-blue/5">
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-taxi-blue text-white">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{t("address")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("addressValue")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-taxi-blue/5">
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-taxi-blue text-white">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{t("phone")}</h3>
                  <a
                    href="tel:+996550693000"
                    className="text-sm text-taxi-blue hover:underline"
                  >
                    +996 550 693 000
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-taxi-blue/5">
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-taxi-blue text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{t("email")}</h3>
                  <a
                    href="mailto:info@manastaxi.kg"
                    className="text-sm text-taxi-blue hover:underline"
                  >
                    info@manastaxi.kg
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-taxi-blue/5">
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-taxi-yellow text-taxi-blue-dark">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    {t("workingHours")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("workingHoursValue")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messengers */}
          <div className="mt-8 text-center">
            <h3 className="mb-4 text-lg font-semibold">{t("messengers")}</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {messengers.map((m) => (
                <a
                  key={m.name}
                  href={m.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${m.color}`}
                >
                  <m.icon className="h-5 w-5" />
                  {m.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mx-auto mt-10 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2920.4!2d74.4694938!3d43.0542118!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x389ee998285adfbf%3A0xfe5a8a3deb1f110e!2z0JzQtdC20LTRg9C90LDRgNC-0LTQvdGL0Lkg0LDRjdGA0L7Qv9C-0YDRgiDCq9Cc0LDQvdCw0YHCuw!5e0!3m2!1sru!2skg!4v1708000000000!5m2!1sru!2skg"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Manas Airport Location"
            />
          </div>
          <div className="mt-3 text-center">
            <a
              href="https://www.google.com/maps/place/%C2%ABManas%C2%BB+International+Airport/@43.0542157,74.4669189,17z/data=!3m1!4b1!4m6!3m5!1s0x389ee998285adfbf:0xfe5a8a3deb1f110e!8m2!3d43.0542118!4d74.4694938!16zL20vMGJ0MHQy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-taxi-blue transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("openInGoogleMaps")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
