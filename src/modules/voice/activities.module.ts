import { ActivitiesController } from "../../controllers/activities.controller";
import intent from "./intent";

const activitiesController = new ActivitiesController();

const MONTHS: Record<string, number> = {
  janeiro: 1,
  fevereiro: 2,
  março: 3,
  marco: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
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
  const day = safeInt(dayStr);
  const month = monthWord ? MONTHS[monthWord] : fallbackMonth;
  let year = safeInt(yearStr) ?? fallbackYear;
  if (year && year < 100) year += 2000;
  return day && month && year ? new Date(year, month - 1, day) : null;
}

function extractExplicitDate(t: string): {
  date: Date | null;
  start: number;
  end: number;
} {
  const now = new Date();
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
  const mTxt = t.match(
    /(\d{1,2}|primeiro)\s+de\s+([a-zç]+)(?:\s+de\s+(\d{4}))?/
  );
  if (mTxt) {
    const day = mTxt[1] === "primeiro" ? "1" : mTxt[1];
    const d = parseDateParts(
      day,
      mTxt[2],
      mTxt[3] || null,
      null,
      now.getFullYear()
    );
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
    sábado: 6,
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
  if (t.includes("amanha") || t.includes("amanhã")) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const i =
      t.indexOf("amanha") >= 0 ? t.indexOf("amanha") : t.indexOf("amanhã");
    const s = i >= 0 ? i : 0;
    return {
      date: d,
      start: s,
      end: s + (t.includes("amanhã") ? "amanhã".length : "amanha".length),
    };
  }
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
  const inDays = t.match(/daqui a\s*(\d+)\s*dias?/);
  if (inDays) {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(inDays[1]));
    return {
      date: d,
      start: inDays.index!,
      end: inDays.index! + inDays[0].length,
    };
  }
  return { date: null, start: -1, end: -1 };
}

function extractExplicitTime(t: string): {
  time: { hour: number; minute: number } | null;
  start: number;
  end: number;
} {
  const m = t.match(/\b(\d{1,2})(?::|h)?(\d{2})?\b/);
  if (!m) return { time: null, start: -1, end: -1 };
  let hour = safeInt(m[1]) ?? 0;
  let minute = safeInt(m[2]) ?? 0;
  if (t.includes("tarde") || t.includes("noite")) if (hour < 12) hour += 12;
  if (t.includes("manha") || t.includes("manhã")) if (hour === 12) hour = 0;
  if (t.includes("meio dia") || t.includes("meio-dia")) hour = 12;
  if (t.includes("meia noite") || t.includes("meia-noite")) hour = 0;
  return {
    time: { hour, minute },
    start: m.index!,
    end: m.index! + m[0].length,
  };
}

function extractLocationSpan(t: string): {
  location: string | null;
  start: number;
  end: number;
} {
  const preps = ["no", "na", "em", "para", "pra", "pro", "ao", "a"];
  const stopWords = [
    "amanha",
    "amanhã",
    "hoje",
    "depois",
    "proxima",
    "próxima",
    "semana",
    "segunda",
    "terca",
    "terça",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
    "sábado",
    "domingo",
    "dia",
    "às",
    "as",
    "\\d{1,2}[:h]\\d{0,2}",
  ];
  const stopPattern = new RegExp(`\\b(?:${stopWords.join("|")})\\b`, "i");
  for (const p of preps) {
    const regex = new RegExp(`\\b${p}\\s+([^,.;]+)`, "gi");
    const m = regex.exec(t);
    if (m) {
      let sub = m[1];
      const stop = sub.search(stopPattern);
      if (stop >= 0) sub = sub.slice(0, stop);
      sub = sub.replace(/\b(do|da|de|no|na|em|para|pra|ao|a)\b/gi, "").trim();
      if (sub)
        return {
          location: toTitleCase(sub),
          start: m.index!,
          end: m.index! + m[0].length,
        };
    }
  }
  return { location: null, start: -1, end: -1 };
}

function extractEventNameDynamic(original: string, t: string): string {
  const verbs = [
    "marcar",
    "agendar",
    "criar",
    "adicionar",
    "planejar",
    "programar",
    "registrar",
  ];
  let event = "";
  const verb = verbs.find((v) => t.includes(v));
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
  return event ? event.charAt(0).toUpperCase() + event.slice(1) : "Atividade";
}

function extractActivityData(text: string): any | null {
  const { module, action } = intent.detect(text);
  if (module !== "activities") return null;

  const t = normalize(text);
  if (action === "view") return { __action__: "view_all" };

  const dSpan = extractExplicitDate(t);
  const timeSpan = extractExplicitTime(t);
  const locSpan = extractLocationSpan(t);

  if (!dSpan.date) {
    return {
      error:
        "Nenhuma data reconhecida. Especifique um dia ou data para criar a atividade.",
    };
  }

  let date = dSpan.date;
  const time = timeSpan.time || { hour: 0, minute: 0 };
  date.setHours(time.hour, time.minute, 0, 0);
  date = clampFuture(date);

  const location = locSpan.location || "Local não informado";
  const eventName = extractEventNameDynamic(text, t);
  const description = `${eventName} em ${location} (${date.toLocaleString(
    "pt-BR"
  )})`;

  return { event_name: eventName, location, date, description };
}

function toLocalISOString(date: Date): string {
  const offMin = -180;
  const ms = date.getTime() + offMin * 60000;
  return new Date(ms).toISOString();
}

async function fetchActivities(groupId: number, mode: "all" | "upcoming") {
  const mockReq: any = {
    params: { groupId: groupId.toString() },
    query: mode === "upcoming" ? { days: 7 } : {},
  };

  const mockRes: any = {
    data: null,
    status: (code: number) => mockRes,
    json: (data: any) => {
      mockRes.data = data;
      return mockRes;
    },
  };

  if (mode === "upcoming") {
    await activitiesController.getUpcomingActivities(mockReq, mockRes);
  } else {
    await activitiesController.getActivitiesByGroupId(mockReq, mockRes);
  }

  return mockRes.data;
}

async function sendActivityToBackend(activity: any) {
  const mockReq: any = {
    body: activity,
    user: { groupId: activity.group_id, id: activity.created_by },
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
  };

  await activitiesController.createActivity(mockReq, mockRes);

  if (mockRes.statusCode === 201) {
    return { message: `Activity created: ${activity.event_name}` };
  }
  return { error: `Failed to create activity` };
}

export async function execute(
  text: string,
  user_id: number,
  group_id: number
): Promise<any> {
  const data = extractActivityData(text);
  if (!data)
    return {
      message: "Nenhuma intenção reconhecida a partir do comando de voz.",
    };

  if (data.error) return { error: data.error };

  if (data.__action__ === "view_all")
    return await fetchActivities(group_id as number, "all");

  const payload = {
    group_id,
    event_name: data.event_name,
    date: toLocalISOString(data.date),
    location: data.location,
    description: data.description,
    created_by: user_id,
  };

  if (
    !payload.group_id ||
    !payload.event_name ||
    !payload.date ||
    !payload.location ||
    !payload.created_by
  ) {
    return { error: "Campos obrigatórios ausentes para criação da atividade." };
  }

  try {
    return await sendActivityToBackend(payload);
  } catch (e: any) {
    return { error: `Error sending: ${e.message}` };
  }
}

export default { execute };
