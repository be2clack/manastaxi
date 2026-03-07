"use client";

import { useState } from "react";
import { updateSetting } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Wifi } from "lucide-react";

type Setting = { id: number; key: string; value: string };

export function WhatsAppAdmin({ settings }: { settings: Setting[] }) {
  const settingsMap = Object.fromEntries(
    settings.map((s) => [s.key, s.value])
  );

  const [apiUrl, setApiUrl] = useState(
    settingsMap["whatsapp_api_url"] || "https://wa.kaymak.kg"
  );
  const [apiKey, setApiKey] = useState(
    settingsMap["whatsapp_api_key"] || ""
  );
  const [sessionId, setSessionId] = useState(
    settingsMap["whatsapp_session_id"] || ""
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "unknown" | "online" | "offline"
  >("unknown");

  async function handleSave() {
    setSaving(true);
    await updateSetting("whatsapp_api_url", apiUrl);
    await updateSetting("whatsapp_api_key", apiKey);
    await updateSetting("whatsapp_session_id", sessionId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleCheckConnection() {
    setChecking(true);
    try {
      const res = await fetch(
        `${apiUrl}/api/sessions?apikey=${encodeURIComponent(apiKey)}`
      );
      if (res.ok) {
        setConnectionStatus("online");
      } else {
        setConnectionStatus("offline");
      }
    } catch {
      setConnectionStatus("offline");
    }
    setChecking(false);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">WhatsApp</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Настройки подключения к WhatsApp через Baileys
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Настройки WhatsApp (Baileys)
            </CardTitle>
            {connectionStatus !== "unknown" && (
              <Badge
                variant={
                  connectionStatus === "online" ? "default" : "destructive"
                }
                className={
                  connectionStatus === "online"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                {connectionStatus === "online" ? "Онлайн" : "Оффлайн"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
            <Label className="text-sm font-medium text-muted-foreground">
              URL сервера
            </Label>
            <Input
              className="sm:col-span-2"
              placeholder="https://wa.kaymak.kg"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
            <Label className="text-sm font-medium text-muted-foreground">
              API ключ
            </Label>
            <Input
              className="sm:col-span-2"
              type="password"
              placeholder="Введите API ключ"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
            <Label className="text-sm font-medium text-muted-foreground">
              ID сессии
            </Label>
            <Input
              className="sm:col-span-2"
              placeholder="manas-taxi"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-taxi-blue hover:bg-taxi-blue-dark"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving
                ? "Сохранение..."
                : saved
                  ? "Сохранено!"
                  : "Сохранить"}
            </Button>

            <Button
              variant="outline"
              onClick={handleCheckConnection}
              disabled={checking || !apiUrl || !apiKey}
            >
              <Wifi className="mr-2 h-4 w-4" />
              {checking ? "Проверка..." : "Проверить соединение"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
