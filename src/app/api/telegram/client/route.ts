import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  conversations,
  messages,
  feedback,
  drivers,
  bookings,
  orderEvents,
} from "@/db/schema";
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

    // Handle callback queries (for feedback buttons)
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
  chatId: string,
  data: string,
  callbackQueryId: string,
) {
  await answerCallbackQuery("client", callbackQueryId);

  // feedback_driver_N_bookingId
  if (data.startsWith("feedback_driver_")) {
    const parts = data.replace("feedback_driver_", "").split("_");
    const rating = parseInt(parts[0]);
    const bookingId = parseInt(parts[1]);

    // Store driver rating temporarily in orderEvents metadata
    await db.insert(orderEvents).values({
      bookingId,
      event: "feedback_received",
      details: { driverRating: rating, step: "driver_rated" },
    });

    // Ask for vehicle rating
    const vehicleButtons = [1, 2, 3, 4, 5].map((n) => ({
      text: "⭐".repeat(n),
      callback_data: `feedback_vehicle_${n}_${bookingId}`,
    }));

    await sendTelegramMessage(
      "client",
      chatId,
      "Спасибо! Теперь оцените состояние машины:",
      {
        inline_keyboard: [vehicleButtons],
      },
    );
    return;
  }

  // feedback_vehicle_N_bookingId
  if (data.startsWith("feedback_vehicle_")) {
    const parts = data.replace("feedback_vehicle_", "").split("_");
    const vehicleRating = parseInt(parts[0]);
    const bookingId = parseInt(parts[1]);

    // Get the driver rating from events
    const events = await db
      .select()
      .from(orderEvents)
      .where(
        and(
          eq(orderEvents.bookingId, bookingId),
          eq(orderEvents.event, "feedback_received"),
        ),
      );

    const driverRating =
      (events[0]?.details as Record<string, unknown>)?.driverRating as number ||
      5;

    // Get booking to find driver
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));
    if (!booking?.driverId) return;

    // Save feedback
    await db.insert(feedback).values({
      bookingId,
      driverId: booking.driverId,
      ratingDriver: driverRating,
      ratingVehicle: vehicleRating,
      language: booking.language || "ru",
    });

    // Recalculate driver average rating
    const allFeedback = await db
      .select()
      .from(feedback)
      .where(eq(feedback.driverId, booking.driverId));
    const avgRating =
      allFeedback.reduce((sum, f) => sum + f.ratingDriver, 0) /
      allFeedback.length;
    await db
      .update(drivers)
      .set({ rating: String(avgRating.toFixed(2)) })
      .where(eq(drivers.id, booking.driverId));

    // Thank the client
    await sendTelegramMessage(
      "client",
      chatId,
      "Спасибо за вашу оценку! 🙏\nБудем рады видеть вас снова. Manas Taxi 🚕",
    );
    return;
  }

  // feedback_skip_bookingId
  if (data.startsWith("feedback_skip_")) {
    await sendTelegramMessage(
      "client",
      chatId,
      "Спасибо! До свидания! 🙏",
    );
  }
}
