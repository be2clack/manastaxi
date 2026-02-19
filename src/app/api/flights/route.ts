import { NextRequest, NextResponse } from "next/server";
import { getManasFlights, searchFlight } from "@/lib/aviationstack";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") as "arrivals" | "departures") || "arrivals";
  const flightNumber = searchParams.get("flight");

  if (flightNumber) {
    const results = await searchFlight(flightNumber);
    return NextResponse.json({ data: results });
  }

  const flights = await getManasFlights(type);
  return NextResponse.json({ data: flights });
}
