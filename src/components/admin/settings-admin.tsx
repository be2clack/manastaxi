"use client";

import { useState } from "react";
import { updateSetting } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

type Setting = { id: number; key: string; value: string };

const settingLabels: Record<string, string> = {
  phone_primary: "Основной телефон",
  phone_secondary: "Дополнительный телефон",
  email: "Email",
  address_ru: "Адрес (русский)",
  address_en: "Адрес (английский)",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  viber: "Viber",
  wechat: "WeChat",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  working_hours: "Часы работы",
  currency_rate: "Курс валюты (KGS/USD)",
};

export function SettingsAdmin({ settings }: { settings: Setting[] }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map((s) => [s.key, s.value]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    for (const [key, value] of Object.entries(values)) {
      await updateSetting(key, value);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const groups: Record<string, string[]> = {
    "Контактная информация": [
      "phone_primary",
      "phone_secondary",
      "email",
      "address_ru",
      "address_en",
    ],
    "Социальные сети и мессенджеры": [
      "whatsapp",
      "telegram",
      "viber",
      "wechat",
      "instagram",
      "facebook",
      "tiktok",
    ],
    "Прочие настройки": ["working_hours", "currency_rate"],
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Настройки</h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-taxi-blue hover:bg-taxi-blue-dark"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Сохранение..." : saved ? "Сохранено!" : "Сохранить всё"}
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(groups).map(([group, keys]) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle className="text-lg">{group}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {keys.map((key) => (
                <div key={key} className="grid gap-2 sm:grid-cols-3 sm:items-center">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {settingLabels[key] || key}
                  </Label>
                  <Input
                    className="sm:col-span-2"
                    value={values[key] || ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
