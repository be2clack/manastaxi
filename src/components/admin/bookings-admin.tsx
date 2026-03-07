"use client";

import { useState } from "react";
import { updateBooking, deleteBooking, createBookingAdmin } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Pencil, X, Save, Phone, Eye, Plus } from "lucide-react";

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
  status: "new" | "confirmed" | "driver_search" | "assigned" | "in_progress" | "completed" | "cancelled";
  notes: string | null;
  source: string | null;
  createdAt: Date;
  vehicleClassId: number | null;
  driverId: number | null;
  needsSign: boolean | null;
  signText: string | null;
  scheduledAt: Date | null;
  totalPriceSom: string | null;
  totalPriceUsd: string | null;
  channel: "website" | "whatsapp" | "telegram" | "manual" | null;
  language: string | null;
  clientCountry: string | null;
  isUrgent: boolean | null;
};

const statuses = ["new", "confirmed", "driver_search", "assigned", "in_progress", "completed", "cancelled"] as const;

const statusLabels: Record<string, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  driver_search: "Поиск водителя",
  assigned: "Назначен",
  in_progress: "В работе",
  completed: "Завершён",
  cancelled: "Отменён",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  driver_search: "bg-orange-100 text-orange-700",
  assigned: "bg-purple-100 text-purple-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

const channelLabels: Record<string, { label: string; color: string }> = {
  website: { label: "Сайт", color: "bg-gray-100 text-gray-700" },
  whatsapp: { label: "WhatsApp", color: "bg-green-100 text-green-700" },
  telegram: { label: "Telegram", color: "bg-blue-100 text-blue-700" },
  manual: { label: "Вручную", color: "bg-purple-100 text-purple-700" },
};

const emptyCreateForm = {
  name: "",
  phone: "",
  email: "",
  flightNumber: "",
  customDestination: "",
  pickupDate: "",
  pickupTime: "",
  passengers: "1",
  luggage: "1",
  notes: "",
  status: "new",
  vehicleClassId: "",
  driverId: "",
  needsSign: false,
  signText: "",
  totalPriceSom: "",
  totalPriceUsd: "",
  channel: "manual",
  language: "",
  clientCountry: "",
  isUrgent: false,
};

export function BookingsAdmin({ bookings }: { bookings: Booking[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
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

  async function handleCreate() {
    setSaving(true);
    await createBookingAdmin({
      name: createForm.name,
      phone: createForm.phone,
      email: createForm.email || undefined,
      flightNumber: createForm.flightNumber || undefined,
      customDestination: createForm.customDestination || undefined,
      pickupDate: createForm.pickupDate,
      pickupTime: createForm.pickupTime || undefined,
      passengers: Number(createForm.passengers),
      luggage: Number(createForm.luggage),
      notes: createForm.notes || undefined,
      status: createForm.status as Booking["status"],
      vehicleClassId: createForm.vehicleClassId ? Number(createForm.vehicleClassId) : undefined,
      driverId: createForm.driverId ? Number(createForm.driverId) : undefined,
      needsSign: createForm.needsSign,
      signText: createForm.signText || undefined,
      totalPriceSom: createForm.totalPriceSom || undefined,
      totalPriceUsd: createForm.totalPriceUsd || undefined,
      channel: createForm.channel as "website" | "whatsapp" | "telegram" | "manual",
      language: createForm.language || undefined,
      clientCountry: createForm.clientCountry || undefined,
      isUrgent: createForm.isUrgent,
    });
    setShowCreateForm(false);
    setCreateForm(emptyCreateForm);
    setSaving(false);
    window.location.reload();
  }

  const detail = detailId ? bookings.find((b) => b.id === detailId) : null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Бронирования ({bookings.length})</h1>
        <Button onClick={() => { setShowCreateForm(!showCreateForm); setEditingId(null); setDetailId(null); }} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Создать заказ вручную
        </Button>
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

      {showCreateForm && (
        <Card className="mb-4 border-green-500">
          <CardContent className="p-5">
            <h3 className="mb-3 font-bold text-lg">Новый заказ</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-xs text-muted-foreground">Имя *</label>
                <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Телефон *</label>
                <Input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Email</label>
                <Input value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Рейс</label>
                <Input value={createForm.flightNumber} onChange={(e) => setCreateForm({ ...createForm, flightNumber: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Направление</label>
                <Input value={createForm.customDestination} onChange={(e) => setCreateForm({ ...createForm, customDestination: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Дата подачи *</label>
                <Input type="date" value={createForm.pickupDate} onChange={(e) => setCreateForm({ ...createForm, pickupDate: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Время</label>
                <Input type="time" value={createForm.pickupTime} onChange={(e) => setCreateForm({ ...createForm, pickupTime: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Пассажиров</label>
                <Input type="number" min="1" value={createForm.passengers} onChange={(e) => setCreateForm({ ...createForm, passengers: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Багаж</label>
                <Input type="number" min="0" value={createForm.luggage} onChange={(e) => setCreateForm({ ...createForm, luggage: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Статус</label>
                <select value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  {statuses.map((s) => (<option key={s} value={s}>{statusLabels[s]}</option>))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Канал</label>
                <select value={createForm.channel} onChange={(e) => setCreateForm({ ...createForm, channel: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="manual">Вручную</option>
                  <option value="website">Сайт</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">ID класса авто</label>
                <Input type="number" value={createForm.vehicleClassId} onChange={(e) => setCreateForm({ ...createForm, vehicleClassId: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">ID водителя</label>
                <Input type="number" value={createForm.driverId} onChange={(e) => setCreateForm({ ...createForm, driverId: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Цена (сом)</label>
                <Input value={createForm.totalPriceSom} onChange={(e) => setCreateForm({ ...createForm, totalPriceSom: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Цена (USD)</label>
                <Input value={createForm.totalPriceUsd} onChange={(e) => setCreateForm({ ...createForm, totalPriceUsd: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Язык</label>
                <Input value={createForm.language} onChange={(e) => setCreateForm({ ...createForm, language: e.target.value })} placeholder="ru, en, de..." />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Страна клиента</label>
                <Input value={createForm.clientCountry} onChange={(e) => setCreateForm({ ...createForm, clientCountry: e.target.value })} placeholder="KG, DE, US..." />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={createForm.needsSign} onChange={(e) => setCreateForm({ ...createForm, needsSign: e.target.checked })} />
                  Табличка
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={createForm.isUrgent} onChange={(e) => setCreateForm({ ...createForm, isUrgent: e.target.checked })} />
                  <span className="text-red-600 font-medium">Срочный</span>
                </label>
              </div>
              {createForm.needsSign && (
                <div>
                  <label className="text-xs text-muted-foreground">Текст таблички</label>
                  <Input value={createForm.signText} onChange={(e) => setCreateForm({ ...createForm, signText: e.target.value })} />
                </div>
              )}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-xs text-muted-foreground">Примечания</label>
                <Input value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleCreate} disabled={saving || !createForm.name || !createForm.phone || !createForm.pickupDate} className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Сохранение..." : "Создать"}
              </Button>
              <Button variant="outline" onClick={() => { setShowCreateForm(false); setCreateForm(emptyCreateForm); }}>
                <X className="mr-2 h-4 w-4" />
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              <div><span className="text-muted-foreground">Канал:</span> {detail.channel ? channelLabels[detail.channel]?.label || detail.channel : "—"}</div>
              <div><span className="text-muted-foreground">Класс авто:</span> {detail.vehicleClassId || "—"}</div>
              <div><span className="text-muted-foreground">Водитель ID:</span> {detail.driverId || "—"}</div>
              <div><span className="text-muted-foreground">Цена (сом):</span> {detail.totalPriceSom || "—"}</div>
              <div><span className="text-muted-foreground">Цена (USD):</span> {detail.totalPriceUsd || "—"}</div>
              <div><span className="text-muted-foreground">Язык:</span> {detail.language || "—"}</div>
              <div><span className="text-muted-foreground">Страна:</span> {detail.clientCountry || "—"}</div>
              <div><span className="text-muted-foreground">Табличка:</span> {detail.needsSign ? (detail.signText || "Да") : "Нет"}</div>
              <div><span className="text-muted-foreground">Срочный:</span> {detail.isUrgent ? <Badge className="bg-red-100 text-red-700">Да</Badge> : "Нет"}</div>
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
                  <th className="px-4 py-3 font-medium">Канал</th>
                  <th className="px-4 py-3 font-medium">Класс</th>
                  <th className="px-4 py-3 font-medium">Язык</th>
                  <th className="px-4 py-3 font-medium">Срочный</th>
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
                      {b.channel ? (
                        <Badge className={channelLabels[b.channel]?.color || ""}>
                          {channelLabels[b.channel]?.label || b.channel}
                        </Badge>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">{b.vehicleClassId || "—"}</td>
                    <td className="px-4 py-3">{b.language || "—"}</td>
                    <td className="px-4 py-3">
                      {b.isUrgent ? <Badge className="bg-red-100 text-red-700">Срочно</Badge> : "—"}
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
