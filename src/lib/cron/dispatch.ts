import { db } from "@/db";
import {
  bookings,
  drivers,
  orderEvents,
  routes,
} from "@/db/schema";
import { eq, and, lte, isNotNull } from "drizzle-orm";
import { sendTelegramMessage } from "@/lib/telegram/client";

export async function dispatchPendingOrders() {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  // Find confirmed bookings where scheduledAt is within the next hour
  const pendingOrders = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "confirmed"),
        isNotNull(bookings.scheduledAt),
        lte(bookings.scheduledAt, oneHourLater),
      ),
    );

  for (const order of pendingOrders) {
    // Find matching drivers by vehicle class
    const availableDrivers = await db
      .select()
      .from(drivers)
      .where(
        and(
          eq(drivers.vehicleClassId, order.vehicleClassId!),
          eq(drivers.isActive, true),
          eq(drivers.hasActiveOrder, false),
          isNotNull(drivers.telegramChatId),
        ),
      );

    if (availableDrivers.length === 0) continue;

    // Update status
    await db
      .update(bookings)
      .set({ status: "driver_search" })
      .where(eq(bookings.id, order.id));

    // Get route info
    let routeInfo = "";
    if (order.routeId) {
      const [route] = await db
        .select()
        .from(routes)
        .where(eq(routes.id, order.routeId));
      if (route) routeInfo = `${route.fromLocation} → ${route.toLocation}`;
    }

    // Build message (WITHOUT client details)
    const isUrgentText = order.isUrgent ? "🚨 СРОЧНЫЙ " : "";
    const messageText =
      `${isUrgentText}🚕 <b>Новый заказ #${order.id}</b>\n\n` +
      `📍 Маршрут: ${routeInfo || order.customDestination || "Не указан"}\n` +
      `⏰ Время: ${order.pickupDate} ${order.pickupTime || ""}\n` +
      (order.needsSign ? `📋 Табличка: Да\n` : "") +
      `\n⚠️ Принимайте заказ только если уверены и успеете!`;

    // Send to all drivers, track message IDs
    const sentMessages: Array<{ chatId: string; messageId: number }> = [];

    for (const driver of availableDrivers) {
      const result = await sendTelegramMessage(
        "driver",
        driver.telegramChatId!,
        messageText,
        {
          inline_keyboard: [
            [
              {
                text: "✅ Принять заказ",
                callback_data: `accept_order_${order.id}`,
              },
            ],
          ],
        },
      );

      if (result?.result?.message_id) {
        sentMessages.push({
          chatId: driver.telegramChatId!,
          messageId: result.result.message_id,
        });
      }
    }

    // Log event with sent message IDs (for later deletion)
    await db.insert(orderEvents).values({
      bookingId: order.id,
      event: "driver_search",
      details: {
        driversNotified: availableDrivers.length,
        sentMessages,
      },
    });
  }
}
