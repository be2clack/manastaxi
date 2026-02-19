"use client";

import { useState } from "react";
import { updateBooking, deleteBooking } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Pencil, X, Save, Phone, Eye } from "lucide-react";

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

const statusLabels: Record<string, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  in_progress: "В работе",
  completed: "Завершён",
  cancelled: "Отменён",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

export function BookingsAdmin({ bookings }: { bookings: Booking[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    flightNumber: "",
    pickupDate: "",
    pickupTime: "",
    passengers: "1",
    notes: "",
    status: "new" as string,
  });
  const [saving, setSaving] = useState(false);

  const filtered =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  function startEdit(b: Booking) {
    setEditingId(b.id);
    setDetailId(null);
    setEditForm({
      name: b.name,
      phone: b.phone,
      flightNumber: b.flightNumber || "",
      pickupDate: b.pickupDate,
      pickupTime: b.pickupTime || "",
      passengers: String(b.passengers),
      notes: b.notes || "",
      status: b.status,
    });
  }

  async function saveEdit(id: number) {
    setSaving(true);
    await updateBooking(id, {
      name: editForm.name,
      phone: editForm.phone,
      flightNumber: editForm.flightNumber || null,
      pickupDate: editForm.pickupDate,
      pickupTime: editForm.pickupTime || null,
      passengers: Number(editForm.passengers),
      notes: editForm.notes || null,
      status: editForm.status as Booking["status"],
    });
    setEditingId(null);
    setSaving(false);
    window.location.reload();
  }

  const detail = detailId ? bookings.find((b) => b.id === detailId) : null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Бронирования ({bookings.length})</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          Все
        </Button>
        {statuses.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {statusLabels[s]}
          </Button>
        ))}
      </div>

      {detail && (
        <Card className="mb-4 border-taxi-blue">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-lg">Бронирование #{detail.id}</h3>
              <Button size="sm" variant="ghost" onClick={() => setDetailId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><span className="text-muted-foreground">Имя:</span> {detail.name}</div>
              <div><span className="text-muted-foreground">Телефон:</span> <a href={`tel:${detail.phone}`} className="text-taxi-blue">{detail.phone}</a></div>
              <div><span className="text-muted-foreground">Email:</span> {detail.email || "—"}</div>
              <div><span className="text-muted-foreground">Рейс:</span> {detail.flightNumber || "—"}</div>
              <div><span className="text-muted-foreground">Дата:</span> {detail.pickupDate} {detail.pickupTime && `в ${detail.pickupTime}`}</div>
              <div><span className="text-muted-foreground">Пассажиров:</span> {detail.passengers}</div>
              <div><span className="text-muted-foreground">Багаж:</span> {detail.luggage} шт.</div>
              <div><span className="text-muted-foreground">Направление:</span> {detail.customDestination || `Маршрут #${detail.routeId}`}</div>
              <div><span className="text-muted-foreground">Источник:</span> {detail.source}</div>
              <div><span className="text-muted-foreground">Создано:</span> {new Date(detail.createdAt).toLocaleString("ru")}</div>
              {detail.notes && (
                <div className="sm:col-span-2"><span className="text-muted-foreground">Примечания:</span> {detail.notes}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {editingId && (
        <Card className="mb-4 border-green-500">
          <CardContent className="p-5">
            <h3 className="mb-3 font-bold text-lg">Редактирование #{editingId}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-xs text-muted-foreground">Имя</label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Телефон</label>
                <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Рейс</label>
                <Input value={editForm.flightNumber} onChange={(e) => setEditForm({ ...editForm, flightNumber: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Дата</label>
                <Input value={editForm.pickupDate} onChange={(e) => setEditForm({ ...editForm, pickupDate: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Время</label>
                <Input value={editForm.pickupTime} onChange={(e) => setEditForm({ ...editForm, pickupTime: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Пассажиров</label>
                <Input type="number" value={editForm.passengers} onChange={(e) => setEditForm({ ...editForm, passengers: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Статус</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">Примечания</label>
                <Input value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => saveEdit(editingId)} disabled={saving} className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Сохранение..." : "Сохранить"}
              </Button>
              <Button variant="outline" onClick={() => setEditingId(null)}>
                <X className="mr-2 h-4 w-4" />
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Имя</th>
                  <th className="px-4 py-3 font-medium">Телефон</th>
                  <th className="px-4 py-3 font-medium">Рейс</th>
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3 font-medium">Пасс.</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">#{b.id}</td>
                    <td className="px-4 py-3 font-medium">{b.name}</td>
                    <td className="px-4 py-3">
                      <a href={`tel:${b.phone}`} className="text-taxi-blue hover:underline inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
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
                      <Badge className={statusColors[b.status]}>
                        {statusLabels[b.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-600" title="Подробнее" onClick={() => { setDetailId(b.id); setEditingId(null); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" title="Редактировать" onClick={() => startEdit(b)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          title="Удалить"
                          onClick={async () => {
                            if (confirm("Удалить это бронирование?")) {
                              await deleteBooking(b.id);
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
          {filtered.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              Бронирований не найдено
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
