import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.name || !data.phone || !data.pickupDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, phone, pickupDate" },
        { status: 400 }
      );
    }

    const result = await db
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
        notes: data.notes || null,
        source: data.source || "api",
      })
      .returning();

    return NextResponse.json({
      success: true,
      booking: result[0],
    });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
