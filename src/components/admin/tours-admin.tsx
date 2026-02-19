"use client";

import { useState } from "react";
import { createTour, updateTour, deleteTour } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Eye, EyeOff, Pencil, Plus, X, Save } from "lucide-react";

type Tour = {
  id: number;
  slug: string;
  durationDays: number;
  priceUsd: number;
  priceSom: number;
  maxGroup: number;
  isActive: boolean;
  sortOrder: number;
  imageUrl: string | null;
  createdAt: Date;
};

const tourNames: Record<string, string> = {
  "issyk-kul": "Иссык-Куль",
  "son-kul": "Сон-Куль",
  "ala-archa": "Ала-Арча",
  "silk-road": "Великий Шёлковый путь",
  osh: "Ош и Юг",
  "horse-trek": "Конный поход",
};

export function ToursAdmin({ tours }: { tours: Tour[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    durationDays: "",
    priceUsd: "",
    priceSom: "",
    maxGroup: "",
  });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    slug: "",
    durationDays: "",
    priceUsd: "",
    priceSom: "",
    maxGroup: "10",
  });
  const [saving, setSaving] = useState(false);

  function startEdit(t: Tour) {
    setEditingId(t.id);
    setEditForm({
      durationDays: String(t.durationDays),
      priceUsd: String(t.priceUsd),
      priceSom: String(t.priceSom),
      maxGroup: String(t.maxGroup),
    });
  }

  async function saveEdit(id: number) {
    setSaving(true);
    await updateTour(id, {
      durationDays: Number(editForm.durationDays),
      priceUsd: Number(editForm.priceUsd),
      priceSom: Number(editForm.priceSom),
      maxGroup: Number(editForm.maxGroup),
    });
    setEditingId(null);
    setSaving(false);
    window.location.reload();
  }

  async function handleCreate() {
    setSaving(true);
    await createTour({
      slug: createForm.slug,
      durationDays: Number(createForm.durationDays),
      priceUsd: Number(createForm.priceUsd),
      priceSom: Number(createForm.priceSom),
      maxGroup: Number(createForm.maxGroup),
    });
    setShowCreate(false);
    setSaving(false);
    window.location.reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Туры ({tours.length})</h1>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-taxi-blue hover:bg-taxi-blue-dark"
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить тур
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6 border-taxi-blue">
          <CardHeader>
            <CardTitle className="text-lg">Новый тур</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>Слаг (идентификатор) *</Label>
                <Input
                  placeholder="например: canyon-tour"
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                />
              </div>
              <div>
                <Label>Длительность (дней)</Label>
                <Input
                  type="number"
                  value={createForm.durationDays}
                  onChange={(e) => setCreateForm({ ...createForm, durationDays: e.target.value })}
                />
              </div>
              <div>
                <Label>Макс. группа</Label>
                <Input
                  type="number"
                  value={createForm.maxGroup}
                  onChange={(e) => setCreateForm({ ...createForm, maxGroup: e.target.value })}
                />
              </div>
              <div>
                <Label>Цена (USD)</Label>
                <Input
                  type="number"
                  value={createForm.priceUsd}
                  onChange={(e) => setCreateForm({ ...createForm, priceUsd: e.target.value })}
                />
              </div>
              <div>
                <Label>Цена (KGS)</Label>
                <Input
                  type="number"
                  value={createForm.priceSom}
                  onChange={(e) => setCreateForm({ ...createForm, priceSom: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleCreate} disabled={saving || !createForm.slug} className="bg-taxi-blue hover:bg-taxi-blue-dark">
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
                  <th className="px-4 py-3 font-medium">Тур</th>
                  <th className="px-4 py-3 font-medium">Дней</th>
                  <th className="px-4 py-3 font-medium">Цена (USD)</th>
                  <th className="px-4 py-3 font-medium">Цена (KGS)</th>
                  <th className="px-4 py-3 font-medium">Макс. группа</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    {editingId === t.id ? (
                      <>
                        <td className="px-4 py-3 font-medium">{tourNames[t.slug] || t.slug}</td>
                        <td className="px-4 py-2">
                          <Input type="number" className="h-8 w-16 text-sm" value={editForm.durationDays} onChange={(e) => setEditForm({ ...editForm, durationDays: e.target.value })} />
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" className="h-8 w-20 text-sm" value={editForm.priceUsd} onChange={(e) => setEditForm({ ...editForm, priceUsd: e.target.value })} />
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" className="h-8 w-24 text-sm" value={editForm.priceSom} onChange={(e) => setEditForm({ ...editForm, priceSom: e.target.value })} />
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" className="h-8 w-16 text-sm" value={editForm.maxGroup} onChange={(e) => setEditForm({ ...editForm, maxGroup: e.target.value })} />
                        </td>
                        <td className="px-4 py-3" />
                        <td className="px-4 py-2">
                          <div className="flex gap-1">
                            <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700" disabled={saving} onClick={() => saveEdit(t.id)}>
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
                          <div className="font-medium">{tourNames[t.slug] || t.slug}</div>
                          <div className="text-xs text-muted-foreground">{t.slug}</div>
                        </td>
                        <td className="px-4 py-3">{t.durationDays} дн.</td>
                        <td className="px-4 py-3">${t.priceUsd}</td>
                        <td className="px-4 py-3">{t.priceSom} KGS</td>
                        <td className="px-4 py-3">{t.maxGroup} чел.</td>
                        <td className="px-4 py-3">
                          <Badge className={t.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {t.isActive ? "Активный" : "Скрыт"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" title="Редактировать" onClick={() => startEdit(t)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" title="Видимость" onClick={async () => { await updateTour(t.id, { isActive: !t.isActive }); window.location.reload(); }}>
                              {t.isActive ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-red-400" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" title="Удалить" onClick={async () => { if (confirm("Удалить этот тур?")) { await deleteTour(t.id); window.location.reload(); } }}>
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
