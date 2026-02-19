"use server";

import { db } from "@/db";
import { bookings, contactMessages, routes } from "@/db/schema";
import { eq, ilike, and, asc } from "drizzle-orm";

export async function getRoutes(search?: string) {
  if (search) {
    return db
      .select()
      .from(routes)
      .where(
        and(
          eq(routes.isActive, true),
          ilike(routes.toLocation, `%${search}%`)
        )
      )
      .orderBy(asc(routes.sortOrder));
  }
  return db
    .select()
    .from(routes)
    .where(eq(routes.isActive, true))
    .orderBy(asc(routes.sortOrder));
}

export async function getPopularRoutes() {
  return db
    .select()
    .from(routes)
    .where(and(eq(routes.isActive, true), eq(routes.isPopular, true)))
    .orderBy(asc(routes.sortOrder));
}

export async function createBooking(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    email: (formData.get("email") as string) || undefined,
    flightNumber: (formData.get("flightNumber") as string) || undefined,
    routeId: formData.get("routeId")
      ? parseInt(formData.get("routeId") as string)
      : undefined,
    customDestination:
      (formData.get("customDestination") as string) || undefined,
    pickupDate: formData.get("pickupDate") as string,
    pickupTime: (formData.get("pickupTime") as string) || undefined,
    passengers: parseInt((formData.get("passengers") as string) || "1"),
    luggage: parseInt((formData.get("luggage") as string) || "1"),
    notes: (formData.get("notes") as string) || undefined,
    source: (formData.get("source") as string) || "website",
  };

  if (!data.name || !data.phone || !data.pickupDate) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    await db.insert(bookings).values(data);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create booking" };
  }
}

export async function createContactMessage(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    message: formData.get("message") as string,
  };

  if (!data.name || !data.email || !data.message) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    await db.insert(contactMessages).values(data);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to send message" };
  }
}

export async function getRouteById(id: number) {
  const result = await db
    .select()
    .from(routes)
    .where(eq(routes.id, id))
    .limit(1);
  return result[0] || null;
}
