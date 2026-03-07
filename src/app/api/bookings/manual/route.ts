import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { bookings, orderEvents } from "@/db/schema";
import { notifyNewOrder } from "@/lib/notifications";

export async function POST(request: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();

    const [booking] = await db
      .insert(bookings)
      .values({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        flightNumber: data.flightNumber || null,
        routeId: data.routeId || null,
        customDestination: data.customDestination || null,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime || null,
        passengers: data.passengers || 1,
        luggage: data.luggage || 1,
        vehicleClassId: data.vehicleClassId || null,
        needsSign: data.needsSign || false,
        signText: data.signText || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        notes: data.notes || null,
        channel: "manual",
        language: data.language || null,
        clientCountry: data.clientCountry || null,
        status: "confirmed", // Manual orders skip "new" status
      })
      .returning();

    await db.insert(orderEvents).values({
      bookingId: booking.id,
      event: "created",
      details: { createdBy: session.user?.email },
    });

    await notifyNewOrder(booking);

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Manual booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
