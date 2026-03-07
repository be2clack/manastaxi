import { db } from "@/db";
import { drivers, bookings, orderEvents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  sendTelegramMessage,
  editTelegramMessage,
  deleteTelegramMessage,
  answerCallbackQuery,
} from "./client";

export async function handleDriverUpdate(update: any) {
  // 1. Handle /start command -> request phone number
  if (update.message?.text === "/start") {
    const chatId = String(update.message.chat.id);
    await sendTelegramMessage(
      "driver",
      chatId,
      "👋 Добро пожаловать в систему Manas Taxi для водителей!\n\nДля регистрации отправьте ваш номер телефона.",
      {
        keyboard: [
          [{ text: "📱 Отправить номер телефона", request_contact: true }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    );
    return;
  }

  // 2. Handle contact shared -> verify phone -> save chatId
  if (update.message?.contact) {
    const chatId = String(update.message.chat.id);
    const phone = update.message.contact.phone_number;
    const cleanPhone = phone.replace(/[^0-9+]/g, "");

    // Try to find driver by phone (try with and without +)
    const phoneVariants = [
      cleanPhone,
      cleanPhone.replace(/^\+/, ""),
      `+${cleanPhone.replace(/^\+/, "")}`,
    ];

    let driver = null;
    for (const variant of phoneVariants) {
      const [found] = await db
        .select()
        .from(drivers)
        .where(eq(drivers.phone, variant));
      if (found) {
        driver = found;
        break;
      }
    }

    if (!driver) {
      await sendTelegramMessage(
        "driver",
        chatId,
        "❌ Ваш номер телефона не найден в системе.\n\nОбратитесь к администратору для регистрации.",
      );
      return;
    }

    // Save telegram chat ID
    await db
      .update(drivers)
      .set({ telegramChatId: chatId })
      .where(eq(drivers.id, driver.id));

    await sendTelegramMessage(
      "driver",
      chatId,
      `✅ Вы успешно подключены!\n\n👤 ${driver.name}\n🚗 ${driver.vehicleMake} (${driver.vehiclePlate})\n\nТеперь вы будете получать заказы.`,
      { remove_keyboard: true },
    );
    return;
  }

  // 3. Handle callback queries
  if (update.callback_query) {
    const data = update.callback_query.data;
    const chatId = String(update.callback_query.message.chat.id);
    const messageId = update.callback_query.message.message_id;
    const callbackId = update.callback_query.id;

    // Accept order: accept_order_123
    if (data.startsWith("accept_order_")) {
      const bookingId = parseInt(data.replace("accept_order_", ""));
      await handleAcceptOrder(chatId, messageId, callbackId, bookingId);
      return;
    }

    // Complete order: complete_order_123
    if (data.startsWith("complete_order_")) {
      const bookingId = parseInt(data.replace("complete_order_", ""));
      await handleCompleteOrder(chatId, messageId, callbackId, bookingId);
      return;
    }

    // Force majeure: force_majeure_123
    if (data.startsWith("force_majeure_")) {
      const bookingId = parseInt(data.replace("force_majeure_", ""));
      await handleForceMajeureStart(chatId, messageId, callbackId, bookingId);
      return;
    }

    // Force majeure reason: fm_reason_TYPE_bookingId
    if (data.startsWith("fm_reason_")) {
      const parts = data.replace("fm_reason_", "").split("_");
      const bookingId = parseInt(parts.pop()!);
      const reason = parts.join("_");
      await handleForceMajeureReason(
        chatId,
        messageId,
        callbackId,
        bookingId,
        reason,
      );
      return;
    }

    await answerCallbackQuery("driver", callbackId);
  }
}

async function handleAcceptOrder(
  chatId: string,
  messageId: number,
  callbackId: string,
  bookingId: number,
) {
  // 1. Find the booking
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId));
  if (!booking || booking.status !== "driver_search") {
    await answerCallbackQuery(
      "driver",
      callbackId,
      "⚠️ Заказ уже принят другим водителем",
    );
    await deleteTelegramMessage("driver", chatId, messageId);
    return;
  }

  // 2. Find the driver
  const [driver] = await db
    .select()
    .from(drivers)
    .where(eq(drivers.telegramChatId, chatId));
  if (!driver) {
    await answerCallbackQuery("driver", callbackId, "❌ Водитель не найден");
    return;
  }

  if (driver.hasActiveOrder) {
    await answerCallbackQuery(
      "driver",
      callbackId,
      "⚠️ У вас уже есть активный заказ",
    );
    return;
  }

  // 3. Assign the order
  await db
    .update(bookings)
    .set({
      driverId: driver.id,
      status: "assigned",
    })
    .where(eq(bookings.id, bookingId));

  await db
    .update(drivers)
    .set({
      hasActiveOrder: true,
    })
    .where(eq(drivers.id, driver.id));

  // 4. Log event
  await db.insert(orderEvents).values({
    bookingId,
    event: "driver_accepted",
    driverId: driver.id,
  });

  // 5. Answer callback
  await answerCallbackQuery("driver", callbackId, "✅ Заказ принят!");

  // 6. Delete messages from ALL other drivers
  const [dispatchEvent] = await db
    .select()
    .from(orderEvents)
    .where(
      and(
        eq(orderEvents.bookingId, bookingId),
        eq(orderEvents.event, "driver_search"),
      ),
    );

  if (dispatchEvent?.details) {
    const sentMessages =
      (dispatchEvent.details as Record<string, any>).sentMessages || [];
    for (const msg of sentMessages) {
      if (msg.chatId !== chatId) {
        await deleteTelegramMessage("driver", msg.chatId, msg.messageId);
      }
    }
  }

  // 7. Send FULL details to the accepting driver (with Complete/Force Majeure buttons)
  const detailsText =
    `✅ <b>Заказ #${booking.id} за вами!</b>\n\n` +
    `👤 Клиент: ${booking.name}\n` +
    `📱 Телефон: ${booking.phone}\n` +
    (booking.flightNumber ? `✈️ Рейс: ${booking.flightNumber}\n` : "") +
    (booking.language ? `🗣 Язык клиента: ${booking.language}\n` : "") +
    (booking.needsSign
      ? `📋 Табличка: ${booking.signText || booking.name}\n`
      : "") +
    (booking.notes ? `📝 Примечания: ${booking.notes}\n` : "") +
    `\n⏰ Время подачи: ${booking.pickupDate} ${booking.pickupTime || ""}`;

  await editTelegramMessage("driver", chatId, messageId, detailsText, {
    inline_keyboard: [
      [
        {
          text: "✅ Завершить заказ",
          callback_data: `complete_order_${bookingId}`,
        },
      ],
      [
        {
          text: "⚠️ Форс-мажор",
          callback_data: `force_majeure_${bookingId}`,
        },
      ],
    ],
  });
}

async function handleCompleteOrder(
  chatId: string,
  messageId: number,
  callbackId: string,
  bookingId: number,
) {
  const [driver] = await db
    .select()
    .from(drivers)
    .where(eq(drivers.telegramChatId, chatId));
  if (!driver) return;

  // Update booking
  await db
    .update(bookings)
    .set({ status: "completed" })
    .where(eq(bookings.id, bookingId));

  // Update driver
  await db
    .update(drivers)
    .set({
      hasActiveOrder: false,
      totalTrips: (driver.totalTrips ?? 0) + 1,
    })
    .where(eq(drivers.id, driver.id));

  // Log event
  await db.insert(orderEvents).values({
    bookingId,
    event: "completed",
    driverId: driver.id,
  });

  await answerCallbackQuery("driver", callbackId, "✅ Заказ завершён!");

  await editTelegramMessage(
    "driver",
    chatId,
    messageId,
    `✅ <b>Заказ #${bookingId} завершён!</b>\n\nСпасибо за работу! Ожидайте следующие заказы.`,
  );
}

async function handleForceMajeureStart(
  chatId: string,
  messageId: number,
  callbackId: string,
  bookingId: number,
) {
  await answerCallbackQuery("driver", callbackId);

  await editTelegramMessage(
    "driver",
    chatId,
    messageId,
    `⚠️ <b>Форс-мажор по заказу #${bookingId}</b>\n\nУкажите причину:`,
    {
      inline_keyboard: [
        [
          {
            text: "🔧 Поломка машины",
            callback_data: `fm_reason_breakdown_${bookingId}`,
          },
        ],
        [
          {
            text: "🚗 ДТП",
            callback_data: `fm_reason_accident_${bookingId}`,
          },
        ],
        [
          {
            text: "🚦 Пробка, не успеваю",
            callback_data: `fm_reason_traffic_${bookingId}`,
          },
        ],
        [
          {
            text: "❓ Другое",
            callback_data: `fm_reason_other_${bookingId}`,
          },
        ],
      ],
    },
  );
}

async function handleForceMajeureReason(
  chatId: string,
  messageId: number,
  callbackId: string,
  bookingId: number,
  reason: string,
) {
  const reasonLabels: Record<string, string> = {
    breakdown: "Поломка машины",
    accident: "ДТП",
    traffic: "Пробка, не успеваю",
    other: "Другое",
  };

  const [driver] = await db
    .select()
    .from(drivers)
    .where(eq(drivers.telegramChatId, chatId));
  if (!driver) return;

  // Reset driver
  await db
    .update(drivers)
    .set({ hasActiveOrder: false })
    .where(eq(drivers.id, driver.id));

  // Reset booking — mark urgent, remove driver, set back to driver_search
  await db
    .update(bookings)
    .set({
      driverId: null,
      status: "driver_search",
      isUrgent: true,
    })
    .where(eq(bookings.id, bookingId));

  // Log event
  await db.insert(orderEvents).values({
    bookingId,
    event: "force_majeure",
    driverId: driver.id,
    details: { reason: reasonLabels[reason] || reason },
  });

  await answerCallbackQuery("driver", callbackId, "Форс-мажор зафиксирован");

  await editTelegramMessage(
    "driver",
    chatId,
    messageId,
    `⚠️ Форс-мажор по заказу #${bookingId} зафиксирован.\nПричина: ${reasonLabels[reason] || reason}\n\nЗаказ будет переназначен другому водителю.`,
  );
}
