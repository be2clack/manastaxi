import { db } from "@/db";
import { bookings, users } from "@/db/schema";
import { eq, isNotNull } from "drizzle-orm";
import { sendTelegramMessage } from "@/lib/telegram/client";

export async function checkStaleOrders() {
  // Find orders stuck in driver_search status
  const staleOrders = await db
    .select()
    .from(bookings)
    .where(eq(bookings.status, "driver_search"));

  if (staleOrders.length === 0) return;

  // Get admin users with Telegram
  const admins = await db
    .select()
    .from(users)
    .where(isNotNull(users.telegramChatId));

  for (const order of staleOrders) {
    for (const admin of admins) {
      await sendTelegramMessage(
        "admin",
        admin.telegramChatId!,
        `🔴 <b>Заказ #${order.id} не принят!</b>\n\n` +
          `Статус: Поиск водителя\n` +
          `Время подачи: ${order.pickupDate} ${order.pickupTime || ""}\n` +
          (order.isUrgent ? `⚠️ СРОЧНЫЙ (форс-мажор)\n` : "") +
          `\nТребуется ручное вмешательство.`,
      );
    }
  }
}
