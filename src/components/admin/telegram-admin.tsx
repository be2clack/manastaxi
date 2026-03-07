"use client";

import { useState, useEffect } from "react";
import { upsertTelegramSetting } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Webhook } from "lucide-react";

type TelegramSetting = {
  id: number;
  botType: "client" | "driver" | "admin";
  token: string;
  webhookUrl: string | null;
  isActive: boolean | null;
};

type BotConfig = {
  botType: "client" | "driver" | "admin";
  title: string;
  webhookPath?: string;
};

const botConfigs: BotConfig[] = [
  {
    botType: "client",
    title: "Бот для клиентов",
    webhookPath: "/api/telegram/client",
  },
  {
    botType: "driver",
    title: "Бот для водителей",
    webhookPath: "/api/telegram/driver",
  },
  {
    botType: "admin",
    title: "Уведомления админов",
  },
];

export function TelegramAdmin({ settings }: { settings: TelegramSetting[] }) {
  const [state, setState] = useState<
    Record<string, { token: string; webhookUrl: string; isActive: boolean }>
  >(() => {
    const initial: Record<
      string,
      { token: string; webhookUrl: string; isActive: boolean }
    > = {};
    for (const cfg of botConfigs) {
      const existing = settings.find((s) => s.botType === cfg.botType);
      initial[cfg.botType] = {
        token: existing?.token || "",
        webhookUrl: existing?.webhookUrl || "",
        isActive: existing?.isActive ?? false,
      };
    }
    return initial;
  });

  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [settingWebhook, setSettingWebhook] = useState<Record<string, boolean>>(
    {}
  );
  const [webhookResult, setWebhookResult] = useState<
    Record<string, { ok: boolean; message: string }>
  >({});
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function handleSave(botType: string) {
    setSaving((prev) => ({ ...prev, [botType]: true }));
    const data = state[botType];
    await upsertTelegramSetting({
      botType: botType as "client" | "driver" | "admin",
      token: data.token,
      webhookUrl: data.webhookUrl || undefined,
      isActive: data.isActive,
    });
    setSaving((prev) => ({ ...prev, [botType]: false }));
    setSaved((prev) => ({ ...prev, [botType]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [botType]: false })), 3000);
  }

  async function handleSetupWebhook(botType: string) {
    setSettingWebhook((prev) => ({ ...prev, [botType]: true }));
    try {
      const res = await fetch("/api/telegram/setup-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botType }),
      });
      const data = await res.json();
      setWebhookResult((prev) => ({
        ...prev,
        [botType]: {
          ok: res.ok,
          message: data.message || (res.ok ? "Webhook установлен" : "Ошибка"),
        },
      }));
    } catch {
      setWebhookResult((prev) => ({
        ...prev,
        [botType]: { ok: false, message: "Ошибка сети" },
      }));
    }
    setSettingWebhook((prev) => ({ ...prev, [botType]: false }));
    setTimeout(
      () =>
        setWebhookResult((prev) => {
          const next = { ...prev };
          delete next[botType];
          return next;
        }),
      5000
    );
  }

  function updateField(
    botType: string,
    field: "token" | "webhookUrl" | "isActive",
    value: string | boolean
  ) {
    setState((prev) => ({
      ...prev,
      [botType]: { ...prev[botType], [field]: value },
    }));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Telegram-боты</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Настройки Telegram-ботов для клиентов, водителей и уведомлений
        </p>
      </div>

      <div className="space-y-6">
        {botConfigs.map((cfg) => {
          const bt = cfg.botType;
          const webhookUrl = cfg.webhookPath
            ? `${origin}${cfg.webhookPath}`
            : "";

          return (
            <Card key={bt}>
              <CardHeader>
                <CardTitle className="text-lg">{cfg.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Токен бота
                  </Label>
                  <Input
                    className="sm:col-span-2"
                    type="password"
                    placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    value={state[bt].token}
                    onChange={(e) => updateField(bt, "token", e.target.value)}
                  />
                </div>

                {cfg.webhookPath && (
                  <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Webhook URL
                    </Label>
                    <Input
                      className="sm:col-span-2 bg-muted"
                      readOnly
                      value={webhookUrl}
                    />
                  </div>
                )}

                <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Активен
                  </Label>
                  <div className="sm:col-span-2">
                    <Switch
                      checked={state[bt].isActive}
                      onCheckedChange={(checked) =>
                        updateField(bt, "isActive", checked)
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={() => handleSave(bt)}
                    disabled={saving[bt]}
                    className="bg-taxi-blue hover:bg-taxi-blue-dark"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving[bt]
                      ? "Сохранение..."
                      : saved[bt]
                        ? "Сохранено!"
                        : "Сохранить"}
                  </Button>

                  {cfg.webhookPath && (
                    <Button
                      variant="outline"
                      onClick={() => handleSetupWebhook(bt)}
                      disabled={settingWebhook[bt] || !state[bt].token}
                    >
                      <Webhook className="mr-2 h-4 w-4" />
                      {settingWebhook[bt]
                        ? "Установка..."
                        : "Установить Webhook"}
                    </Button>
                  )}
                </div>

                {webhookResult[bt] && (
                  <p
                    className={`text-sm ${webhookResult[bt].ok ? "text-green-600" : "text-red-600"}`}
                  >
                    {webhookResult[bt].message}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
