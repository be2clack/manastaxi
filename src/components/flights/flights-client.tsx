"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Search, Plane, PlaneLanding, PlaneTakeoff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Flight } from "@/lib/aviationstack";

function formatTime(dateStr: string | null) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const map: Record<string, { label: string; className: string }> = {
    landed: { label: t("landed"), className: "bg-green-100 text-green-700" },
    active: { label: t("enRoute"), className: "bg-blue-100 text-blue-700" },
    scheduled: { label: t("scheduled_status"), className: "bg-gray-100 text-gray-700" },
    delayed: { label: t("delayed"), className: "bg-yellow-100 text-yellow-700" },
    cancelled: { label: t("cancelled"), className: "bg-red-100 text-red-700" },
  };
  const badge = map[status] || map.scheduled;
  return <Badge className={badge.className}>{badge.label}</Badge>;
}

export function FlightsClient({
  arrivals,
  departures,
}: {
  arrivals: Flight[];
  departures: Flight[];
}) {
  const t = useTranslations("flights");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");

  const filterFlights = (flights: Flight[]) => {
    if (!searchQuery) return flights;
    return flights.filter((f) =>
      f.flight.iata.toLowerCase().includes(searchQuery.toLowerCase().replace(/\s/g, ""))
    );
  };

  const FlightRow = ({ flight, type }: { flight: Flight; type: "arrival" | "departure" }) => (
    <div className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-taxi-blue/10">
          {type === "arrival" ? (
            <PlaneLanding className="h-5 w-5 text-taxi-blue" />
          ) : (
            <PlaneTakeoff className="h-5 w-5 text-taxi-blue" />
          )}
        </div>
        <div>
          <div className="font-semibold">{flight.flight.iata}</div>
          <div className="text-sm text-muted-foreground">
            {flight.airline.name}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">
            {type === "arrival" ? flight.departure.iata : "FRU"}
          </span>
          <span className="mx-1">→</span>
          <span className="font-medium">
            {type === "arrival" ? "FRU" : flight.arrival.iata}
          </span>
        </div>
        <div className="text-muted-foreground">
          {formatTime(
            type === "arrival"
              ? flight.arrival.scheduled
              : flight.departure.scheduled
          )}
        </div>
        <StatusBadge status={flight.flight_status} t={t} />
      </div>

      <Button
        asChild
        size="sm"
        variant="outline"
        className="text-taxi-blue border-taxi-blue/30 hover:bg-taxi-blue/5"
      >
        <Link href={`/${locale}/booking?flight=${flight.flight.iata}`}>
          {t("bookTaxi")}
        </Link>
      </Button>
    </div>
  );

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-taxi-blue/10">
            <Plane className="h-7 w-7 text-taxi-blue" />
          </div>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="arrivals" className="mx-auto max-w-3xl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="arrivals" className="gap-2">
              <PlaneLanding className="h-4 w-4" />
              {t("arrivals")}
            </TabsTrigger>
            <TabsTrigger value="departures" className="gap-2">
              <PlaneTakeoff className="h-4 w-4" />
              {t("departures")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="arrivals" className="mt-6 space-y-3">
            {filterFlights(arrivals).map((flight, i) => (
              <FlightRow key={`arr-${i}`} flight={flight} type="arrival" />
            ))}
            {filterFlights(arrivals).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {t("searchPlaceholder")}
              </p>
            )}
          </TabsContent>

          <TabsContent value="departures" className="mt-6 space-y-3">
            {filterFlights(departures).map((flight, i) => (
              <FlightRow key={`dep-${i}`} flight={flight} type="departure" />
            ))}
            {filterFlights(departures).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {t("searchPlaceholder")}
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
