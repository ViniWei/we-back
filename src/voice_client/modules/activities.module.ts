// voice_client/modules/activities.module.ts
import axios from "axios";
import intent from "../intent";
import { PtLanguageHelper } from "../language/ptLanguageHelper";

const BACKEND_URL = "http://localhost:3000";

async function fetchActivities(
  token: string | undefined,
  groupId: number,
  mode: "all" | "upcoming"
) {
  const endpoint =
    mode === "all"
      ? `/activities/group/${groupId}`
      : `/activities/group/${groupId}/upcoming`;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await axios.get(`${BACKEND_URL}${endpoint}`, { headers });
  return res.data;
}

async function sendActivityToBackend(activity: any, token: string | undefined) {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await axios.post(`${BACKEND_URL}/activities`, activity, {
    headers
  });
  if (res.status === 201)
    return { message: `Activity created: ${activity.event_name}` };
  return { error: `Failed to create: ${res.statusText}` };
}

function extractActivityData(text: string): any | null {
  const { module, action } = intent.detect(text);
  if (module !== "activities") return null;

  const norm = PtLanguageHelper.normalize(text);

  if (action === "view") {
    return { __action__: "view_all" };
  }

  const parsed = PtLanguageHelper.parseDateTimeAndLocation(text);

  if (parsed.error) {
    return { error: parsed.error };
  }

  const eventName = PtLanguageHelper.extractEventNameDynamic(
    text,
    norm,
    "Atividade"
  );
  const date = parsed.date!;
  const location = parsed.location!;
  const description = `${eventName} em ${location} (${date.toLocaleString(
    "pt-BR"
  )})`;

  return { event_name: eventName, location, date, description };
}

export async function execute(
  text: string,
  params: { userId: number; groupId: number; token?: string }
) {
  const data = extractActivityData(text);
  if (!data) {
    return { message: "Nenhuma intenção reconhecida a partir do comando de voz." };
  }

  if (data.error) return { error: data.error };

  const { userId, groupId, token } = params;

  if (!userId || !groupId) {
    return {
      error: "userId ou groupId não informados. Envie esses dados no body."
    };
  }

  if (data.__action__ === "view_all") {
    return await fetchActivities(token, groupId, "all");
  }

  const payload = {
    group_id: groupId,
    event_name: data.event_name,
    date: PtLanguageHelper.toLocalISOString(data.date),
    location: data.location,
    created_by: userId
  };

  if (
    !payload.group_id ||
    !payload.event_name ||
    !payload.date ||
    !payload.created_by
  ) {
    return {
      error: "Campos obrigatórios ausentes para criação da atividade."
    };
  }

  try {
    return await sendActivityToBackend(payload, token);
  } catch (e: any) {
    return { error: `Error sending: ${e.message}` };
  }
}

export default { execute };
