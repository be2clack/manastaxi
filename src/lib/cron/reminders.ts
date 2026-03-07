import { db } from "@/db";
import { bookings, drivers } from "@/db/schema";
import { eq, and, isNotNull, lte, gte } from "drizzle-orm";
import { sendTelegramMessage } from "@/lib/telegram/client";

export async function sendDriverReminders() {
  const now = new Date();
  const thirtyMinLater = new Date(now.getTime() + 30 * 60 * 1000);
  const twentyNineMinLater = new Date(now.getTime() + 29 * 60 * 1000);

  // Find assigned bookings where scheduledAt is ~30 min from now
  const upcomingOrders = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "assigned"),
        isNotNull(bookings.driverId),
        isNotNull(bookings.scheduledAt),
        lte(bookings.scheduledAt, thirtyMinLater),
        gte(bookings.scheduledAt, twentyNineMinLater),
      ),
    );

  for (const order of upcomingOrders) {
    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, order.driverId!));
    if (!driver?.telegramChatId) continue;

    await sendTelegramMessage(
      "driver",
      driver.telegramChatId,
      `⏰ <b>Напоминание!</b>\n\nЗаказ #${order.id} через 30 минут.\nВремя подачи: ${order.pickupTime || ""}\n\nНе забудьте!`,
    );
  }
}
