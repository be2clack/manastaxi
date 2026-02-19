"use server";

import { db } from "@/db";
import {
  bookings,
  routes,
  tours,
  services,
  settings,
  contactMessages,
} from "@/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
    distanceKm: number;
    durationMin: number;
    priceSom: number;
    priceUsd: number;
    isPopular: boolean;
    isActive: boolean;
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

export async function updateTour(
  id: number,
  data: Partial<{
    durationDays: number;
    priceUsd: number;
    priceSom: number;
    maxGroup: number;
    isActive: boolean;
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
    isActive: boolean;
  }>
) {
  await db.update(services).set(data).where(eq(services.id, id));
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
