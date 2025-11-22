import { getAllTrips, createTrip } from "../../controllers/trips.controller";

const MONTHS: Record<string, number> = {
  janeiro: 1,
  jan: 1,
  fevereiro: 2,
  fev: 2,
  marco: 3,
  março: 3,
  mar: 3,
  abril: 4,
  abr: 4,
  maio: 5,
  mai: 5,
  junho: 6,
  jun: 6,
  julho: 7,
  jul: 7,
  agosto: 8,
  ago: 8,
  setembro: 9,
  set: 9,
  outubro: 10,
  out: 10,
  novembro: 11,
  nov: 11,
  dezembro: 12,
  dez: 12,
};

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function safeInt(value: any): number | null {
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

function parseDate(day: number, month: number, year?: number | null): Date {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const d = new Date(y, month - 1, day);
  return d;
}

function parseDateParts(
  dayStr: string,
  monthWord: string | null,
  yearStr: string | null,
  fallbackMonth: number | null,
  fallbackYear: number
): Date | null {
  const cleanDay = dayStr.replace(/[º°]/g, "").replace("primeiro", "1").trim();
  const day = safeInt(cleanDay);
  const month =
    monthWord && MONTHS[normalize(monthWord)]
      ? MONTHS[normalize(monthWord)]
      : fallbackMonth;
  const year = yearStr ? safeInt(yearStr) : fallbackYear;
  if (!day || !month) return null;
  return parseDate(day, month, year);
}

function cleanCity(name: string | null): string | null {
  if (!name) return null;
  let city = name.trim();
  city = city.replace(/^(o|a|os|as)\s+/i, "");
  city = city
    .replace(/\b(no|na|em|para|pra|pro|ao|a|de|do|da|dos|das)\b\s*$/gi, "")
    .replace(
      /\b(com\s+orcamento.*|com\s+orçamento.*|r\$.*|no\s+dia.*|do\s+dia.*|entre\s+os?\s+dias?.*|ate\s+o\s+dia.*|até\s+o\s+dia.*)/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
  city = city.replace(/\s+(no\s+dia|do\s+dia|com\s+orcamento.*)$/gi, "").trim();
  return city
    .split(" ")
    .map((w, i) =>
      ["de", "da", "do", "dos", "das"].includes(w.toLowerCase()) && i > 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(" ");
}

function extractDates(text: string): {
  startDate: string | null;
  endDate: string | null;
} {
  const t = normalize(text);
  const now = new Date();
  const currentYear = now.getFullYear();

  const fullRange = t.match(
    /(?:entre\s+(?:os\s+)?dias?\s+|dos?\s+dias?\s+|do\s+dia\s+|de\s+|no\s+dia\s+|dia\s+)?(\d{1,2}|1º|primeiro)[\/\-\.]?\s*(?:de|do|da)?\s*([a-zç0-9]*)?(?:\s*(?:de|do)\s*(\d{4}))?(?:\s*(?:ao|a|ate|até|e)\s*(?:o\s+)?(?:dia\s+)?)(\d{1,2}|1º|primeiro)[\/\-\.]?\s*(?:de|do|da)?\s*([a-zç0-9]*)?(?:\s*(?:de|do)\s*(\d{4}))?/i
  );
  if (fullRange) {
    let [, d1, m1, y1, d2, m2, y2] = fullRange;
    d1 = d1?.replace(/[º°]/g, "").replace("primeiro", "1") || "";
    d2 = d2?.replace(/[º°]/g, "").replace("primeiro", "1") || "";
    if (!m1 && m2) m1 = m2;

    const start = parseDateParts(
      d1,
      m1 || null,
      y1 || null,
      safeInt(m1),
      currentYear
    );
    const end = parseDateParts(
      d2,
      m2 || m1 || null,
      y2 || y1 || null,
      safeInt(m2 || m1),
      currentYear
    );

    if (start && end) {
      if (end < start) end.setFullYear(end.getFullYear() + 1);
      return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };
    }
  }

  const numericRange = t.match(
    /(\d{1,2})[\/\.\-](\d{1,2})(?:[\/\.\-](\d{2,4}))?(?:\s*(?:ao|a|ate|até|e)\s*)(\d{1,2})[\/\.\-](\d{1,2})(?:[\/\.\-](\d{2,4}))?/i
  );
  if (numericRange) {
    const [, d1, m1, y1, d2, m2, y2] = numericRange;
    const start = parseDateParts(d1, null, y1, parseInt(m1), currentYear);
    const end = parseDateParts(d2, null, y2, parseInt(m2), currentYear);
    if (start && end && end < start) end.setFullYear(end.getFullYear() + 1);
    return {
      startDate: start ? start.toISOString().split("T")[0] : null,
      endDate: end ? end.toISOString().split("T")[0] : null,
    };
  }

  const single = t.match(
    /(?:no\s+dia\s+|para\s+o\s+dia\s+|do\s+dia\s+|em\s+|dia\s+)?(\d{1,2}|1º|primeiro)[\/\-\.]?\s*(?:de|do|da)?\s*([a-zç0-9]+)?(?:\s*(?:de|do)\s*(\d{4}))?/i
  );
  if (single) {
    let [, d, m, y] = single;
    d = d?.replace(/[º°]/g, "").replace("primeiro", "1") || "";
    const date = parseDateParts(
      d,
      m || null,
      y || null,
      safeInt(m) || null,
      currentYear
    );
    return {
      startDate: date ? date.toISOString().split("T")[0] : null,
      endDate: date ? date.toISOString().split("T")[0] : null,
    };
  }

  return { startDate: null, endDate: null };
}

function extractBudget(text: string): number | null {
  const t = normalize(text);
  const match = t.match(
    /(?:r\$|\breais?\b|\bvalor\b|\borcamento\b|\borçamento\b|\bcusto\b|\bpreco\b|\bpreço\b|\bgastar\b|\bgasto\b|\binvestir\b|\bcustando\b|\bpor\b)[^\d]*(\d+(?:[\.\s]?\d{3})*(?:,\d{1,2})?)(?:\s*(mil))?/i
  );
  if (match) {
    let raw = match[1];
    const isMil = /mil/.test(match[2] || "");
    raw = raw
      .replace(/\s/g, "")
      .replace(/\.(?=\d{3}\b)/g, "")
      .replace(",", ".");
    let value = parseFloat(raw);
    if (isMil) value *= 1000;
    return isNaN(value) ? null : value;
  }
  return null;
}

async function fetchTrips(groupId: number, userId: number) {
  const mockReq: any = {
    user: { groupId, id: userId },
  };

  const mockRes: any = {
    data: null,
    statusCode: 200,
    status: (code: number) => {
      mockRes.statusCode = code;
      return mockRes;
    },
    json: (data: any) => {
      mockRes.data = data;
      return mockRes;
    },
    send: (data: any) => {
      mockRes.data = data;
      return mockRes;
    },
  };

  await getAllTrips(mockReq, mockRes);

  if (mockRes.statusCode !== 200 || !Array.isArray(mockRes.data))
    throw new Error("Error fetching trips.");
  return mockRes.data;
}

async function fetchPlannedTrips(groupId: number, userId: number) {
  const res = await fetchTrips(groupId, userId);
  const planned = res.filter((t: any) =>
    (t.status || "").toLowerCase().includes("plan")
  );
  if (planned.length === 0)
    return { message: "No planned trips found.", trips: [] };
  return {
    message: `Found ${planned.length} planned trips.`,
    trips: planned.map((t: any) => ({
      id: t.id,
      city: t.destination,
      startDate: t.start_date,
      endDate: t.end_date,
    })),
  };
}

async function sendTripToBackend(trip: any, groupId: number, userId: number) {
  try {
    const body = {
      city: trip.city,
      startDate: trip.startDate,
      endDate: trip.endDate || trip.startDate,
      status: "pending",
      budget: trip.budget,
    };

    const mockReq: any = {
      body,
      user: { groupId, id: userId },
    };

    const mockRes: any = {
      data: null,
      statusCode: 200,
      status: (code: number) => {
        mockRes.statusCode = code;
        return mockRes;
      },
      json: (data: any) => {
        mockRes.data = data;
        return mockRes;
      },
      send: (data: any) => {
        mockRes.data = data;
        return mockRes;
      },
    };

    await createTrip(mockReq, mockRes);

    if (mockRes.statusCode === 201) {
      return { message: `Trip successfully created: ${trip.city}` };
    }
    return { error: "Error creating trip." };
  } catch (error: any) {
    console.error("Error creating trip:", error.message);
    return { error: `Error creating trip: ${error.message}` };
  }
}

function extractTripData(text: string): any | null {
  const t = normalize(text);
  if (/ver\s+(viagens|proximas viagens|próximas viagens)/i.test(t))
    return { __action__: "view" };

  if (/(adicionar|marcar|programar|criar|planejar|viagem\s+para)/i.test(t)) {
    const cityMatch = t.match(
      /viagem\s+(?:para|pra|pro|em)\s+([a-zçãéêíóúà\s-]+)/i
    );
    const city = cityMatch ? cleanCity(cityMatch[1]) : null;
    const { startDate, endDate } = extractDates(t);
    const budget = extractBudget(t);
    return { __action__: "create", city, startDate, endDate, budget };
  }
  return null;
}

async function execute(
  text: string,
  user_id: number,
  group_id: number
): Promise<any> {
  try {
    const data = extractTripData(text);
    if (!data) return { error: "Unable to process the command." };

    if (!user_id || !group_id) {
      return { error: "Missing user/group." };
    }

    if (data.__action__ === "view")
      return await fetchPlannedTrips(group_id, user_id);

    if (data.__action__ === "create") {
      if (!data.city) return { error: "City not detected." };
      if (!data.startDate) return { error: "No start date recognized." };
      return await sendTripToBackend(data, group_id, user_id);
    }
    return { error: "Unrecognized trip action." };
  } catch (error: any) {
    console.error("Execution error:", error.message);
    return { error: `Execution error: ${error.message}` };
  }
}

export default { execute };
