import { db } from "@/db";
import { settings } from "@/db/schema";
import { inArray } from "drizzle-orm";

async function getWhatsAppConfig() {
  const rows = await db
    .select()
    .from(settings)
    .where(
      inArray(settings.key, [
        "whatsapp_api_url",
        "whatsapp_api_key",
        "whatsapp_session_id",
      ]),
    );

  const config: Record<string, string> = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }

  return {
    apiUrl: config.whatsapp_api_url || "https://wa.kaymak.kg",
    apiKey: config.whatsapp_api_key || "",
    sessionId: config.whatsapp_session_id || "",
  };
}

export async function sendWhatsAppMessage(to: string, text: string) {
  const config = await getWhatsAppConfig();
  if (!config.apiKey || !config.sessionId) {
    console.error("WhatsApp not configured");
    return null;
  }

  const response = await fetch(
    `${config.apiUrl}/api/sessions/${config.sessionId}/send`,
    {
      method: "POST",
      headers: {
        "x-api-key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, text }),
    },
  );
  return response.json();
}
