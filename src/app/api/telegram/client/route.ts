import { NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { processClientMessage } from "@/lib/ai/chat-service";
import {
  sendTelegramMessage,
  answerCallbackQuery,
} from "@/lib/telegram/client";

export async function POST(request: Request) {
  try {
    const update = await request.json();

    // Handle /start command
    if (update.message?.text === "/start") {
      const chatId = String(update.message.chat.id);
      await sendTelegramMessage(
        "client",
        chatId,
        "Welcome to Manas Taxi!\n\nSend me a message to book a taxi transfer from/to Manas Airport.\n\nNapishite mne chtoby zakazat' taksi iz/v aeroport Manas.",
      );
      return NextResponse.json({ ok: true });
    }

    // Handle regular text message
    if (update.message?.text) {
      const chatId = String(update.message.chat.id);
      const text = update.message.text;
      const firstName = update.message.from?.first_name || "";
      const lastName = update.message.from?.last_name || "";
      const clientName = `${firstName} ${lastName}`.trim();

      // Find or create conversation
      let [conversation] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.externalChatId, chatId),
            eq(conversations.channel, "telegram"),
          ),
        );

      if (!conversation) {
        const [newConv] = await db
          .insert(conversations)
          .values({
            channel: "telegram",
            externalChatId: chatId,
            clientName: clientName || null,
          })
          .returning();
        conversation = newConv;
      } else if (clientName && !conversation.clientName) {
        await db
          .update(conversations)
          .set({ clientName })
          .where(eq(conversations.id, conversation.id));
      }

      // Save client message
      await db.insert(messages).values({
        conversationId: conversation.id,
        role: "client",
        content: text,
      });

      // Update timestamp
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversation.id));

      // Process through AI
      const response = await processClientMessage(conversation.id, text);

      // Send response via Telegram
      await sendTelegramMessage("client", chatId, response);

      return NextResponse.json({ ok: true });
    }

    // Handle callback queries (for feedback buttons later)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const chatId = String(update.callback_query.message.chat.id);

      // Handle feedback callbacks: feedback_driver_N_bookingId, feedback_vehicle_N_bookingId, feedback_skip_bookingId
      if (callbackData.startsWith("feedback_")) {
        await handleFeedbackCallback(
          chatId,
          callbackData,
          update.callback_query.id,
        );
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram client webhook error:", error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

async function handleFeedbackCallback(
  _chatId: string,
  _data: string,
  callbackQueryId: string,
) {
  // Will be fully implemented in the feedback cron task
  // For now, acknowledge the callback
  await answerCallbackQuery("client", callbackQueryId, "Spasibo!");
}
