"use client";

import { useState } from "react";
import { updateAiSetting } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Bot, Brain } from "lucide-react";

type AiSetting = {
  id: number;
  provider: "openai" | "anthropic";
  model: string;
  apiKey: string;
  systemPrompt: string;
  temperature: string | null;
  isActive: boolean | null;
};

const providerConfig: Record<
  string,
  { label: string; icon: typeof Bot; placeholder: string }
> = {
  openai: {
    label: "OpenAI",
    icon: Bot,
    placeholder: "gpt-4o",
  },
  anthropic: {
    label: "Anthropic",
    icon: Brain,
    placeholder: "claude-sonnet-4-20250514",
  },
};

export function AiSettingsAdmin({ settings }: { settings: AiSetting[] }) {
  const [formData, setFormData] = useState<Record<number, AiSetting>>(
    Object.fromEntries(settings.map((s) => [s.id, { ...s }]))
  );
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);

  function updateField(id: number, field: keyof AiSetting, value: string | boolean) {
    setFormData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  async function handleToggleActive(id: number, checked: boolean) {
    if (checked) {
      // Update UI: deactivate all, activate this one
      setFormData((prev) => {
        const updated = { ...prev };
        for (const key of Object.keys(updated)) {
          updated[Number(key)] = { ...updated[Number(key)], isActive: false };
        }
        updated[id] = { ...updated[id], isActive: true };
        return updated;
      });
      await updateAiSetting(id, { isActive: true });
    } else {
      updateField(id, "isActive", false);
      await updateAiSetting(id, { isActive: false });
    }
  }

  async function handleSave(id: number) {
    setSavingId(id);
    const data = formData[id];
    await updateAiSetting(id, {
      model: data.model,
      apiKey: data.apiKey,
      systemPrompt: data.systemPrompt,
      temperature: data.temperature || "0.70",
    });
    setSavingId(null);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 3000);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Настройки ИИ</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {settings.map((setting) => {
          const config = providerConfig[setting.provider];
          const current = formData[setting.id];
          if (!config || !current) return null;
          const Icon = config.icon;

          return (
            <Card key={setting.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5" />
                    {config.label}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${setting.id}`} className="text-sm">
                      Активен
                    </Label>
                    <Switch
                      id={`active-${setting.id}`}
                      checked={current.isActive ?? false}
                      onCheckedChange={(checked: boolean) =>
                        handleToggleActive(setting.id, checked)
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`model-${setting.id}`}>Модель</Label>
                  <Input
                    id={`model-${setting.id}`}
                    value={current.model}
                    placeholder={config.placeholder}
                    onChange={(e) =>
                      updateField(setting.id, "model", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`apikey-${setting.id}`}>API ключ</Label>
                  <Input
                    id={`apikey-${setting.id}`}
                    type="password"
                    value={current.apiKey}
                    onChange={(e) =>
                      updateField(setting.id, "apiKey", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`temp-${setting.id}`}>Температура</Label>
                  <Input
                    id={`temp-${setting.id}`}
                    type="number"
                    step={0.1}
                    min={0}
                    max={1}
                    value={current.temperature ?? "0.70"}
                    onChange={(e) =>
                      updateField(setting.id, "temperature", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`prompt-${setting.id}`}>Системный промпт</Label>
                  <Textarea
                    id={`prompt-${setting.id}`}
                    rows={10}
                    value={current.systemPrompt}
                    onChange={(e) =>
                      updateField(setting.id, "systemPrompt", e.target.value)
                    }
                  />
                </div>

                <Button
                  onClick={() => handleSave(setting.id)}
                  disabled={savingId === setting.id}
                  className="bg-taxi-blue hover:bg-taxi-blue-dark"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {savingId === setting.id
                    ? "Сохранение..."
                    : savedId === setting.id
                      ? "Сохранено!"
                      : "Сохранить"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
