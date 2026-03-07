import { NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { processClientMessage } from "@/lib/ai/chat-service";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";
import { detectCountryFromPhone } from "@/lib/phone-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract message data from Baileys webhook format
    // The exact format depends on Baileys webhook config, handle common formats
    const senderPhone = body.from || body.sender || body.phone || "";
    const messageText = body.text || body.message || body.body || "";
    const chatId = body.chatId || body.from || senderPhone;

    if (!senderPhone || !messageText) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Clean phone number
    const cleanPhone = senderPhone.replace(/[^0-9+]/g, "");

    // Find or create conversation
    let [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.externalChatId, chatId),
          eq(conversations.channel, "whatsapp"),
        ),
      );

    if (!conversation) {
      const country = detectCountryFromPhone(cleanPhone);
      const [newConv] = await db
        .insert(conversations)
        .values({
          channel: "whatsapp",
          externalChatId: chatId,
          clientPhone: cleanPhone,
          clientPhoneCountryCode: country?.countryCode || null,
          clientCountry: country?.code || null,
          clientCountryName: country?.name || null,
        })
        .returning();
      conversation = newConv;
    }

    // Save client message
    await db.insert(messages).values({
      conversationId: conversation.id,
      role: "client",
      content: messageText,
    });

    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversation.id));

    // Process through AI
    const response = await processClientMessage(conversation.id, messageText);

    // Send response back via WhatsApp
    await sendWhatsAppMessage(cleanPhone, response);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
