"use client";

import { useState, useMemo, Fragment } from "react";
import { bulkUpsertRoutePrices } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Search, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { updateSetting } from "@/lib/admin-actions";

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
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
};

type VehicleClass = {
  id: number;
  name: Record<string, string> | unknown;
  slug: string;
  description: unknown;
  maxPassengers: number | null;
  maxLuggage: number | null;
  sortOrder: number | null;
  isActive: boolean | null;
  createdAt: Date | null;
};

type RoutePrice = {
  id: number;
  routeId: number;
  vehicleClassId: number;
  priceSom: string;
  priceUsd: string;
};

// Helper to get vehicle class display name
function getVehicleClassName(vc: VehicleClass): string {
  const name = vc.name as Record<string, string> | null;
  if (name && typeof name === "object") {
    return name.ru || name.en || vc.slug;
  }
  return vc.slug;
}

// Create a key for the price map
function priceKey(routeId: number, vehicleClassId: number) {
  return `${routeId}-${vehicleClassId}`;
}

export function RoutePricesAdmin({
  routes,
  vehicleClasses,
  routePrices,
  currencyRate: initialRate,
}: {
  routes: Route[];
  vehicleClasses: VehicleClass[];
  routePrices: RoutePrice[];
  currencyRate: number;
}) {
  const [rate, setRate] = useState(initialRate);
  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState(String(initialRate));
  // Build initial price map from existing data
  const initialPrices = useMemo(() => {
    const map: Record<string, { priceSom: string; priceUsd: string }> = {};
    for (const rp of routePrices) {
      map[priceKey(rp.routeId, rp.vehicleClassId)] = {
        priceSom: rp.priceSom,
        priceUsd: rp.priceUsd,
      };
    }
    return map;
  }, [routePrices]);

  const [prices, setPrices] =
    useState<Record<string, { priceSom: string; priceUsd: string }>>(initialPrices);
  const [changed, setChanged] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeRoutes = routes.filter((r) => r.isActive);
  const activeVehicleClasses = vehicleClasses.filter((vc) => vc.isActive);

  const filteredRoutes = useMemo(() => {
    if (!search.trim()) return activeRoutes;
    const q = search.toLowerCase();
    return activeRoutes.filter(
      (r) =>
        r.fromLocation.toLowerCase().includes(q) ||
        r.toLocation.toLowerCase().includes(q)
    );
  }, [activeRoutes, search]);

  function handlePriceChange(
    routeId: number,
    vehicleClassId: number,
    field: "priceSom" | "priceUsd",
    value: string
  ) {
    const key = priceKey(routeId, vehicleClassId);
    setPrices((prev) => {
      const existing = prev[key] || { priceSom: "", priceUsd: "" };
      const updated = { ...existing, [field]: value };

      // Auto-calculate SOM when USD is entered
      if (field === "priceUsd" && value && rate > 0) {
        updated.priceSom = String(Math.round(Number(value) * rate));
      }

      return { ...prev, [key]: updated };
    });
    setChanged((prev) => new Set(prev).add(key));
  }

  async function handleRateSave() {
    const newRate = Number(rateInput);
    if (newRate > 0) {
      setRate(newRate);
      await updateSetting("currency_rate", String(newRate));
      setEditingRate(false);
    }
  }

  async function handleSave() {
    if (changed.size === 0) return;

    setSaving(true);
    const toSave = Array.from(changed)
      .map((key) => {
        const [routeId, vehicleClassId] = key.split("-").map(Number);
        const p = prices[key];
        if (!p || (!p.priceSom && !p.priceUsd)) return null;
        return {
          routeId,
          vehicleClassId,
          priceSom: p.priceSom || "0",
          priceUsd: p.priceUsd || "0",
        };
      })
      .filter(Boolean) as Array<{
      routeId: number;
      vehicleClassId: number;
      priceSom: string;
      priceUsd: string;
    }>;

    await bulkUpsertRoutePrices(toSave);
    setChanged(new Set());
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Цены маршрутов</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5">
            <span className="text-sm text-muted-foreground">Курс:</span>
            {editingRate ? (
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">1 USD =</span>
                <Input
                  type="number"
                  className="h-7 w-20 text-center text-sm"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRateSave()}
                  autoFocus
                />
                <span className="text-sm font-medium">KGS</span>
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleRateSave}>
                  <Save className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => { setRateInput(String(rate)); setEditingRate(true); }}
                className="flex items-center gap-1.5 text-sm font-semibold hover:text-taxi-blue transition-colors"
              >
                1 USD = {rate} KGS
                <RefreshCw className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || changed.size === 0}
            className="bg-taxi-blue hover:bg-taxi-blue-dark"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving
              ? "Сохранение..."
              : saved
                ? "Сохранено!"
                : `Сохранить всё${changed.size > 0 ? ` (${changed.size})` : ""}`}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg">Матрица цен</CardTitle>
            <div className="relative ml-auto w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск маршрута..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th
                    className="sticky left-0 z-10 bg-background px-3 py-2 text-left font-medium"
                    rowSpan={2}
                  >
                    Маршрут
                  </th>
                  {activeVehicleClasses.map((vc) => (
                    <th
                      key={vc.id}
                      className="border-l px-2 py-2 text-center font-medium"
                      colSpan={2}
                    >
                      {getVehicleClassName(vc)}
                    </th>
                  ))}
                </tr>
                <tr className="border-b bg-muted/50">
                  {activeVehicleClasses.map((vc) => (
                    <Fragment key={vc.id}>
                      <th className="border-l px-2 py-1 text-center text-xs font-normal text-muted-foreground">
                        SOM
                      </th>
                      <th className="px-2 py-1 text-center text-xs font-normal text-muted-foreground">
                        USD
                      </th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((route) => (
                  <tr key={route.id} className="border-b hover:bg-muted/30">
                    <td className="sticky left-0 z-10 bg-background px-3 py-2 font-medium whitespace-nowrap">
                      {route.fromLocation} &rarr; {route.toLocation}
                    </td>
                    {activeVehicleClasses.map((vc) => {
                      const key = priceKey(route.id, vc.id);
                      const p = prices[key];
                      const isChanged = changed.has(key);
                      return (
                        <Fragment key={vc.id}>
                          <td className="border-l px-1 py-1">
                            <Input
                              type="number"
                              className={`h-8 w-20 text-center text-sm ${isChanged ? "border-yellow-500" : ""}`}
                              value={p?.priceSom ?? ""}
                              placeholder="0"
                              onChange={(e) =>
                                handlePriceChange(
                                  route.id,
                                  vc.id,
                                  "priceSom",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Input
                              type="number"
                              className={`h-8 w-20 text-center text-sm ${isChanged ? "border-yellow-500" : ""}`}
                              value={p?.priceUsd ?? ""}
                              placeholder="0"
                              onChange={(e) =>
                                handlePriceChange(
                                  route.id,
                                  vc.id,
                                  "priceUsd",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        </Fragment>
                      );
                    })}
                  </tr>
                ))}
                {filteredRoutes.length === 0 && (
                  <tr>
                    <td
                      colSpan={1 + activeVehicleClasses.length * 2}
                      className="px-3 py-8 text-center text-muted-foreground"
                    >
                      {search
                        ? "Маршруты не найдены"
                        : "Нет активных маршрутов"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

