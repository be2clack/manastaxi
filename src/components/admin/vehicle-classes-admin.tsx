"use client";

import { useState } from "react";
import {
  createVehicleClass,
  updateVehicleClass,
  deleteVehicleClass,
} from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, Save, X, Check } from "lucide-react";

const LOCALES = ["ru", "en", "ky", "zh", "hi", "ar"] as const;
const LOCALE_LABELS: Record<string, string> = {
  ru: "Русский",
  en: "English",
  ky: "Кыргызча",
  zh: "Chinese",
  hi: "Hindi",
  ar: "Arabic",
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

function getLocalizedValue(
  val: unknown,
  locale: string
): string {
  if (val && typeof val === "object" && locale in (val as Record<string, string>)) {
    return (val as Record<string, string>)[locale] || "";
  }
  return "";
}

function getNameRu(val: unknown): string {
  return getLocalizedValue(val, "ru") || getLocalizedValue(val, "en") || "";
}

export function VehicleClassesAdmin({
  vehicleClasses,
}: {
  vehicleClasses: VehicleClass[];
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: {} as Record<string, string>,
    slug: "",
    description: {} as Record<string, string>,
    maxPassengers: "",
    maxLuggage: "",
    sortOrder: "",
    isActive: true,
  });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: {} as Record<string, string>,
    slug: "",
    description: {} as Record<string, string>,
    maxPassengers: "4",
    maxLuggage: "3",
    sortOrder: "0",
  });
  const [saving, setSaving] = useState(false);

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleCreateNameChange(locale: string, value: string) {
    const newName = { ...createForm.name, [locale]: value };
    const slug = locale === "en" ? generateSlug(value) : createForm.slug;
    setCreateForm({ ...createForm, name: newName, slug });
  }

  function startEdit(vc: VehicleClass) {
    setEditingId(vc.id);
    const name: Record<string, string> = {};
    const description: Record<string, string> = {};
    for (const loc of LOCALES) {
      name[loc] = getLocalizedValue(vc.name, loc);
      description[loc] = getLocalizedValue(vc.description, loc);
    }
    setEditForm({
      name,
      slug: vc.slug,
      description,
      maxPassengers: String(vc.maxPassengers ?? 4),
      maxLuggage: String(vc.maxLuggage ?? 3),
      sortOrder: String(vc.sortOrder ?? 0),
      isActive: vc.isActive ?? true,
    });
  }

  async function saveEdit(id: number) {
    setSaving(true);
    await updateVehicleClass(id, {
      name: editForm.name,
      slug: editForm.slug,
      description: editForm.description,
      maxPassengers: Number(editForm.maxPassengers),
      maxLuggage: Number(editForm.maxLuggage),
      sortOrder: Number(editForm.sortOrder),
      isActive: editForm.isActive,
    });
    setEditingId(null);
    setSaving(false);
    window.location.reload();
  }

  async function handleCreate() {
    setSaving(true);
    await createVehicleClass({
      name: createForm.name,
      slug: createForm.slug,
      description: createForm.description,
      maxPassengers: Number(createForm.maxPassengers),
      maxLuggage: Number(createForm.maxLuggage),
      sortOrder: Number(createForm.sortOrder),
    });
    setShowCreate(false);
    setCreateForm({
      name: {},
      slug: "",
      description: {},
      maxPassengers: "4",
      maxLuggage: "3",
      sortOrder: "0",
    });
    setSaving(false);
    window.location.reload();
  }

  async function toggleActive(vc: VehicleClass) {
    await updateVehicleClass(vc.id, { isActive: !(vc.isActive ?? true) });
    window.location.reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Классы машин ({vehicleClasses.length})
        </h1>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-taxi-blue hover:bg-taxi-blue-dark"
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить класс
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6 border-taxi-blue">
          <CardHeader>
            <CardTitle className="text-lg">Новый класс машины</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block font-medium">Название</Label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {LOCALES.map((loc) => (
                    <div key={loc}>
                      <Label className="text-xs text-muted-foreground">
                        {LOCALE_LABELS[loc]}
                      </Label>
                      <Input
                        placeholder={`Название (${loc})`}
                        value={createForm.name[loc] || ""}
                        onChange={(e) =>
                          handleCreateNameChange(loc, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Slug</Label>
                <Input
                  value={createForm.slug}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, slug: e.target.value })
                  }
                  placeholder="auto-generated-from-english-name"
                />
              </div>

              <div>
                <Label className="mb-2 block font-medium">Описание</Label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {LOCALES.map((loc) => (
                    <div key={loc}>
                      <Label className="text-xs text-muted-foreground">
                        {LOCALE_LABELS[loc]}
                      </Label>
                      <Input
                        placeholder={`Описание (${loc})`}
                        value={createForm.description[loc] || ""}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            description: {
                              ...createForm.description,
                              [loc]: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Макс. пассажиров</Label>
                  <Input
                    type="number"
                    value={createForm.maxPassengers}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        maxPassengers: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Макс. багажа</Label>
                  <Input
                    type="number"
                    value={createForm.maxLuggage}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        maxLuggage: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Порядок сортировки</Label>
                  <Input
                    type="number"
                    value={createForm.sortOrder}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        sortOrder: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={saving || !createForm.slug || !createForm.name.ru}
                className="bg-taxi-blue hover:bg-taxi-blue-dark"
              >
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
                  <th className="px-4 py-3 font-medium">Название</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Макс. пассажиров</th>
                  <th className="px-4 py-3 font-medium">Макс. багажа</th>
                  <th className="px-4 py-3 font-medium">Порядок</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {vehicleClasses.map((vc) => (
                  <tr key={vc.id} className="border-b hover:bg-gray-50">
                    {editingId === vc.id ? (
                      <>
                        <td className="px-4 py-2" colSpan={7}>
                          <div className="space-y-3">
                            <div>
                              <Label className="mb-1 block text-xs font-medium">
                                Название
                              </Label>
                              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                                {LOCALES.map((loc) => (
                                  <div key={loc}>
                                    <Label className="text-xs text-muted-foreground">
                                      {LOCALE_LABELS[loc]}
                                    </Label>
                                    <Input
                                      className="h-8 text-sm"
                                      value={editForm.name[loc] || ""}
                                      onChange={(e) => {
                                        const newName = {
                                          ...editForm.name,
                                          [loc]: e.target.value,
                                        };
                                        const slug =
                                          loc === "en"
                                            ? generateSlug(e.target.value)
                                            : editForm.slug;
                                        setEditForm({
                                          ...editForm,
                                          name: newName,
                                          slug,
                                        });
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-5">
                              <div>
                                <Label className="text-xs">Slug</Label>
                                <Input
                                  className="h-8 text-sm"
                                  value={editForm.slug}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      slug: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-xs">
                                  Макс. пассажиров
                                </Label>
                                <Input
                                  type="number"
                                  className="h-8 text-sm"
                                  value={editForm.maxPassengers}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      maxPassengers: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Макс. багажа</Label>
                                <Input
                                  type="number"
                                  className="h-8 text-sm"
                                  value={editForm.maxLuggage}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      maxLuggage: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Порядок</Label>
                                <Input
                                  type="number"
                                  className="h-8 text-sm"
                                  value={editForm.sortOrder}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      sortOrder: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-end gap-2">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={editForm.isActive}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        isActive: e.target.checked,
                                      })
                                    }
                                  />
                                  Активный
                                </label>
                              </div>
                            </div>

                            <div>
                              <Label className="mb-1 block text-xs font-medium">
                                Описание
                              </Label>
                              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                                {LOCALES.map((loc) => (
                                  <div key={loc}>
                                    <Label className="text-xs text-muted-foreground">
                                      {LOCALE_LABELS[loc]}
                                    </Label>
                                    <Input
                                      className="h-8 text-sm"
                                      value={editForm.description[loc] || ""}
                                      onChange={(e) =>
                                        setEditForm({
                                          ...editForm,
                                          description: {
                                            ...editForm.description,
                                            [loc]: e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={saving}
                                onClick={() => saveEdit(vc.id)}
                              >
                                <Save className="mr-1 h-4 w-4" />
                                {saving ? "Сохранение..." : "Сохранить"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Отмена
                              </Button>
                            </div>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium">
                          {getNameRu(vc.name)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {vc.slug}
                        </td>
                        <td className="px-4 py-3">{vc.maxPassengers ?? 4}</td>
                        <td className="px-4 py-3">{vc.maxLuggage ?? 3}</td>
                        <td className="px-4 py-3">{vc.sortOrder ?? 0}</td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              vc.isActive !== false
                                ? "bg-green-100 text-green-700 text-xs"
                                : "bg-red-100 text-red-700 text-xs"
                            }
                          >
                            {vc.isActive !== false ? "Активный" : "Скрыт"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-600"
                              title="Редактировать"
                              onClick={() => startEdit(vc)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              title={
                                vc.isActive !== false
                                  ? "Деактивировать"
                                  : "Активировать"
                              }
                              onClick={() => toggleActive(vc)}
                            >
                              <Check
                                className={`h-4 w-4 ${vc.isActive !== false ? "text-green-500" : "text-gray-400"}`}
                              />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500"
                              title="Удалить"
                              onClick={async () => {
                                if (confirm("Удалить этот класс машины?")) {
                                  await deleteVehicleClass(vc.id);
                                  window.location.reload();
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {vehicleClasses.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Нет классов машин. Нажмите &laquo;Добавить класс&raquo;
                      для создания.
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
