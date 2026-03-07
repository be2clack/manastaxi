import { db } from "@/db";
import {
  routes,
  vehicleClasses,
  routePrices,
  tours,
  bookings,
} from "@/db/schema";
import { eq, ilike, and } from "drizzle-orm";

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  switch (name) {
    case "get_routes":
      return handleGetRoutes();
    case "search_route":
      return handleSearchRoute(args.query as string);
    case "get_route_price":
      return handleGetRoutePrice(
        args.routeId as number,
        args.vehicleClassSlug as string,
      );
    case "get_vehicle_classes":
      return handleGetVehicleClasses();
    case "get_tours":
      return handleGetTours();
    case "get_flight_info":
      return handleGetFlightInfo(args.flightNumber as string);
    case "create_booking":
      return handleCreateBooking(args);
    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}

async function handleGetRoutes(): Promise<string> {
  const results = await db
    .select({
      id: routes.id,
      slug: routes.slug,
      fromLocation: routes.fromLocation,
      toLocation: routes.toLocation,
      distanceKm: routes.distanceKm,
      durationMin: routes.durationMin,
      priceSom: routes.priceSom,
      priceUsd: routes.priceUsd,
      isPopular: routes.isPopular,
    })
    .from(routes)
    .where(eq(routes.isActive, true))
    .orderBy(routes.sortOrder);

  return JSON.stringify({ routes: results });
}

async function handleSearchRoute(query: string): Promise<string> {
  const results = await db
    .select({
      id: routes.id,
      slug: routes.slug,
      fromLocation: routes.fromLocation,
      toLocation: routes.toLocation,
      distanceKm: routes.distanceKm,
      durationMin: routes.durationMin,
      priceSom: routes.priceSom,
      priceUsd: routes.priceUsd,
    })
    .from(routes)
    .where(and(eq(routes.isActive, true), ilike(routes.toLocation, `%${query}%`)));

  if (results.length === 0) {
    // Also search fromLocation
    const fromResults = await db
      .select({
        id: routes.id,
        slug: routes.slug,
        fromLocation: routes.fromLocation,
        toLocation: routes.toLocation,
        distanceKm: routes.distanceKm,
        durationMin: routes.durationMin,
        priceSom: routes.priceSom,
        priceUsd: routes.priceUsd,
      })
      .from(routes)
      .where(
        and(eq(routes.isActive, true), ilike(routes.fromLocation, `%${query}%`)),
      );
    return JSON.stringify({ routes: fromResults });
  }

  return JSON.stringify({ routes: results });
}

async function handleGetRoutePrice(
  routeId: number,
  vehicleClassSlug: string,
): Promise<string> {
  const results = await db
    .select({
      priceSom: routePrices.priceSom,
      priceUsd: routePrices.priceUsd,
      vehicleClassName: vehicleClasses.name,
      vehicleClassSlug: vehicleClasses.slug,
      maxPassengers: vehicleClasses.maxPassengers,
      maxLuggage: vehicleClasses.maxLuggage,
    })
    .from(routePrices)
    .innerJoin(vehicleClasses, eq(routePrices.vehicleClassId, vehicleClasses.id))
    .where(
      and(
        eq(routePrices.routeId, routeId),
        eq(vehicleClasses.slug, vehicleClassSlug),
      ),
    );

  if (results.length === 0) {
    return JSON.stringify({
      error: "Price not found for this route and vehicle class combination",
    });
  }

  return JSON.stringify({ price: results[0] });
}

async function handleGetVehicleClasses(): Promise<string> {
  const results = await db
    .select({
      id: vehicleClasses.id,
      name: vehicleClasses.name,
      slug: vehicleClasses.slug,
      description: vehicleClasses.description,
      maxPassengers: vehicleClasses.maxPassengers,
      maxLuggage: vehicleClasses.maxLuggage,
    })
    .from(vehicleClasses)
    .where(eq(vehicleClasses.isActive, true))
    .orderBy(vehicleClasses.sortOrder);

  return JSON.stringify({ vehicleClasses: results });
}

async function handleGetTours(): Promise<string> {
  const results = await db
    .select({
      id: tours.id,
      slug: tours.slug,
      durationDays: tours.durationDays,
      priceUsd: tours.priceUsd,
      priceSom: tours.priceSom,
      maxGroup: tours.maxGroup,
      imageUrl: tours.imageUrl,
    })
    .from(tours)
    .where(eq(tours.isActive, true))
    .orderBy(tours.sortOrder);

  return JSON.stringify({ tours: results });
}

async function handleGetFlightInfo(flightNumber: string): Promise<string> {
  // Flight info is not stored in our database.
  // Return a placeholder indicating the feature is available but
  // real-time data would need an external API integration.
  return JSON.stringify({
    flightNumber,
    message:
      "Flight tracking is not yet integrated. Please ask the client to confirm their arrival time manually.",
  });
}

async function handleCreateBooking(
  args: Record<string, unknown>,
): Promise<string> {
  const vehicleClassSlug = args.vehicleClassSlug as string | undefined;
  let vehicleClassId: number | undefined;
  let totalPriceSom: string | undefined;
  let totalPriceUsd: string | undefined;

  // Resolve vehicle class ID from slug
  if (vehicleClassSlug) {
    const vc = await db
      .select({ id: vehicleClasses.id })
      .from(vehicleClasses)
      .where(eq(vehicleClasses.slug, vehicleClassSlug))
      .limit(1);

    if (vc[0]) {
      vehicleClassId = vc[0].id;

      // Get price for the route + vehicle class combination
      if (args.routeId) {
        const price = await db
          .select({
            priceSom: routePrices.priceSom,
            priceUsd: routePrices.priceUsd,
          })
          .from(routePrices)
          .where(
            and(
              eq(routePrices.routeId, args.routeId as number),
              eq(routePrices.vehicleClassId, vehicleClassId),
            ),
          )
          .limit(1);

        if (price[0]) {
          totalPriceSom = price[0].priceSom;
          totalPriceUsd = price[0].priceUsd;
        }
      }
    }
  }

  const [booking] = await db
    .insert(bookings)
    .values({
      name: args.name as string,
      phone: args.phone as string,
      routeId: (args.routeId as number) || null,
      vehicleClassId: vehicleClassId || null,
      pickupDate: args.pickupDate as string,
      pickupTime: (args.pickupTime as string) || null,
      flightNumber: (args.flightNumber as string) || null,
      passengers: (args.passengers as number) || 1,
      luggage: (args.luggage as number) || 1,
      needsSign: (args.needsSign as boolean) || false,
      signText: (args.signText as string) || null,
      notes: (args.notes as string) || null,
      channel: "whatsapp",
      source: "chatbot",
      totalPriceSom: totalPriceSom || null,
      totalPriceUsd: totalPriceUsd || null,
    })
    .returning({
      id: bookings.id,
      name: bookings.name,
      phone: bookings.phone,
      pickupDate: bookings.pickupDate,
      pickupTime: bookings.pickupTime,
      status: bookings.status,
      totalPriceSom: bookings.totalPriceSom,
      totalPriceUsd: bookings.totalPriceUsd,
    });

  return JSON.stringify({
    success: true,
    booking,
    message: `Booking #${booking.id} created successfully`,
  });
}
