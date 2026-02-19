"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  Phone,
  Mail,
  MapPin,
  Plane,
  MessageCircle,
  Send,
} from "lucide-react";

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
                  href="tel:+996XXXXXXXXX"
                  className="text-sm hover:text-taxi-yellow"
                >
                  +996 XXX XXX XXX
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
                  href="https://wa.me/996XXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-green-600"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href="https://t.me/manastaxi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-blue-500"
                  aria-label="Telegram"
                >
                  <Send className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com/manastaxi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-pink-600"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a
                  href="https://facebook.com/manastaxi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-blue-700"
                  aria-label="Facebook"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a
                  href="https://tiktok.com/@manastaxi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gray-600"
                  aria-label="TikTok"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.89 2.89 2.89 0 012.88-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.16V11.7a4.83 4.83 0 01-3.77-1.24V6.69h3.77z"/></svg>
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
