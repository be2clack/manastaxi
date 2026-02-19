"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Phone, Mail, MapPin, Plane } from "lucide-react";
import {
  FaWhatsapp,
  FaTelegram,
  FaInstagram,
  FaFacebookF,
  FaTiktok,
} from "react-icons/fa6";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href={`/${locale}`} className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-taxi-yellow">
                <Plane className="h-5 w-5 text-taxi-blue-dark" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight text-white">
                  MANAS
                </span>
                <span className="text-xs font-semibold leading-tight text-taxi-yellow">
                  TAXI
                </span>
              </div>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/routes", label: t("nav.routes") },
                { href: "/booking", label: t("nav.booking") },
                { href: "/flights", label: t("nav.flights") },
                { href: "/tours", label: t("nav.tours") },
                { href: "/contacts", label: t("nav.contacts") },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-sm text-gray-400 transition-colors hover:text-taxi-yellow"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t("footer.ourServices")}
            </h3>
            <ul className="space-y-2">
              {[
                t("services.airportTransfer.title"),
                t("services.meetGreet.title"),
                t("services.vipTransfer.title"),
                t("services.hotelBooking.title"),
                t("services.cityTour.title"),
              ].map((service) => (
                <li key={service}>
                  <Link
                    href={`/${locale}/services`}
                    className="text-sm text-gray-400 transition-colors hover:text-taxi-yellow"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t("footer.contactInfo")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-taxi-yellow" />
                <span className="text-sm">{t("contacts.addressValue")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-taxi-yellow" />
                <a
                  href="tel:+996550693000"
                  className="text-sm hover:text-taxi-yellow"
                >
                  +996 550 693 000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-taxi-yellow" />
                <a
                  href="mailto:info@manastaxi.kg"
                  className="text-sm hover:text-taxi-yellow"
                >
                  info@manastaxi.kg
                </a>
              </li>
            </ul>

            {/* Social */}
            <div className="mt-5">
              <h4 className="mb-2 text-sm font-semibold text-white">
                {t("footer.followUs")}
              </h4>
              <div className="flex gap-3">
                <a
                  href="https://wa.me/996550693000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-[#25D366]"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="h-4 w-4" />
                </a>
                <a
                  href="https://t.me/+996550693000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-[#26A5E4]"
                  aria-label="Telegram"
                >
                  <FaTelegram className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com/manastaxi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF]"
                  aria-label="Instagram"
                >
                  <FaInstagram className="h-4 w-4" />
                </a>
                <a
                  href="https://facebook.com/manastaxi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-[#1877F2]"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="h-4 w-4" />
                </a>
                <a
                  href="https://tiktok.com/@manastaxi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-black"
                  aria-label="TikTok"
                >
                  <FaTiktok className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          {t("footer.copyright", { year })}
        </div>
      </div>
    </footer>
  );
}
