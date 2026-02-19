"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: Locale) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {localeFlags[locale as Locale]}
          </span>
          <span className="text-xs uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={locale === loc ? "bg-taxi-blue/5 font-semibold" : ""}
          >
            <span className="mr-2">{localeFlags[loc]}</span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
