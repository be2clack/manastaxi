"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrderEvent = {
  id: number;
  bookingId: number;
  event: string;
  driverId: number | null;
  details: unknown;
  createdAt: Date | null;
};

const eventLabels: Record<string, string> = {
  created: "Создан",
  confirmed: "Подтверждён",
  driver_search: "Поиск водителя",
  assigned: "Назначен",
  driver_accepted: "Водитель принял",
  force_majeure: "Форс-мажор",
  reassigned: "Переназначен",
  completed: "Завершён",
  feedback_received: "Отзыв получен",
  cancelled: "Отменён",
};

const eventColors: Record<string, string> = {
  completed: "bg-green-500",
  force_majeure: "bg-red-500",
  cancelled: "bg-red-500",
  assigned: "bg-blue-500",
  driver_accepted: "bg-blue-400",
  driver_search: "bg-yellow-500",
  created: "bg-gray-400",
  confirmed: "bg-green-400",
  reassigned: "bg-orange-500",
  feedback_received: "bg-purple-500",
};

const eventBadgeColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  force_majeure: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
  assigned: "bg-blue-100 text-blue-800",
  driver_accepted: "bg-blue-100 text-blue-800",
  driver_search: "bg-yellow-100 text-yellow-800",
  created: "bg-gray-100 text-gray-800",
  confirmed: "bg-green-100 text-green-800",
  reassigned: "bg-orange-100 text-orange-800",
  feedback_received: "bg-purple-100 text-purple-800",
};

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function EventsAdmin({ events }: { events: OrderEvent[] }) {
  const [filter, setFilter] = useState("all");

  const filtered = events.filter((e) => {
    if (filter === "all") return true;
    return e.event === filter;
  });

  const uniqueTypes = Array.from(new Set(events.map((e) => e.event)));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">События</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Тип:</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все ({events.length})</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {eventLabels[type] || type} (
                  {events.filter((e) => e.event === type).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Activity className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p>Нет событий</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative ml-4">
          {/* Vertical timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-4">
            {filtered.map((event) => (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div
                  className={`relative z-10 mt-1.5 h-6 w-6 shrink-0 rounded-full border-2 border-white shadow ${
                    eventColors[event.event] || "bg-gray-400"
                  }`}
                />

                {/* Event content */}
                <Card className="flex-1">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              eventBadgeColors[event.event] || "bg-gray-100 text-gray-800"
                            }
                          >
                            {eventLabels[event.event] || event.event}
                          </Badge>
                          <Badge variant="outline">
                            Заказ #{event.bookingId}
                          </Badge>
                          {event.driverId && (
                            <Badge variant="secondary">
                              Водитель #{event.driverId}
                            </Badge>
                          )}
                        </div>
                        {event.details != null && (
                          <pre className="mt-2 rounded bg-gray-50 p-2 text-xs text-muted-foreground overflow-x-auto">
                            {JSON.stringify(event.details as Record<string, unknown>, null, 2)}
                          </pre>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(event.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
