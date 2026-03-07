"use server";

import { db } from "@/db";
import {
  bookings,
  drivers,
  routes,
  routePrices,
  tours,
  services,
  settings,
  contactMessages,
  vehicleClasses,
  aiSettings,
  telegramBotSettings,
  conversations,
  messages,
  feedback,
  orderEvents,
} from "@/db/schema";
import { eq, desc, asc, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ============ VEHICLE CLASSES ============
export async function getVehicleClasses() {
  return db.select().from(vehicleClasses).orderBy(asc(vehicleClasses.sortOrder));
}

export async function createVehicleClass(data: {
  name: Record<string, string>;
  slug: string;
  description?: Record<string, string>;
  maxPassengers: number;
  maxLuggage: number;
  sortOrder?: number;
}) {
  await db.insert(vehicleClasses).values(data);
  revalidatePath("/admin/vehicle-classes");
}

export async function updateVehicleClass(
  id: number,
  data: Partial<{
    name: Record<string, string>;
    slug: string;
    description: Record<string, string>;
    maxPassengers: number;
    maxLuggage: number;
    sortOrder: number;
    isActive: boolean;
  }>
) {
  await db.update(vehicleClasses).set(data).where(eq(vehicleClasses.id, id));
  revalidatePath("/admin/vehicle-classes");
}

export async function deleteVehicleClass(id: number) {
  await db.delete(vehicleClasses).where(eq(vehicleClasses.id, id));
  revalidatePath("/admin/vehicle-classes");
}

// ============ BOOKINGS ============
export async function getBookings() {
  return db.select().from(bookings).orderBy(desc(bookings.createdAt));
}

export async function updateBookingStatus(
  id: number,
  status: "new" | "confirmed" | "in_progress" | "completed" | "cancelled"
) {
  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  revalidatePath("/admin/bookings");
}

export async function updateBooking(
  id: number,
  data: Partial<{
    name: string;
    phone: string;
    email: string | null;
    flightNumber: string | null;
    customDestination: string | null;
    pickupDate: string;
    pickupTime: string | null;
    passengers: number;
    luggage: number;
    notes: string | null;
    status: "new" | "confirmed" | "in_progress" | "completed" | "cancelled";
  }>
) {
  await db.update(bookings).set(data).where(eq(bookings.id, id));
  revalidatePath("/admin/bookings");
}

export async function deleteBooking(id: number) {
  await db.delete(bookings).where(eq(bookings.id, id));
  revalidatePath("/admin/bookings");
}

export async function getBookingStats() {
  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings);
  const newBookings = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(eq(bookings.status, "new"));
  const confirmed = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(eq(bookings.status, "confirmed"));
  const completed = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(eq(bookings.status, "completed"));

  return {
    total: Number(total[0]?.count || 0),
    new: Number(newBookings[0]?.count || 0),
    confirmed: Number(confirmed[0]?.count || 0),
    completed: Number(completed[0]?.count || 0),
  };
}

// ============ ROUTES ============
export async function getAdminRoutes() {
  return db.select().from(routes).orderBy(asc(routes.sortOrder));
}

export async function createRoute(data: {
  slug: string;
  fromLocation: string;
  toLocation: string;
  distanceKm: number;
  durationMin: number;
  priceSom: number;
  priceUsd: number;
  isPopular: boolean;
}) {
  await db.insert(routes).values(data);
  revalidatePath("/admin/routes");
  revalidatePath("/routes");
}

export async function updateRoute(
  id: number,
  data: Partial<{
    toLocation: string;
    fromLocation: string;
    distanceKm: number;
    durationMin: number;
    priceSom: number;
    priceUsd: number;
    isPopular: boolean;
    isActive: boolean;
    sortOrder: number;
  }>
) {
  await db.update(routes).set(data).where(eq(routes.id, id));
  revalidatePath("/admin/routes");
  revalidatePath("/routes");
}

export async function deleteRoute(id: number) {
  await db.delete(routes).where(eq(routes.id, id));
  revalidatePath("/admin/routes");
  revalidatePath("/routes");
}

// ============ TOURS ============
export async function getAdminTours() {
  return db.select().from(tours).orderBy(asc(tours.sortOrder));
}

export async function createTour(data: {
  slug: string;
  durationDays: number;
  priceUsd: number;
  priceSom: number;
  maxGroup: number;
}) {
  await db.insert(tours).values(data);
  revalidatePath("/admin/tours");
  revalidatePath("/tours");
}

export async function updateTour(
  id: number,
  data: Partial<{
    slug: string;
    durationDays: number;
    priceUsd: number;
    priceSom: number;
    maxGroup: number;
    isActive: boolean;
    sortOrder: number;
  }>
) {
  await db.update(tours).set(data).where(eq(tours.id, id));
  revalidatePath("/admin/tours");
  revalidatePath("/tours");
}

export async function deleteTour(id: number) {
  await db.delete(tours).where(eq(tours.id, id));
  revalidatePath("/admin/tours");
  revalidatePath("/tours");
}

// ============ SERVICES ============
export async function getAdminServices() {
  return db.select().from(services).orderBy(asc(services.sortOrder));
}

export async function updateService(
  id: number,
  data: Partial<{
    priceUsd: string;
    priceSom: string;
    iconName: string;
    isActive: boolean;
    sortOrder: number;
  }>
) {
  await db.update(services).set(data).where(eq(services.id, id));
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

export async function deleteService(id: number) {
  await db.delete(services).where(eq(services.id, id));
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

// ============ SETTINGS ============
export async function getSettings() {
  return db.select().from(settings).orderBy(asc(settings.key));
}

export async function updateSetting(key: string, value: string) {
  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  if (existing.length > 0) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
  revalidatePath("/admin/settings");
}

// ============ MESSAGES ============
export async function getContactMessages() {
  return db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));
}

export async function markMessageRead(id: number) {
  await db
    .update(contactMessages)
    .set({ isRead: true })
    .where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: number) {
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
}

// ============ AI SETTINGS ============
export async function getAiSettings() {
  return db.select().from(aiSettings);
}

export async function updateAiSetting(
  id: number,
  data: Partial<{
    provider: "openai" | "anthropic";
    model: string;
    apiKey: string;
    systemPrompt: string;
    temperature: string;
    isActive: boolean;
  }>
) {
  if (data.isActive) {
    // Deactivate all others first
    await db.update(aiSettings).set({ isActive: false });
  }
  await db.update(aiSettings).set(data).where(eq(aiSettings.id, id));
  revalidatePath("/admin/ai-settings");
}

// ============ DRIVERS ============
export async function getDrivers() {
  return db.select().from(drivers).orderBy(asc(drivers.name));
}

export async function createDriver(data: {
  name: string;
  phone: string;
  vehicleClassId: number;
  vehicleMake: string;
  vehiclePlate: string;
}) {
  await db.insert(drivers).values(data);
  revalidatePath("/admin/drivers");
}

export async function updateDriver(
  id: number,
  data: Partial<{
    name: string;
    phone: string;
    vehicleClassId: number;
    vehicleMake: string;
    vehiclePlate: string;
    isActive: boolean;
  }>
) {
  await db.update(drivers).set(data).where(eq(drivers.id, id));
  revalidatePath("/admin/drivers");
}

export async function deleteDriver(id: number) {
  await db.delete(drivers).where(eq(drivers.id, id));
  revalidatePath("/admin/drivers");
}

// ============ ROUTE PRICES ============
export async function getRoutePrices() {
  return db.select().from(routePrices);
}

export async function upsertRoutePrice(data: {
  routeId: number;
  vehicleClassId: number;
  priceSom: string;
  priceUsd: string;
}) {
  const existing = await db
    .select()
    .from(routePrices)
    .where(
      and(
        eq(routePrices.routeId, data.routeId),
        eq(routePrices.vehicleClassId, data.vehicleClassId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(routePrices)
      .set({ priceSom: data.priceSom, priceUsd: data.priceUsd })
      .where(eq(routePrices.id, existing[0].id));
  } else {
    await db.insert(routePrices).values(data);
  }
  revalidatePath("/admin/route-prices");
}

export async function bulkUpsertRoutePrices(
  prices: Array<{
    routeId: number;
    vehicleClassId: number;
    priceSom: string;
    priceUsd: string;
  }>
) {
  for (const price of prices) {
    await upsertRoutePrice(price);
  }
  revalidatePath("/admin/route-prices");
}

// ============ TELEGRAM BOT SETTINGS ============
export async function getTelegramSettings() {
  return db.select().from(telegramBotSettings);
}

export async function upsertTelegramSetting(data: {
  botType: "client" | "driver" | "admin";
  token: string;
  webhookUrl?: string;
  isActive: boolean;
}) {
  const existing = await db
    .select()
    .from(telegramBotSettings)
    .where(eq(telegramBotSettings.botType, data.botType))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(telegramBotSettings)
      .set({
        token: data.token,
        webhookUrl: data.webhookUrl,
        isActive: data.isActive,
      })
      .where(eq(telegramBotSettings.id, existing[0].id));
  } else {
    await db.insert(telegramBotSettings).values(data);
  }
  revalidatePath("/admin/telegram");
}

// ============ CONVERSATIONS ============
export async function getConversations() {
  return db.select().from(conversations).orderBy(desc(conversations.updatedAt));
}

export async function getConversationMessages(conversationId: number) {
  return db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

// ============ FEEDBACK ============
export async function getFeedback() {
  return db.select().from(feedback).orderBy(desc(feedback.createdAt));
}

// ============ ORDER EVENTS ============
export async function getOrderEvents() {
  return db.select().from(orderEvents).orderBy(desc(orderEvents.createdAt)).limit(200);
}
