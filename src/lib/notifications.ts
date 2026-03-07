import { db } from "@/db";
import { users } from "@/db/schema";
import { isNotNull } from "drizzle-orm";
import { sendTelegramMessage } from "@/lib/telegram/client";

export async function notifyAdmins(message: string) {
  const admins = await db
    .select()
    .from(users)
    .where(isNotNull(users.telegramChatId));

  for (const admin of admins) {
    if (admin.telegramChatId) {
      await sendTelegramMessage("admin", admin.telegramChatId, message);
    }
  }
}

export async function notifyNewOrder(booking: {
  id: number;
  name: string;
  phone: string;
  pickupDate: string;
  pickupTime: string | null;
}) {
  await notifyAdmins(
    `🆕 <b>Новый заказ #${booking.id}</b>\n\n` +
      `👤 ${booking.name}\n` +
      `📱 ${booking.phone}\n` +
      `📅 ${booking.pickupDate} ${booking.pickupTime || ""}`,
  );
}

export async function notifyForceMajeure(
  bookingId: number,
  driverName: string,
  reason: string,
) {
  await notifyAdmins(
    `⚠️ <b>Форс-мажор!</b>\n\n` +
      `Заказ #${bookingId}\n` +
      `Водитель: ${driverName}\n` +
      `Причина: ${reason}\n\n` +
      `Заказ переназначается автоматически.`,
  );
}

export async function notifyStaleOrder(
  bookingId: number,
  pickupDate: string,
  pickupTime: string | null,
  isUrgent: boolean,
) {
  await notifyAdmins(
    `🔴 <b>Заказ #${bookingId} не принят!</b>\n\n` +
      `Время подачи: ${pickupDate} ${pickupTime || ""}\n` +
      (isUrgent ? `⚠️ СРОЧНЫЙ (форс-мажор)\n` : "") +
      `\nТребуется ручное вмешательство.`,
  );
}

export async function notifyDriverAccepted(
  bookingId: number,
  driverName: string,
) {
  await notifyAdmins(
    `✅ <b>Заказ #${bookingId} принят</b>\n\n` + `Водитель: ${driverName}`,
  );
}

export async function notifyOrderCompleted(
  bookingId: number,
  driverName: string,
) {
  await notifyAdmins(
    `🏁 <b>Заказ #${bookingId} завершён</b>\n\n` + `Водитель: ${driverName}`,
  );
}
