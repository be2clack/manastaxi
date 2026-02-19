const API_KEY = process.env.AVIATIONSTACK_API_KEY;
const BASE_URL = "https://api.aviationstack.com/v1";

export type Flight = {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    iata: string;
    scheduled: string;
    estimated: string | null;
    actual: string | null;
  };
  arrival: {
    airport: string;
    iata: string;
    scheduled: string;
    estimated: string | null;
    actual: string | null;
  };
  airline: {
    name: string;
    iata: string;
  };
  flight: {
    number: string;
    iata: string;
  };
};

// Cache to avoid excessive API calls
let flightsCache: { data: Flight[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getManasFlights(
  type: "arrivals" | "departures" = "arrivals"
): Promise<Flight[]> {
  // Return cached data if fresh
  if (flightsCache && Date.now() - flightsCache.timestamp < CACHE_TTL) {
    return filterFlights(flightsCache.data, type);
  }

  if (!API_KEY) {
    return getMockFlights(type);
  }

  try {
    const iataCode = "FRU"; // Manas Airport IATA code
    const params = new URLSearchParams({
      access_key: API_KEY,
      [type === "arrivals" ? "arr_iata" : "dep_iata"]: iataCode,
      limit: "50",
    });

    const res = await fetch(`${BASE_URL}/flights?${params}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error("AviationStack API error:", res.status);
      return getMockFlights(type);
    }

    const json = await res.json();
    flightsCache = { data: json.data || [], timestamp: Date.now() };
    return json.data || [];
  } catch (error) {
    console.error("AviationStack fetch error:", error);
    return getMockFlights(type);
  }
}

function filterFlights(flights: Flight[], type: "arrivals" | "departures") {
  return flights.filter((f) =>
    type === "arrivals"
      ? f.arrival?.iata === "FRU"
      : f.departure?.iata === "FRU"
  );
}

export async function searchFlight(flightNumber: string): Promise<Flight[]> {
  if (!API_KEY) {
    return getMockFlights("arrivals").filter((f) =>
      f.flight.iata.toLowerCase().includes(flightNumber.toLowerCase())
    );
  }

  try {
    const params = new URLSearchParams({
      access_key: API_KEY,
      flight_iata: flightNumber.replace(/\s/g, ""),
    });

    const res = await fetch(`${BASE_URL}/flights?${params}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

function getMockFlights(type: "arrivals" | "departures"): Flight[] {
  const now = new Date();
  const airlines = [
    { name: "Air Manas", iata: "ZM" },
    { name: "Turkish Airlines", iata: "TK" },
    { name: "Pegasus Airlines", iata: "PC" },
    { name: "Aeroflot", iata: "SU" },
    { name: "S7 Airlines", iata: "S7" },
    { name: "Air Astana", iata: "KC" },
    { name: "Ural Airlines", iata: "U6" },
    { name: "FlyDubai", iata: "FZ" },
  ];

  const cities = [
    { airport: "Istanbul Airport", iata: "IST" },
    { airport: "Sheremetyevo", iata: "SVO" },
    { airport: "Almaty Airport", iata: "ALA" },
    { airport: "Dubai International", iata: "DXB" },
    { airport: "Novosibirsk Tolmachevo", iata: "OVB" },
    { airport: "Osh Airport", iata: "OSS" },
    { airport: "Antalya Airport", iata: "AYT" },
    { airport: "Delhi Indira Gandhi", iata: "DEL" },
  ];

  const statuses = ["scheduled", "active", "landed", "delayed"];

  return airlines.map((airline, i) => {
    const city = cities[i % cities.length];
    const hours = Math.floor(i * 1.5);
    const scheduled = new Date(now);
    scheduled.setHours(now.getHours() + hours - 2);

    return {
      flight_date: now.toISOString().split("T")[0],
      flight_status: statuses[i % statuses.length],
      departure: {
        airport: type === "departures" ? "Manas International" : city.airport,
        iata: type === "departures" ? "FRU" : city.iata,
        scheduled: scheduled.toISOString(),
        estimated: null,
        actual: null,
      },
      arrival: {
        airport: type === "arrivals" ? "Manas International" : city.airport,
        iata: type === "arrivals" ? "FRU" : city.iata,
        scheduled: new Date(
          scheduled.getTime() + (2 + Math.random() * 4) * 3600000
        ).toISOString(),
        estimated: null,
        actual: null,
      },
      airline: { name: airline.name, iata: airline.iata },
      flight: {
        number: `${airline.iata}${100 + i * 17}`,
        iata: `${airline.iata}${100 + i * 17}`,
      },
    };
  });
}
