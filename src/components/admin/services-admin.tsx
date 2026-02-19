"use client";

import { useState } from "react";
import { updateService, deleteService } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Eye, EyeOff, Pencil, X, Save } from "lucide-react";

type Service = {
  id: number;
  slug: string;
  priceUsd: string | null;
  priceSom: string | null;
  iconName: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
};

const serviceNames: Record<string, string> = {
  "airport-transfer": "Трансфер из аэропорта",
  "meet-greet": "Встреча с табличкой",
  "vip-transfer": "VIP-трансфер",
  "hotel-booking": "Бронирование отелей",
  "city-tour": "Экскурсия по городу",
  "business-transfer": "Бизнес-трансфер",
};

export function ServicesAdmin({ services }: { services: Service[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    priceUsd: "",
    priceSom: "",
    iconName: "",
  });
  const [saving, setSaving] = useState(false);

  function startEdit(s: Service) {
    setEditingId(s.id);
    setEditForm({
      priceUsd: s.priceUsd || "",
      priceSom: s.priceSom || "",
      iconName: s.iconName || "",
    });
  }

  async function saveEdit(id: number) {
    setSaving(true);
    await updateService(id, {
      priceUsd: editForm.priceUsd || undefined,
      priceSom: editForm.priceSom || undefined,
      iconName: editForm.iconName || undefined,
    });
    setEditingId(null);
    setSaving(false);
    window.location.reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Услуги ({services.length})</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium">Услуга</th>
                  <th className="px-4 py-3 font-medium">Цена (USD)</th>
                  <th className="px-4 py-3 font-medium">Цена (KGS)</th>
                  <th className="px-4 py-3 font-medium">Иконка</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    {editingId === s.id ? (
                      <>
                        <td className="px-4 py-3 font-medium">{serviceNames[s.slug] || s.slug}</td>
                        <td className="px-4 py-2">
                          <Input className="h-8 w-24 text-sm" placeholder="0.00" value={editForm.priceUsd} onChange={(e) => setEditForm({ ...editForm, priceUsd: e.target.value })} />
                        </td>
                        <td className="px-4 py-2">
                          <Input className="h-8 w-24 text-sm" placeholder="0.00" value={editForm.priceSom} onChange={(e) => setEditForm({ ...editForm, priceSom: e.target.value })} />
                        </td>
                        <td className="px-4 py-2">
                          <Input className="h-8 w-28 text-sm" value={editForm.iconName} onChange={(e) => setEditForm({ ...editForm, iconName: e.target.value })} />
                        </td>
                        <td className="px-4 py-3" />
                        <td className="px-4 py-2">
                          <div className="flex gap-1">
                            <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700" disabled={saving} onClick={() => saveEdit(s.id)}>
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
                          <div className="font-medium">{serviceNames[s.slug] || s.slug}</div>
                          <div className="text-xs text-muted-foreground">{s.slug}</div>
                        </td>
                        <td className="px-4 py-3">{s.priceUsd ? `$${s.priceUsd}` : "Бесплатно"}</td>
                        <td className="px-4 py-3">{s.priceSom ? `${s.priceSom} KGS` : "Бесплатно"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{s.iconName || "—"}</td>
                        <td className="px-4 py-3">
                          <Badge className={s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {s.isActive ? "Активный" : "Скрыт"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" title="Редактировать" onClick={() => startEdit(s)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" title="Видимость" onClick={async () => { await updateService(s.id, { isActive: !s.isActive }); window.location.reload(); }}>
                              {s.isActive ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-red-400" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" title="Удалить" onClick={async () => { if (confirm("Удалить эту услугу?")) { await deleteService(s.id); window.location.reload(); } }}>
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
