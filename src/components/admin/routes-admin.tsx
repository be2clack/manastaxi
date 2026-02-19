"use client";

import { updateRoute, deleteRoute } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Star, StarOff, Eye, EyeOff } from "lucide-react";

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
};

export function RoutesAdmin({ routes }: { routes: Route[] }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Routes ({routes.length})</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium">Destination</th>
                  <th className="px-4 py-3 font-medium">Distance</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Price (KGS)</th>
                  <th className="px-4 py-3 font-medium">Price (USD)</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.toLocation}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3">{r.distanceKm} km</td>
                    <td className="px-4 py-3">{r.durationMin} min</td>
                    <td className="px-4 py-3 font-semibold">
                      {r.priceSom} KGS
                    </td>
                    <td className="px-4 py-3">${r.priceUsd}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {r.isPopular && (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            Popular
                          </Badge>
                        )}
                        <Badge
                          className={
                            r.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }
                        >
                          {r.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          title="Toggle popular"
                          onClick={async () => {
                            await updateRoute(r.id, {
                              isPopular: !r.isPopular,
                            });
                            window.location.reload();
                          }}
                        >
                          {r.isPopular ? (
                            <Star className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          title="Toggle active"
                          onClick={async () => {
                            await updateRoute(r.id, {
                              isActive: !r.isActive,
                            });
                            window.location.reload();
                          }}
                        >
                          {r.isActive ? (
                            <Eye className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-red-400" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500"
                          onClick={async () => {
                            if (confirm("Delete this route?")) {
                              await deleteRoute(r.id);
                              window.location.reload();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
