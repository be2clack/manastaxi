"use client";

import { useState } from "react";
import { createDriver, updateDriver, deleteDriver } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Eye, EyeOff, Pencil, Plus, X, Save } from "lucide-react";

type Driver = {
  id: number;
  name: string;
  phone: string;
  vehicleClassId: number;
  vehicleMake: string;
  vehiclePlate: string;
  telegramChatId: string | null;
  isActive: boolean | null;
  hasActiveOrder: boolean | null;
  rating: string | null;
  totalTrips: number | null;
  createdAt: Date | null;
};

type VehicleClass = {
  id: number;
  name: unknown;
  slug: string;
  description: unknown;
  maxPassengers: number | null;
  maxLuggage: number | null;
  sortOrder: number | null;
  isActive: boolean | null;
  createdAt: Date | null;
};

function getClassName(vc: VehicleClass): string {
  const name = vc.name as Record<string, string> | null;
  return name?.ru || name?.en || vc.slug;
}

export function DriversAdmin({
  drivers,
  vehicleClasses,
}: {
  drivers: Driver[];
  vehicleClasses: VehicleClass[];
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    vehicleClassId: "",
    vehicleMake: "",
    vehiclePlate: "",
  });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    phone: "",
    vehicleClassId: "",
    vehicleMake: "",
    vehiclePlate: "",
  });
  const [saving, setSaving] = useState(false);

  const classMap = Object.fromEntries(vehicleClasses.map((vc) => [vc.id, getClassName(vc)]));

  function startEdit(d: Driver) {
    setEditingId(d.id);
    setEditForm({
      name: d.name,
      phone: d.phone,
      vehicleClassId: String(d.vehicleClassId),
      vehicleMake: d.vehicleMake,
      vehiclePlate: d.vehiclePlate,
    });
  }

  async function saveEdit(id: number) {
    setSaving(true);
    await updateDriver(id, {
      name: editForm.name,
      phone: editForm.phone,
      vehicleClassId: Number(editForm.vehicleClassId),
      vehicleMake: editForm.vehicleMake,
      vehiclePlate: editForm.vehiclePlate,
    });
    setEditingId(null);
    setSaving(false);
    window.location.reload();
  }

  async function handleCreate() {
    setSaving(true);
    await createDriver({
      name: createForm.name,
      phone: createForm.phone,
      vehicleClassId: Number(createForm.vehicleClassId),
      vehicleMake: createForm.vehicleMake,
      vehiclePlate: createForm.vehiclePlate,
    });
    setShowCreate(false);
    setCreateForm({ name: "", phone: "", vehicleClassId: "", vehicleMake: "", vehiclePlate: "" });
    setSaving(false);
    window.location.reload();
  }

  const isCreateValid =
    createForm.name && createForm.phone && createForm.vehicleClassId && createForm.vehicleMake && createForm.vehiclePlate;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Водители ({drivers.length})</h1>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-taxi-blue hover:bg-taxi-blue-dark"
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить водителя
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6 border-taxi-blue">
          <CardHeader>
            <CardTitle className="text-lg">Новый водитель</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>ФИО *</Label>
                <Input
                  placeholder="Иванов Иван Иванович"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Телефон *</Label>
                <Input
                  placeholder="+996 XXX XXX XXX"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Класс машины *</Label>
                <Select
                  value={createForm.vehicleClassId}
                  onValueChange={(val) => setCreateForm({ ...createForm, vehicleClassId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите класс" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleClasses.map((vc) => (
                      <SelectItem key={vc.id} value={String(vc.id)}>
                        {getClassName(vc)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Марка и модель авто *</Label>
                <Input
                  placeholder="Toyota Camry"
                  value={createForm.vehicleMake}
                  onChange={(e) => setCreateForm({ ...createForm, vehicleMake: e.target.value })}
                />
              </div>
              <div>
                <Label>Гос. номер *</Label>
                <Input
                  placeholder="01 KG 123 ABC"
                  value={createForm.vehiclePlate}
                  onChange={(e) => setCreateForm({ ...createForm, vehiclePlate: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleCreate} disabled={saving || !isCreateValid} className="bg-taxi-blue hover:bg-taxi-blue-dark">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Сохранение..." : "Создать"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
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
                  <th className="px-4 py-3 font-medium">Имя</th>
                  <th className="px-4 py-3 font-medium">Телефон</th>
                  <th className="px-4 py-3 font-medium">Класс машины</th>
                  <th className="px-4 py-3 font-medium">Автомобиль</th>
                  <th className="px-4 py-3 font-medium">Гос. номер</th>
                  <th className="px-4 py-3 font-medium">Telegram</th>
                  <th className="px-4 py-3 font-medium">Рейтинг</th>
                  <th className="px-4 py-3 font-medium">Поездки</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id} className="border-b hover:bg-gray-50">
                    {editingId === d.id ? (
                      <>
                        <td className="px-4 py-2">
                          <Input className="h-8 text-sm" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                        </td>
                        <td className="px-4 py-2">
                          <Input className="h-8 w-36 text-sm" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                        </td>
                        <td className="px-4 py-2">
                          <Select
                            value={editForm.vehicleClassId}
                            onValueChange={(val) => setEditForm({ ...editForm, vehicleClassId: val })}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicleClasses.map((vc) => (
                                <SelectItem key={vc.id} value={String(vc.id)}>
                                  {getClassName(vc)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2">
                          <Input className="h-8 text-sm" value={editForm.vehicleMake} onChange={(e) => setEditForm({ ...editForm, vehicleMake: e.target.value })} />
                        </td>
                        <td className="px-4 py-2">
                          <Input className="h-8 w-28 text-sm" value={editForm.vehiclePlate} onChange={(e) => setEditForm({ ...editForm, vehiclePlate: e.target.value })} />
                        </td>
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3" />
                        <td className="px-4 py-2">
                          <div className="flex gap-1">
                            <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700" disabled={saving} onClick={() => saveEdit(d.id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium">{d.name}</td>
                        <td className="px-4 py-3">{d.phone}</td>
                        <td className="px-4 py-3">{classMap[d.vehicleClassId] || "-"}</td>
                        <td className="px-4 py-3">{d.vehicleMake}</td>
                        <td className="px-4 py-3 font-mono">{d.vehiclePlate}</td>
                        <td className="px-4 py-3">
                          {d.telegramChatId ? (
                            <Badge className="bg-green-100 text-green-700 text-xs">Подключен</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-500 text-xs">Не подключен</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">{d.rating || "5.00"}</td>
                        <td className="px-4 py-3">{d.totalTrips || 0}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {d.hasActiveOrder && (
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs">На заказе</Badge>
                            )}
                            <Badge className={d.isActive !== false ? "bg-green-100 text-green-700 text-xs" : "bg-red-100 text-red-700 text-xs"}>
                              {d.isActive !== false ? "Активен" : "Неактивен"}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" title="Редактировать" onClick={() => startEdit(d)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" title="Активность" onClick={async () => { await updateDriver(d.id, { isActive: !(d.isActive !== false) }); window.location.reload(); }}>
                              {d.isActive !== false ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-red-400" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" title="Удалить" onClick={async () => { if (confirm("Удалить этого водителя?")) { await deleteDriver(d.id); window.location.reload(); } }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {drivers.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                      Водители не найдены. Добавьте первого водителя.
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
