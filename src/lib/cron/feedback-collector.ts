import { db } from "@/db";
import { bookings, orderEvents, feedback, conversations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendTelegramMessage } from "@/lib/telegram/client";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";

export async function collectFeedback() {
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);

  // Find completed bookings
  const completedOrders = await db
    .select()
    .from(bookings)
    .where(eq(bookings.status, "completed"));

  for (const order of completedOrders) {
    // Check if feedback already exists
    const [existingFeedback] = await db
      .select()
      .from(feedback)
      .where(eq(feedback.bookingId, order.id));
    if (existingFeedback) continue;

    // Check if feedback request was already sent
    const [feedbackEvent] = await db
      .select()
      .from(orderEvents)
      .where(
        and(
          eq(orderEvents.bookingId, order.id),
          eq(orderEvents.event, "feedback_received"),
        ),
      );
    if (feedbackEvent) continue;

    // Check completion time — must be at least 10 min ago
    const [completionEvent] = await db
      .select()
      .from(orderEvents)
      .where(
        and(
          eq(orderEvents.bookingId, order.id),
          eq(orderEvents.event, "completed"),
        ),
      );
    if (!completionEvent || completionEvent.createdAt! > tenMinAgo) continue;

    // Find the conversation for this booking
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.bookingId, order.id));

    // Build feedback message with inline buttons (star ratings)
    const ratingButtons = [1, 2, 3, 4, 5].map((n) => ({
      text: "⭐".repeat(n),
      callback_data: `feedback_driver_${n}_${order.id}`,
    }));

    const feedbackText = getFeedbackMessage(order.language || "ru");

    if (conv?.channel === "telegram") {
      await sendTelegramMessage("client", conv.externalChatId, feedbackText, {
        inline_keyboard: [ratingButtons],
      });
    } else if (conv?.channel === "whatsapp" && conv.clientPhone) {
      await sendWhatsAppMessage(
        conv.clientPhone,
        feedbackText + "\n\nОтветьте числом от 1 до 5.",
      );
    }
  }
}

function getFeedbackMessage(language: string): string {
  const messages: Record<string, string> = {
    ru: "Здравствуйте! Как прошла ваша поездка? Оцените водителя:",
    en: "Hello! How was your trip? Please rate the driver:",
    zh: "您好！旅途如何？请评价司机：",
    ky: "Саламатсызбы! Жол кандай болду? Айдоочуну баалаңыз:",
    hi: "नमस्ते! आपकी यात्रा कैसी रही? कृपया ड्राइवर को रेट करें:",
    ar: "مرحبا! كيف كانت رحلتك؟ يرجى تقييم السائق:",
  };
  return messages[language] || messages.en;
}
