import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";

const CHATBOT_API_URL = process.env.CHATBOT_API_URL;

// Webhook endpoint for Baileys WhatsApp bot
// Receives messages from the bot server and creates bookings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "create_booking": {
        const result = await db
          .insert(bookings)
          .values({
            name: data.name || "WhatsApp User",
            phone: data.phone,
            flightNumber: data.flightNumber || null,
            customDestination: data.destination || null,
            pickupDate: data.date || new Date().toISOString().split("T")[0],
            pickupTime: data.time || null,
            passengers: data.passengers || 1,
            luggage: data.luggage || 1,
            notes: data.notes || null,
            source: "whatsapp_bot",
          })
          .returning();

        return NextResponse.json({
          success: true,
          bookingId: result[0]?.id,
          message: "Booking created successfully",
        });
      }

      case "get_routes": {
        const { routes: routesList } = await import("@/db/schema");
        const { eq, asc } = await import("drizzle-orm");
        const allRoutes = await db
          .select({
            toLocation: routesList.toLocation,
            priceSom: routesList.priceSom,
            priceUsd: routesList.priceUsd,
          })
          .from(routesList)
          .where(eq(routesList.isActive, true))
          .orderBy(asc(routesList.sortOrder));

        return NextResponse.json({ success: true, routes: allRoutes });
      }

      case "get_status": {
        return NextResponse.json({
          success: true,
          status: "online",
          service: "Manas Taxi",
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Chatbot webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Manas Taxi Chatbot API",
    actions: ["create_booking", "get_routes", "get_status"],
  });
}
