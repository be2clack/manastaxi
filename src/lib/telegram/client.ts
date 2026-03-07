import { db } from "@/db";
import { telegramBotSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getBotToken(
  botType: "client" | "driver" | "admin",
): Promise<string | null> {
  const [bot] = await db
    .select()
    .from(telegramBotSettings)
    .where(eq(telegramBotSettings.botType, botType));
  return bot?.token || null;
}

export async function sendTelegramMessage(
  botType: "client" | "driver" | "admin",
  chatId: string,
  text: string,
  replyMarkup?: object,
): Promise<any> {
  const token = await getBotToken(botType);
  if (!token) {
    console.error(`Telegram bot ${botType} not configured`);
    return null;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    },
  );
  return response.json();
}

export async function editTelegramMessage(
  botType: "client" | "driver" | "admin",
  chatId: string,
  messageId: number,
  text: string,
  replyMarkup?: object,
): Promise<any> {
  const token = await getBotToken(botType);
  if (!token) return null;

  const response = await fetch(
    `https://api.telegram.org/bot${token}/editMessageText`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    },
  );
  return response.json();
}

export async function deleteTelegramMessage(
  botType: "client" | "driver" | "admin",
  chatId: string,
  messageId: number,
): Promise<any> {
  const token = await getBotToken(botType);
  if (!token) return null;

  const response = await fetch(
    `https://api.telegram.org/bot${token}/deleteMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
    },
  );
  return response.json();
}

export async function answerCallbackQuery(
  botType: "client" | "driver" | "admin",
  callbackQueryId: string,
  text?: string,
): Promise<any> {
  const token = await getBotToken(botType);
  if (!token) return null;

  const response = await fetch(
    `https://api.telegram.org/bot${token}/answerCallbackQuery`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || "",
      }),
    },
  );
  return response.json();
}

export async function setWebhook(
  botType: "client" | "driver" | "admin",
  url: string,
): Promise<any> {
  const token = await getBotToken(botType);
  if (!token) return { ok: false, description: "Bot not configured" };

  const response = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    },
  );
  return response.json();
}
