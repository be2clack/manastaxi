"use client";

import { useState } from "react";
import { updateBookingStatus, deleteBooking } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

type Booking = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  flightNumber: string | null;
  routeId: number | null;
  customDestination: string | null;
  pickupDate: string;
  pickupTime: string | null;
  passengers: number;
  luggage: number;
  status: "new" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes: string | null;
  source: string | null;
  createdAt: Date;
};

const statuses = ["new", "confirmed", "in_progress", "completed", "cancelled"] as const;

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

export function BookingsAdmin({ bookings }: { bookings: Booking[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings ({bookings.length})</h1>
      </div>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        {statuses.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {s.replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Flight</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Passengers</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">#{b.id}</td>
                    <td className="px-4 py-3 font-medium">{b.name}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`tel:${b.phone}`}
                        className="text-taxi-blue hover:underline"
                      >
                        {b.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3">{b.flightNumber || "—"}</td>
                    <td className="px-4 py-3">
                      {b.pickupDate}
                      {b.pickupTime && ` ${b.pickupTime}`}
                    </td>
                    <td className="px-4 py-3">{b.passengers}</td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        onChange={async (e) => {
                          await updateBookingStatus(
                            b.id,
                            e.target.value as typeof b.status
                          );
                          window.location.reload();
                        }}
                        className="rounded border px-2 py-1 text-xs"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={async () => {
                          if (confirm("Delete this booking?")) {
                            await deleteBooking(b.id);
                            window.location.reload();
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No bookings found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
