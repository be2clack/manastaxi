export const botTools = [
  {
    name: "get_routes",
    description: "Get list of available taxi routes with prices",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "search_route",
    description: "Search for a route by destination name",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Destination name to search for",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_route_price",
    description: "Get price for a specific route and vehicle class",
    parameters: {
      type: "object",
      properties: {
        routeId: { type: "number", description: "Route ID" },
        vehicleClassSlug: {
          type: "string",
          description:
            "Vehicle class slug (economy, comfort, business, vip, minivan, minibus)",
        },
      },
      required: ["routeId", "vehicleClassSlug"],
    },
  },
  {
    name: "get_vehicle_classes",
    description: "Get list of available vehicle classes with descriptions",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_tours",
    description: "Get list of available tour packages",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_flight_info",
    description: "Get flight arrival/departure information",
    parameters: {
      type: "object",
      properties: {
        flightNumber: {
          type: "string",
          description: "Flight number (e.g., KC101)",
        },
      },
      required: ["flightNumber"],
    },
  },
  {
    name: "create_booking",
    description:
      "Create a taxi booking after all required information is collected",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Client full name" },
        phone: { type: "string", description: "Client phone number" },
        routeId: { type: "number", description: "Selected route ID" },
        vehicleClassSlug: { type: "string", description: "Vehicle class slug" },
        pickupDate: {
          type: "string",
          description: "Pickup date (YYYY-MM-DD)",
        },
        pickupTime: { type: "string", description: "Pickup time (HH:MM)" },
        flightNumber: {
          type: "string",
          description: "Flight number if applicable",
        },
        passengers: { type: "number", description: "Number of passengers" },
        luggage: { type: "number", description: "Number of luggage pieces" },
        needsSign: {
          type: "boolean",
          description: "Whether client needs a meeting sign",
        },
        signText: { type: "string", description: "Text on the meeting sign" },
        notes: { type: "string", description: "Additional notes" },
      },
      required: ["name", "phone", "routeId", "pickupDate", "pickupTime"],
    },
  },
];
