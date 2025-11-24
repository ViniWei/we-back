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
  if (!text || typeof text !== "string") return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cleanTripText(text: string): string {
  if (!text) return "";
  // Remove palavras de comando mantendo apenas o conteúdo relevante
  return text
    .replace(/\b(adicionar|adiciona|adicione|adicionou|adicionaram)\b/gi, "")
    .replace(/\b(criar|cria|crie|criou|criaram)\b/gi, "")
    .replace(/\b(marcar|marca|marque|marcou|marcaram)\b/gi, "")
    .replace(/\b(cadastrar|cadastra|cadastre|cadastrou|cadastraram)\b/gi, "")
    .replace(/\b(programar|programa|programe|programou|programaram)\b/gi, "")
    .replace(/\b(planejar|planeja|planeje|planejou|planejaram)\b/gi, "")
    .replace(/\b(agendar|agenda|agende|agendou|agendaram)\b/gi, "")
    .replace(/\b(registrar|registra|registre|registrou|registraram)\b/gi, "")
    .replace(/\b(inserir|insere|insira|inseriu)\b/gi, "")
    .replace(/\b(lançar|lança|lance|lançou)\b/gi, "")
    .replace(/\b(anotar|anota|anote|anotou)\b/gi, "")
    .replace(/\b(viagem|viagens|passeio|excursão|roteiro)\b/gi, "")
    .replace(/\b(nova?|novo)\b/gi, "")
    .replace(/\b(uma?|um)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function safeInt(value: any): number | null {
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

function parseDate(day: number, month: number, year?: number | null): Date {
  const now = new Date();
  const y = year ?? now.getFullYear();
  // Cria data à meia-noite local para evitar problemas de timezone
  const d = new Date(y, month - 1, day, 0, 0, 0, 0);
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

  // Remove artigos no início
  city = city.replace(/^(o|a|os|as)\s+/i, "");

  // Remove tudo após palavras-chave que indicam fim do destino
  city = city.replace(
    /\s+(com\s+(um|uma|o|a|orcamento|orçamento|budget|data|inicio|início|fim|descricao|descrição)).*$/gi,
    ""
  );
  city = city.replace(
    /\s+(r\$|reais|no\s+dia|do\s+dia|dia\s+\d|entre\s+|de\s+\d|ate\s+|até\s+).*$/gi,
    ""
  );

  // Remove preposições no final
  city = city.replace(
    /\b(no|na|em|para|pra|pro|ao|a|de|do|da|dos|das)\b\s*$/gi,
    ""
  );

  // Normaliza espaços
  city = city.replace(/\s+/g, " ").trim();

  if (!city) return null;

  // Capitaliza palavras (exceto preposições no meio)
  return city
    .split(" ")
    .map((w, i) =>
      ["de", "da", "do", "dos", "das", "e"].includes(w.toLowerCase()) && i > 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
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

  // Padrão mais robusto: "data de inicio no dia X de MÊS de ANO" e "data fim sendo dia Y de MÊS de ANO"
  const verbosePattern = t.match(
    /(?:data\s+(?:de\s+)?(?:inicio|início|start|comeco|começo))[\s\w]*(?:no\s+dia\s+|dia\s+)?(\d{1,2}|1º|primeiro)[º°]?\s*(?:de|do|da)?\s*([a-zç]+)?\s*(?:de\s+)?(\d{4})?[\s,\.;]*(?:data\s+(?:de\s+)?(?:fim|final|end|termino|término))[\s\w]*(?:no\s+dia\s+|dia\s+|sendo\s+dia\s+)?(\d{1,2}|1º|primeiro)[º°]?\s*(?:de|do|da)?\s*([a-zç]+)?\s*(?:de\s+)?(\d{4})?/i
  );

  if (verbosePattern) {
    const [, d1, m1, y1, d2, m2, y2] = verbosePattern;
    const start = parseDateParts(
      d1?.replace(/[º°]/g, "").replace("primeiro", "1") || "",
      m1 || null,
      y1 || null,
      null,
      currentYear
    );
    const end = parseDateParts(
      d2?.replace(/[º°]/g, "").replace("primeiro", "1") || "",
      m2 || m1 || null,
      y2 || y1 || null,
      null,
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

  // Padrão: "entre os dias X e Y de MÊS" ou "do dia X ao dia Y de MÊS"
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

  // Padrão numérico: DD/MM/YYYY ao DD/MM/YYYY
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

  // Padrão de data única
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
    /(?:r\$|\breais?\b|\bvalor\b|\borcamento\b|\borçamento\b|\bcusto\b|\bpreco\b|\bpreço\b|\bgastar\b|\bgasto\b|\binvestir\b|\bcustando\b|\bpor\b)[^\d]*(\d+(?:[\.\s]?\d{3})*(?:,\d{1,2})?)(?:\s*(mil|k))?/i
  );
  if (match) {
    let raw = match[1];
    const isMil = /mil|k/i.test(match[2] || "");
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

function extractDescription(text: string): string | null {
  const t = normalize(text);

  // Padrões para capturar descrição
  const patterns = [
    /(?:com\s+(?:a\s+)?descricao|descricao|com\s+descricao)\s+([a-zçãéêíóúà\s-]+?)(?:\s*$|,|\.|;)/i,
    /(?:descricao:|descrição:)\s*([a-zçãéêíóúà\s-]+?)(?:\s*$|,|\.|;)/i,
    /(?:observacao|observação|obs|nota):\s*([a-zçãéêíóúà\s-]+?)(?:\s*$|,|\.|;)/i,
  ];

  for (const pattern of patterns) {
    const match = t.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
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
      description: trip.description || undefined,
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
  if (!text || typeof text !== "string") {
    console.warn("[Trips] Invalid text input:", text);
    return null;
  }

  const t = normalize(text);
  console.log("[Trips] Normalized text:", t);

  if (/ver\s+(viagens|proximas viagens|próximas viagens)/i.test(t))
    return { __action__: "view" };

  // Expande detecção de criação para todas as variações
  const createPatterns = [
    /(adicionar|adiciona|adicione|adicionou|adicionaram)/i,
    /(marcar|marca|marque|marcou|marcaram)/i,
    /(programar|programa|programe|programou|programaram)/i,
    /(criar|cria|crie|criou|criaram)/i,
    /(planejar|planeja|planeje|planejou|planejaram)/i,
    /(agendar|agenda|agende|agendou|agendaram)/i,
    /(registrar|registra|registre|registrou|registraram)/i,
    /(inserir|insere|insira|inseriu)/i,
    /(lançar|lança|lance|lançou)/i,
    /(anotar|anota|anote|anotou)/i,
    /viagem\s+(?:para|pra|pro|em)/i,
    /(nova?|novo)\s+(viagem|passeio|excursão)/i,
    /(viajar|vamos|ir)\s+(?:para|pra|pro)/i,
    /(conhecer|visitar|passeio|excursão|roteiro)/i,
  ];

  const isCreate = createPatterns.some((pattern) => pattern.test(t));
  console.log("[Trips] Is create action:", isCreate);

  if (isCreate) {
    // Tenta extrair cidade de várias formas - ORDEM IMPORTA (do mais específico para o mais genérico)

    // 1. Padrão explícito: "viagem para CIDADE"
    let cityMatch = t.match(
      /(?:viagem|viagens)\s+(?:para|pra|pro|em|ao|a)\s+(?:o\s+|a\s+)?([a-zçãéêíóúà\s-]+?)(?:\s+com\s+|\s+r\$|\s+no\s+dia|\s+do\s+dia|\s+dia\s+\d|\s+data\s+|\s+entre\s+|,|$)/i
    );

    // 2. Padrão de ação: "planejar/criar viagem para CIDADE"
    if (!cityMatch) {
      cityMatch = t.match(
        /(?:planejar|criar|marcar|adicionar|agendar|programar|registrar)\s+viagem\s+(?:para|pra|pro|em|ao|a)\s+(?:o\s+|a\s+)?([a-zçãéêíóúà\s-]+?)(?:\s+com\s+|\s+r\$|\s+no\s+dia|\s+do\s+dia|\s+dia\s+\d|\s+data\s+|\s+entre\s+|,|$)/i
      );
    }

    // 3. Verbos de movimento: "viajar/ir/conhecer CIDADE"
    if (!cityMatch) {
      cityMatch = t.match(
        /(?:viajar|ir|vamos|conhecer|visitar)\s+(?:para|pra|pro|em|a|ao|no|na)\s+(?:o\s+|a\s+)?([a-zçãéêíóúà\s-]+?)(?:\s+com\s+|\s+r\$|\s+no\s+dia|\s+do\s+dia|\s+dia\s+\d|\s+data\s+|\s+entre\s+|,|$)/i
      );
    }

    // 4. Passeio/excursão
    if (!cityMatch) {
      cityMatch = t.match(
        /(?:passeio|excursão|excursao|roteiro)\s+(?:para|pra|pro|em|a|ao|no|na)\s+(?:o\s+|a\s+)?([a-zçãéêíóúà\s-]+?)(?:\s+com\s+|\s+r\$|\s+no\s+dia|\s+do\s+dia|\s+dia\s+\d|\s+data\s+|\s+entre\s+|,|$)/i
      );
    }

    console.log("[Trips] City match:", cityMatch);
    const city = cityMatch ? cleanCity(cityMatch[1]) : null;
    console.log("[Trips] Cleaned city:", city);

    const { startDate, endDate } = extractDates(text);
    console.log("[Trips] Extracted dates:", { startDate, endDate });

    const budget = extractBudget(text);
    console.log("[Trips] Extracted budget:", budget);

    const description = extractDescription(text);
    console.log("[Trips] Extracted description:", description);

    return {
      __action__: "create",
      city,
      startDate,
      endDate,
      budget,
      description,
    };
  }
  return null;
}

async function execute(
  text: string,
  user_id: number,
  group_id: number
): Promise<any> {
  try {
    // Validação de entrada
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      console.warn("[Trips] Empty or invalid text input");
      return { error: "Texto inválido ou vazio." };
    }

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
