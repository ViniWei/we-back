// voice_client/modules/trips.module.ts
import axios from "axios";
import intent from "../intent";
import { PtLanguageHelper } from "../language/ptLanguageHelper";

const BACKEND_URL = "http://localhost:3000";

async function fetchTrips(token: string) {
  const res = await axios.get(`${BACKEND_URL}/trips`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status !== 200 || !Array.isArray(res.data)) {
    throw new Error("Error fetching trips.");
  }
  return res.data;
}

async function fetchPlannedTrips(token: string) {
  const trips = await fetchTrips(token);

  const planned = trips.filter(
    (t: any) => (t.status || "").toLowerCase().includes("plan")
  );

  if (planned.length === 0) {
    return { message: "No planned trips found.", trips: [] };
  }

  // Aqui devolvemos TUDO que veio do backend,
  // apenas adicionando/normalizando alguns campos úteis
  const enrichedTrips = planned.map((t: any) => ({
    // todos os campos originais
    ...t,
    // normalizações/conveniências:
    city: t.city ?? t.destination,
    startDate: t.startDate ?? t.start_date,
    endDate: t.endDate ?? t.end_date
  }));

  return {
    message: `Found ${enrichedTrips.length} planned trips.`,
    trips: enrichedTrips
  };
}

async function sendTripToBackend(trip: any, token: string) {
  try {
    const body = {
      city: trip.city,
      startDate: trip.startDate,
      endDate: trip.endDate || trip.startDate,
      status: "Planejando",
      estimated: trip.budget ? `R$ ${trip.budget}` : undefined
    };
    const res = await axios.post(`${BACKEND_URL}/trips`, body, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 201) {
      return { message: `Trip successfully created: ${trip.city}` };
    }
    return { error: "Error creating trip." };
  } catch (error: any) {
    console.error("Error creating trip:", error.message);
    return { error: `Error creating trip: ${error.message}` };
  }
}

function extractTripData(text: string): any | null {
  const { module, action } = intent.detect(text);
  if (module !== "trips") return null;

  if (action === "view") {
    return { __action__: "view" };
  }

  if (action === "create") {
    const norm = PtLanguageHelper.normalize(text);

    const cityMatch = norm.match(
      /viagem\s+(?:para|pra|pro|em)\s+([a-zçãéêíóúà\s-]+)/i
    );
    const city = cityMatch
      ? PtLanguageHelper.cleanTripCity(cityMatch[1])
      : null;

    const { startDate, endDate } = PtLanguageHelper.parseTripDateRange(text);
    const budget = PtLanguageHelper.extractTripBudget(text);

    return { __action__: "create", city, startDate, endDate, budget };
  }

  return null;
}

export async function execute(
  text: string,
  params: { userId: number; groupId: number; token?: string }
) {
  try {
    const data = extractTripData(text);
    if (!data) return { error: "Unable to process the command." };

    const token = params.token || "";

    if (data.__action__ === "view") {
      return await fetchPlannedTrips(token);
    }

    if (data.__action__ === "create") {
      if (!data.city) return { error: "City not detected." };
      if (!data.startDate) return { error: "No start date recognized." };
      return await sendTripToBackend(data, token);
    }

    return { error: "Unrecognized trip action." };
  } catch (error: any) {
    console.error("Execution error:", error.message);
    return { error: `Execution error: ${error.message}` };
  }
}

export default { execute };
