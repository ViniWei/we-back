// voice_client/modules/dates.module.ts
import axios from "axios";
import intent from "../intent";
import { PtLanguageHelper } from "../language/ptLanguageHelper";

const BACKEND_URL = "http://localhost:3000";
const DEFAULT_DATE_STATUS_ID = 1;

async function fetchDates(
  token: string,
  _groupId: number,
  _mode: "all" | "upcoming"
) {
  const res = await axios.get(`${BACKEND_URL}/dates`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

async function sendDateToBackend(
  payload: {
    date: string;
    location: string;
    description: string;
    statusId: number;
  },
  token: string
) {
  const res = await axios.post(`${BACKEND_URL}/dates`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 201) {
    return {
      message: `Encontro criado: ${payload.description}`
    };
  }

  return { error: `Falha ao criar encontro: ${res.statusText}` };
}

function extractDateData(text: string): any | null {
  const { module, action } = intent.detect(text);

  if (module !== "dates" && module !== "activities") return null;

  const norm = PtLanguageHelper.normalize(text);

  if (action === "view") return { __action__: "view_all" };

  const parsed = PtLanguageHelper.parseDateTimeAndLocation(text);
  if (parsed.error) {
    return {
      error:
        "Nenhuma data reconhecida. Especifique um dia ou data para criar o encontro."
    };
  }

  const date = parsed.date!;
  const location = parsed.location!;
  const eventName = PtLanguageHelper.extractEventNameDynamic(
    text,
    norm,
    "Encontro"
  );
  const description = `${eventName} em ${location} (${date.toLocaleString(
    "pt-BR"
  )})`;

  return { event_name: eventName, location, date, description };
}

export async function execute(
  text: string,
  params: { userId: number; groupId: number; token?: string }
) {
  const data = extractDateData(text);
  if (!data) {
    return {
      message: "Nenhuma intenção reconhecida a partir do comando de voz."
    };
  }

  if (data.error) {
    return { error: data.error };
  }

  const token = params.token || "";
  const groupId = params.groupId;

  if (!token) {
    return {
      error: "Token de autenticação ausente para criar/consultar encontros."
    };
  }

  if (data.__action__ === "view_all") {
    return await fetchDates(token, groupId, "all");
  }

  const payload = {
    date: PtLanguageHelper.toLocalISOString(data.date),
    location: data.location,
    description: data.description,
    statusId: DEFAULT_DATE_STATUS_ID
  };

  if (!payload.date || !payload.statusId) {
    return {
      error:
        "Campos obrigatórios ausentes para criação do encontro (date ou statusId)."
    };
  }

  try {
    return await sendDateToBackend(payload, token);
  } catch (e: any) {
    return { error: `Erro ao enviar para o backend: ${e.message}` };
  }
}

export default { execute };
