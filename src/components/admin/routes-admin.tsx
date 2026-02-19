"use client";

import { useState } from "react";
import { createRoute, updateRoute, deleteRoute } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Star, StarOff, Eye, EyeOff, Pencil, Plus, X, Save } from "lucide-react";

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    toLocation: "",
    fromLocation: "",
    distanceKm: "",
    durationMin: "",
    priceSom: "",
    priceUsd: "",
  });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    fromLocation: "Аэропорт Манас",
    toLocation: "",
    distanceKm: "",
    durationMin: "",
    priceSom: "",
    priceUsd: "",
  });
  const [saving, setSaving] = useState(false);

  function startEdit(r: Route) {
    setEditingId(r.id);
    setEditForm({
      toLocation: r.toLocation,
      fromLocation: r.fromLocation,
      distanceKm: String(r.distanceKm),
      durationMin: String(r.durationMin),
      priceSom: String(r.priceSom),
      priceUsd: String(r.priceUsd),
    });
  }

  async function saveEdit(id: number) {
    setSaving(true);
    await updateRoute(id, {
      toLocation: editForm.toLocation,
      fromLocation: editForm.fromLocation,
      distanceKm: Number(editForm.distanceKm),
      durationMin: Number(editForm.durationMin),
      priceSom: Number(editForm.priceSom),
      priceUsd: Number(editForm.priceUsd),
    });
    setEditingId(null);
    setSaving(false);
    window.location.reload();
  }

  async function handleCreate() {
    setSaving(true);
    const slug = createForm.toLocation
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]/gi, "-")
      .replace(/-+/g, "-");
    await createRoute({
      slug,
      fromLocation: createForm.fromLocation,
      toLocation: createForm.toLocation,
      distanceKm: Number(createForm.distanceKm),
      durationMin: Number(createForm.durationMin),
      priceSom: Number(createForm.priceSom),
      priceUsd: Number(createForm.priceUsd),
      isPopular: false,
    });
    setShowCreate(false);
    setSaving(false);
    window.location.reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Маршруты ({routes.length})</h1>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-taxi-blue hover:bg-taxi-blue-dark"
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить маршрут
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6 border-taxi-blue">
          <CardHeader>
            <CardTitle className="text-lg">Новый маршрут</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>Откуда</Label>
                <Input
                  value={createForm.fromLocation}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, fromLocation: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Куда *</Label>
                <Input
                  placeholder="Например: Каракол"
                  value={createForm.toLocation}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, toLocation: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Расстояние (км)</Label>
                <Input
                  type="number"
                  value={createForm.distanceKm}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, distanceKm: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Время в пути (мин)</Label>
                <Input
                  type="number"
                  value={createForm.durationMin}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, durationMin: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Цена (KGS)</Label>
                <Input
                  type="number"
                  value={createForm.priceSom}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, priceSom: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Цена (USD)</Label>
                <Input
                  type="number"
                  value={createForm.priceUsd}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, priceUsd: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleCreate} disabled={saving || !createForm.toLocation} className="bg-taxi-blue hover:bg-taxi-blue-dark">
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
                  <th className="px-4 py-3 font-medium">Направление</th>
                  <th className="px-4 py-3 font-medium">Расстояние</th>
                  <th className="px-4 py-3 font-medium">Время</th>
                  <th className="px-4 py-3 font-medium">Цена (KGS)</th>
                  <th className="px-4 py-3 font-medium">Цена (USD)</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    {editingId === r.id ? (
                      <>
                        <td className="px-4 py-2">
                          <Input className="h-8 text-sm" value={editForm.toLocation} onChange={(e) => setEditForm({ ...editForm, toLocation: e.target.value })} />
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" className="h-8 w-20 text-sm" value={editForm.distanceKm} onChange={(e) => setEditForm({ ...editForm, distanceKm: e.target.value })} />
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" className="h-8 w-20 text-sm" value={editForm.durationMin} onChange={(e) => setEditForm({ ...editForm, durationMin: e.target.value })} />
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" className="h-8 w-24 text-sm" value={editForm.priceSom} onChange={(e) => setEditForm({ ...editForm, priceSom: e.target.value })} />
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" className="h-8 w-20 text-sm" value={editForm.priceUsd} onChange={(e) => setEditForm({ ...editForm, priceUsd: e.target.value })} />
                        </td>
                        <td className="px-4 py-3" />
                        <td className="px-4 py-2">
                          <div className="flex gap-1">
                            <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700" disabled={saving} onClick={() => saveEdit(r.id)}>
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
                        <td className="px-4 py-3">
                          <div className="font-medium">{r.toLocation}</div>
                          <div className="text-xs text-muted-foreground">из: {r.fromLocation}</div>
                        </td>
                        <td className="px-4 py-3">{r.distanceKm} км</td>
                        <td className="px-4 py-3">
                          {r.durationMin >= 60
                            ? `${Math.floor(r.durationMin / 60)} ч ${r.durationMin % 60} мин`
                            : `${r.durationMin} мин`}
                        </td>
                        <td className="px-4 py-3 font-semibold">{r.priceSom} KGS</td>
                        <td className="px-4 py-3">${r.priceUsd}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {r.isPopular && <Badge className="bg-yellow-100 text-yellow-700 text-xs">Популярный</Badge>}
                            <Badge className={r.isActive ? "bg-green-100 text-green-700 text-xs" : "bg-red-100 text-red-700 text-xs"}>
                              {r.isActive ? "Активный" : "Скрыт"}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" title="Редактировать" onClick={() => startEdit(r)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" title="Популярный" onClick={async () => { await updateRoute(r.id, { isPopular: !r.isPopular }); window.location.reload(); }}>
                              {r.isPopular ? <Star className="h-4 w-4 text-yellow-500" /> : <StarOff className="h-4 w-4 text-gray-400" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" title="Видимость" onClick={async () => { await updateRoute(r.id, { isActive: !r.isActive }); window.location.reload(); }}>
                              {r.isActive ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-red-400" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" title="Удалить" onClick={async () => { if (confirm("Удалить этот маршрут?")) { await deleteRoute(r.id); window.location.reload(); } }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
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
