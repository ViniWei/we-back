import axios from "axios";
import intent from "../intent";
import { PtLanguageHelper } from "../language/ptLanguageHelper";

const BACKEND_URL = "http://localhost:3000";


async function fetchFinances(
  token: string,
  _groupId: number,
  _mode: "all" | "latest"
) {
  const res = await axios.get(`${BACKEND_URL}/finances/group`, {
    headers: { Authorization: `Bearer ${token}` }
  });


  return res.data;
}

async function sendFinanceToBackend(
  payload: {
    descricao: string;
    valor: number;
    categoria: string;
    instalments?: number;
  },
  token: string
) {
  const res = await axios.post(`${BACKEND_URL}/finances`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 201 || res.status === 200) {
    return res.data;
  }

  return { error: `Falha ao criar despesa: ${res.statusText}` };
}


function extractFinanceData(text: string): any | null {
  const { module, action } = intent.detect(text);
  if (module !== "finances") return null;

  if (action === "view") {
    return { __action__: "view_all" };
  }

  if (action === "create") {
    const parsed = PtLanguageHelper.parseFinanceFromText(text);
    return parsed;
  }

  return null;
}

export async function execute(
  text: string,
  params: { userId: number; groupId: number; token?: string }
) {
  const data = extractFinanceData(text);
  if (!data) {
    return {
      message: "Nenhuma intenção de finanças reconhecida a partir do comando de voz."
    };
  }

  if (data.error) {
    return { error: data.error };
  }

  const token = params.token || "";
  const groupId = params.groupId;

  if (!token) {
    return {
      error: "Token de autenticação ausente para criar/consultar despesas."
    };
  }

  if (data.__action__ === "view_all") {
    try {
      return await fetchFinances(token, groupId, "all");
    } catch (e: any) {
      console.error("Erro ao buscar despesas:", e?.message || e);
      return { error: `Erro ao buscar despesas: ${e.message}` };
    }
  }


  try {
    const payload = {
      descricao: data.descricao,
      valor: data.valor,
      categoria: data.categoria,
      instalments: 1
    };

    return await sendFinanceToBackend(payload, token);
  } catch (e: any) {
    console.error("Erro ao enviar despesa para o backend:", e?.message || e);
    return { error: `Erro ao enviar despesa para o backend: ${e.message}` };
  }
}

export default { execute };
