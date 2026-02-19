"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Menu, Phone, Plane, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { LanguageSwitcher } from "./language-switcher";

const navLinks = [
  { href: "/", key: "home" },
  { href: "/routes", key: "routes" },
  { href: "/booking", key: "booking" },
  { href: "/flights", key: "flights" },
  { href: "/tours", key: "tours" },
  { href: "/services", key: "services" },
  { href: "/contacts", key: "contacts" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-taxi-blue">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-taxi-blue">
              MANAS
            </span>
            <span className="text-xs font-semibold leading-tight text-taxi-yellow-dark">
              TAXI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={`/${locale}${link.href === "/" ? "" : link.href}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-taxi-blue/5 hover:text-taxi-blue"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Button
            asChild
            size="sm"
            className="hidden bg-taxi-blue hover:bg-taxi-blue-dark sm:flex"
          >
            <a href="tel:+996550693000">
              <Phone className="mr-1 h-4 w-4" />
              {t("callNow")}
            </a>
          </Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col gap-4 pt-8">
                {/* Mobile Logo */}
                <Link
                  href={`/${locale}`}
                  className="flex items-center gap-2"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-taxi-blue">
                    <Plane className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-taxi-blue">
                    MANAS TAXI
                  </span>
                </Link>

                {/* Mobile Nav Links */}
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.key}
                      href={`/${locale}${link.href === "/" ? "" : link.href}`}
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-taxi-blue/5 hover:text-taxi-blue"
                      onClick={() => setOpen(false)}
                    >
                      {t(link.key)}
                    </Link>
                  ))}
                </nav>

                {/* Mobile CTA */}
                <Button
                  asChild
                  className="mt-4 bg-taxi-blue hover:bg-taxi-blue-dark"
                >
                  <a href="tel:+996550693000">
                    <Phone className="mr-2 h-4 w-4" />
                    {t("callNow")}
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
