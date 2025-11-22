// voice_client/language/ptLanguageHelper.ts

export type ParsedDateSpan = {
  date: Date | null;
  start: number;
  end: number;
};

export type ParsedTimeSpan = {
  time: { hour: number; minute: number } | null;
  start: number;
  end: number;
};

export type ParsedLocationSpan = {
  location: string | null;
  start: number;
  end: number;
};

const MONTHS: Record<string, number> = {
  janeiro: 1, jan: 1,
  fevereiro: 2, fev: 2,
  marco: 3, março: 3, mar: 3,
  abril: 4, abr: 4,
  maio: 5, mai: 5,
  junho: 6, jun: 6,
  julho: 7, jul: 7,
  agosto: 8, ago: 8,
  setembro: 9, set: 9,
  outubro: 10, out: 10,
  novembro: 11, nov: 11,
  dezembro: 12, dez: 12
};

const FINANCE_CATEGORIES: Record<string, string[]> = {
  "alimentação": ["mercado", "supermercado", "comida", "lanche", "restaurante", "pizza", "lanchonete", "padaria", "bar", "bebida", "churrasco", "ifood"],
  "transporte": ["uber", "ônibus", "onibus", "metro", "metrô", "gasolina", "estacionamento", "carro", "passagem", "corrida", "combustivel", "combustível"],
  "acomodação": ["hotel", "pousada", "airbnb", "hospedagem", "motel"],
  "entretenimento": ["cinema", "show", "teatro", "parque", "viagem", "festa", "evento", "jogo", "balada"],
  "compras": ["roupa", "sapato", "shopping", "eletronico", "eletrônico", "livro", "acessorio", "acessório"],
  "contas": ["luz", "água", "agua", "telefone", "internet", "aluguel", "energia"],
  "saúde": ["farmacia", "farmácia", "remedio", "remedios", "remédio", "remédios", "medico", "médico", "consulta", "hospital", "dentista", "academia", "medicamentos"],
  "outros": []
};

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function safeInt(x: any): number | null {
  const n = parseInt(String(x), 10);
  return Number.isNaN(n) ? null : n;
}

function toTitleCase(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function clampFuture(date: Date): Date {
  const now = new Date();
  if (date.getTime() <= now.getTime()) {
    const d = new Date(now.getTime());
    d.setMinutes(0, 0, 0);
    d.setHours(now.getHours() + 1);
    return d;
  }
  return date;
}

function parseDateParts(
  dayStr: string,
  monthWord: string | null,
  yearStr: string | null,
  fallbackMonth: number | null,
  fallbackYear: number
): Date | null {
  const cleanDay = dayStr
    .replace(/[º°]/g, "")
    .replace("primeiro", "1")
    .trim();

  const day = safeInt(cleanDay);
  const normMonth = monthWord ? normalize(monthWord) : null;
  const month = normMonth && MONTHS[normMonth] ? MONTHS[normMonth] : fallbackMonth;

  let year = yearStr ? safeInt(yearStr) ?? fallbackYear : fallbackYear;
  if (year && year < 100) year += 2000;

  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

// --------- DATAS / HORÁRIOS / LOCAL ---------

function extractExplicitDate(t: string): ParsedDateSpan {
  const now = new Date();

  // Formato numérico: 01/02[/2025]
  const mNum = t.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (mNum) {
    const d = parseDateParts(
      mNum[1],
      null,
      mNum[3] || null,
      parseInt(mNum[2]),
      now.getFullYear()
    );
    return { date: d, start: mNum.index!, end: mNum.index! + mNum[0].length };
  }

  // "10 de março [de 2025]" / "primeiro de abril"
  const mTxt = t.match(/(\d{1,2}|1º|primeiro)\s+de\s+([a-zç]+)(?:\s+de\s+(\d{4}))?/i);
  if (mTxt) {
    const day = mTxt[1].replace(/[º°]/g, "").replace("primeiro", "1");
    const d = parseDateParts(day, mTxt[2], mTxt[3] || null, null, now.getFullYear());
    return { date: d, start: mTxt.index!, end: mTxt.index! + mTxt[0].length };
  }

  const wd: Record<string, number> = {
    domingo: 0,
    segunda: 1,
    terca: 2,
    terça: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5,
    sabado: 6,
    sábado: 6
  };
  for (const [name, idx] of Object.entries(wd)) {
    const r = new RegExp(`(?:proxima|próxima|essa|na|no|em)?\\s*${name}`, "i");
    const m = t.match(r);
    if (m) {
      const today = now.getDay();
      let diff = idx - today;
      if (diff <= 0 || /proxima|próxima/.test(m[0])) diff += 7;
      const d = new Date(now);
      d.setDate(now.getDate() + diff);
      return { date: d, start: m.index!, end: m.index! + m[0].length };
    }
  }

  // amanhã
  if (t.includes("amanha") || t.includes("amanhã")) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const i = t.indexOf("amanha") >= 0 ? t.indexOf("amanha") : t.indexOf("amanhã");
    const s = i >= 0 ? i : 0;
    const len = t.includes("amanhã") ? "amanhã".length : "amanha".length;
    return { date: d, start: s, end: s + len };
  }

  // depois de amanhã
  if (t.includes("depois de amanha") || t.includes("depois de amanhã")) {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const i =
      t.indexOf("depois de amanha") >= 0
        ? t.indexOf("depois de amanha")
        : t.indexOf("depois de amanhã");
    const s = i >= 0 ? i : 0;
    const len = t.includes("depois de amanhã")
      ? "depois de amanhã".length
      : "depois de amanha".length;
    return { date: d, start: s, end: s + len };
  }

  // daqui a X dias
  const inDays = t.match(/daqui a\s*(\d+)\s*dias?/);
  if (inDays) {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(inDays[1]));
    return { date: d, start: inDays.index!, end: inDays.index! + inDays[0].length };
  }

  return { date: null, start: -1, end: -1 };
}

function extractExplicitTime(t: string): ParsedTimeSpan {
  const m = t.match(/\b(\d{1,2})(?::|h)?(\d{2})?\b/);
  if (!m) return { time: null, start: -1, end: -1 };

  let hour = safeInt(m[1]) ?? 0;
  let minute = safeInt(m[2]) ?? 0;

  if (t.includes("tarde") || t.includes("noite")) {
    if (hour < 12) hour += 12;
  }
  if (t.includes("manha") || t.includes("manhã")) {
    if (hour === 12) hour = 0;
  }
  if (t.includes("meio dia") || t.includes("meio-dia")) hour = 12;
  if (t.includes("meia noite") || t.includes("meia-noite")) hour = 0;

  return {
    time: { hour, minute },
    start: m.index!,
    end: m.index! + m[0].length
  };
}

function extractLocationSpan(t: string): ParsedLocationSpan {
  const preps = ["no", "na", "em", "para", "pra", "pro", "ao", "a"];
  const stopWords = [
    "amanha", "amanhã", "hoje", "depois", "proxima", "próxima", "semana",
    "segunda", "terca", "terça", "quarta", "quinta", "sexta",
    "sabado", "sábado", "domingo", "dia", "às", "as", "\\d{1,2}[:h]\\d{0,2}"
  ];
  const stopPattern = new RegExp(`\\b(?:${stopWords.join("|")})\\b`, "i");

  for (const p of preps) {
    const regex = new RegExp(`\\b${p}\\s+([^,.;]+)`, "gi");
    const m = regex.exec(t);
    if (m) {
      let sub = m[1];
      const stop = sub.search(stopPattern);
      if (stop >= 0) sub = sub.slice(0, stop);
      sub = sub
        .replace(/\b(do|da|de|no|na|em|para|pra|ao|a)\b/gi, "")
        .trim();
      if (sub) {
        return {
          location: toTitleCase(sub),
          start: m.index!,
          end: m.index! + m[0].length
        };
      }
    }
  }

  return { location: null, start: -1, end: -1 };
}

function toLocalISOString(date: Date, offMin = -180): string {
  const ms = date.getTime() + offMin * 60000;
  return new Date(ms).toISOString();
}

// Combinação data + hora + local, usada por activities/dates
export function parseDateTimeAndLocation(text: string) {
  const t = normalize(text);
  const dSpan = extractExplicitDate(t);
  const timeSpan = extractExplicitTime(t);
  const locSpan = extractLocationSpan(t);

  if (!dSpan.date) {
    return {
      error: "Nenhuma data reconhecida. Especifique um dia ou data.",
      date: null as Date | null,
      location: locSpan.location || null
    };
  }

  let date = dSpan.date;
  const time = timeSpan.time || { hour: 0, minute: 0 };
  date.setHours(time.hour, time.minute, 0, 0);
  date = clampFuture(date);

  return {
    error: null as string | null,
    date,
    location: locSpan.location || "Local não informado"
  };
}

// --------- VIAGENS (TRIPS): intervalo datas / cidade / orçamento ---------

export function parseTripDateRange(text: string): { startDate: string | null; endDate: string | null } {
  const t = normalize(text);
  const now = new Date();
  const currentYear = now.getFullYear();

  // Intervalo "entre os dias 10 e 15 de março [ano atual]"
  const fullRange = t.match(
    /(?:entre\s+(?:os\s+)?dias?\s+|dos?\s+dias?\s+|do\s+dia\s+|de\s+|no\s+dia\s+|dia\s+)?(\d{1,2}|1º|primeiro)[\/\-\.]?\s*(?:de|do|da)?\s*([a-zç0-9]*)?(?:\s*(?:de|do)\s*(\d{4}))?(?:\s*(?:ao|a|ate|até|e)\s*(?:o\s+)?(?:dia\s+)?)(\d{1,2}|1º|primeiro)[\/\-\.]?\s*(?:de|do|da)?\s*([a-zç0-9]*)?(?:\s*(?:de|do)\s*(\d{4}))?/i
  );

  if (fullRange) {
    let [, d1, m1, y1, d2, m2, y2] = fullRange;
    d1 = d1?.replace(/[º°]/g, "").replace("primeiro", "1") || "";
    d2 = d2?.replace(/[º°]/g, "").replace("primeiro", "1") || "";
    if (!m1 && m2) m1 = m2;

    const start = parseDateParts(d1, m1 || null, y1 || null, safeInt(m1), currentYear);
    const end = parseDateParts(d2, m2 || m1 || null, y2 || y1 || null, safeInt(m2 || m1), currentYear);

    if (start && end) {
      if (end < start) end.setFullYear(end.getFullYear() + 1);
      return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0]
      };
    }
  }

  // Intervalo numérico "10/03/2025 a 15/03/2025"
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
      endDate: end ? end.toISOString().split("T")[0] : null
    };
  }

  // Data única "no dia x do mês y "
  const single = t.match(
    /(?:no\s+dia\s+|para\s+o\s+dia\s+|do\s+dia\s+|em\s+|dia\s+)?(\d{1,2}|1º|primeiro)[\/\-\.]?\s*(?:de|do|da)?\s*([a-zç0-9]+)?(?:\s*(?:de|do)\s*(\d{4}))?/i
  );
  if (single) {
    let [, d, m, y] = single;
    d = d?.replace(/[º°]/g, "").replace("primeiro", "1") || "";
    const date = parseDateParts(d, m || null, y || null, safeInt(m) || null, currentYear);
    return {
      startDate: date ? date.toISOString().split("T")[0] : null,
      endDate: date ? date.toISOString().split("T")[0] : null
    };
  }

  return { startDate: null, endDate: null };
}

export function cleanTripCity(name: string | null): string | null {
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

  city = city
    .replace(/\s+(no\s+dia|do\s+dia|com\s+orcamento.*)$/gi, "")
    .trim();

  return city
    .split(" ")
    .map((w, i) =>
      ["de", "da", "do", "dos", "das"].includes(w.toLowerCase()) && i > 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(" ");
}

export function extractTripBudget(text: string): number | null {
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

// --------- FINANÇAS: descrição / categoria / valor ---------

export function cleanFinanceDescription(text: string): string {
  let t = text
    .replace(/\b(adicionar|registrar|nova|novo|despesa|gasto|compra|pagar|pagamento|gastar|valor|reais?|r\$|de|do|da|no|na|em|com|para|por|ao|aos|às|os|as|o|a)\b/gi, "")
    .replace(/\d+[.,]?\d*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (t.length > 0) {
    t = t.charAt(0).toUpperCase() + t.slice(1);
  }

  return t || "Despesa sem descrição";
}

export function detectFinanceCategory(text: string): string {
  const t = normalize(text);
  for (const [category, keywords] of Object.entries(FINANCE_CATEGORIES)) {
    for (const kw of keywords) {
      if (t.includes(kw)) {
        return category.charAt(0).toUpperCase() + category.slice(1);
      }
    }
  }
  return "Outros";
}

export function extractFinanceAmount(text: string): number | null {
  const t = text.replace(",", ".").replace(/\s+/g, " ");
  const match = t.match(/(?:r\$ ?)?(\d+(?:[.,]\d{1,2})?)\s*(mil)?/i);
  if (!match) return null;
  let value = parseFloat(match[1]);
  if (match[2]) value *= 1000;
  return isNaN(value) ? null : parseFloat(value.toFixed(2));
}

export function parseFinanceFromText(text: string) {
  const t = normalize(text);
  const amount = extractFinanceAmount(text) || 0;

  let description: string | null = null;

  // "com/na/no/em/de <algo> ... R$"
  const descAfter = t.match(
    /(?:com|na|no|em|de)\s+([a-zçãéêíóúàõ\s]+?)(?=$|\s*(r\$|\d|reais?|mil))/i
  );
  if (descAfter) {
    description = cleanFinanceDescription(descAfter[1]);
  }

  // "despesa/gasto com/de/em <algo> no valor..."
  if (!description) {
    const descBefore = t.match(
      /(?:despesa|gasto)\s+(?:com|de|em)\s+([a-zçãéêíóúàõ\s]+?)(?=\s*(no valor|r\$|\d|reais?|mil|$))/i
    );
    if (descBefore) {
      description = cleanFinanceDescription(descBefore[1]);
    }
  }

  // fallback: última palavra significativa
  if (!description) {
    const words = t.split(" ");
    const last = words[words.length - 1];
    if (last.length > 2 && isNaN(Number(last))) {
      description = cleanFinanceDescription(last);
    }
  }

  const categoria = detectFinanceCategory(t);

  return {
    descricao: description || "Despesa sem descrição",
    valor: amount,
    categoria
  };
}

// --------- Event name (usado por activities/dates) ---------

export function extractEventNameDynamic(original: string, normalized: string, defaultName = "Atividade"): string {
  const verbs = [
    "marcar",
    "agendar",
    "criar",
    "adicionar",
    "planejar",
    "programar",
    "registrar"
  ];

  let event = "";
  const verb = verbs.find((v) => normalized.includes(v));

  if (verb) {
    const regex = new RegExp(
      `\\b${verb}\\b(?:\\s+(?:um|uma|o|a)\\b)?\\s*(.+)`,
      "i"
    );
    const match = original.match(regex);
    if (match && match[1]) event = match[1];
  }

  event = event
    .replace(/\b(no|na|em|para|pra|ao|a)\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return event ? event.charAt(0).toUpperCase() + event.slice(1) : defaultName;
}


export const PtLanguageHelper = {
  normalize,
  safeInt,
  toTitleCase,
  clampFuture,
  parseDateParts,
  extractExplicitDate,
  extractExplicitTime,
  extractLocationSpan,
  toLocalISOString,
  parseDateTimeAndLocation,
  parseTripDateRange,
  cleanTripCity,
  extractTripBudget,
  cleanFinanceDescription,
  detectFinanceCategory,
  extractFinanceAmount,
  parseFinanceFromText,
  extractEventNameDynamic
};
