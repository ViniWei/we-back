import {
  getFinancesByGroupId,
  createFinance,
} from "../../controllers/finances.controller";
import intent from "./intent";
import { parseFinanceIntent, isAIEnabled } from "../../services/ai.service";

const CATEGORIES: Record<string, string[]> = {
  alimentação: [
    "mercado",
    "supermercado",
    "comida",
    "lanche",
    "restaurante",
    "pizza",
    "lanchonete",
    "padaria",
    "bar",
    "bebida",
    "churrasco",
    "ifood",
  ],
  transporte: [
    "uber",
    "ônibus",
    "metro",
    "gasolina",
    "estacionamento",
    "carro",
    "passagem",
    "corrida",
    "combustivel",
  ],
  acomodação: ["hotel", "pousada", "airbnb", "hospedagem", "motel"],
  entretenimento: [
    "cinema",
    "show",
    "teatro",
    "parque",
    "viagem",
    "festa",
    "evento",
    "jogo",
    "balada",
  ],
  compras: ["roupa", "sapato", "shopping", "eletronico", "livro", "acessorio"],
  contas: ["luz", "água", "telefone", "internet", "aluguel", "energia"],
  saúde: [
    "farmacia",
    "remedio",
    "remedios",
    "medico",
    "consulta",
    "hospital",
    "dentista",
    "academia",
    "medicamentos",
  ],
  outros: [],
};

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cleanDescription(text: string): string {
  let t = text
    .replace(
      /\b(adicionar|registrar|nova|novo|despesa|gasto|compra|pagar|pagamento|gastar|valor|reais?|r\$|de|do|da|no|na|em|com|para|por|ao|aos|às|os|as|o|a)\b/gi,
      ""
    )
    .replace(/\d+[.,]?\d*/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length > 0) t = t.charAt(0).toUpperCase() + t.slice(1);
  return t || "Despesa sem descrição";
}

function detectCategory(text: string): string {
  const t = normalize(text);
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    for (const kw of keywords) {
      if (t.includes(kw))
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }
  return "Outros";
}

function extractAmount(text: string): number | null {
  const t = text.replace(",", ".").replace(/\s+/g, " ");
  const match = t.match(/(?:r\$ ?)?(\d+(?:[.,]\d{1,2})?)\s*(mil)?/i);
  if (!match) return null;
  let value = parseFloat(match[1]);
  if (match[2]) value *= 1000;
  return isNaN(value) ? null : parseFloat(value.toFixed(2));
}

function convertDateString(dateStr: string | null): Date {
  const now = new Date();

  if (!dateStr || dateStr === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (dateStr === "tomorrow") {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return d;
  }

  if (dateStr === "day_after_tomorrow") {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    return d;
  }

  const inDaysMatch = dateStr.match(/^in_(\d+)_days?$/);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1]);
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function normalizeCategory(cat: string | null): string {
  if (!cat) return "Outros";

  const valid = [
    "alimentação",
    "transporte",
    "acomodação",
    "entretenimento",
    "compras",
    "contas",
    "saúde",
  ];

  const normalized = cat.toLowerCase().trim();

  if (valid.includes(normalized)) {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  return "Outros";
}

function toLocalISOString(date: Date): string {
  const offsetMin = -180;
  const ms = date.getTime() + offsetMin * 60000;
  return new Date(ms).toISOString();
}

async function extractFinanceDataWithAI(text: string): Promise<any | null> {
  try {
    const aiIntent = await parseFinanceIntent(text);

    console.log("[AI Finance] Parsed intent:", aiIntent);

    if (aiIntent.action === "view") {
      return { __action__: "view" };
    }

    if (aiIntent.action === "create") {
      if (!aiIntent.amount || aiIntent.amount <= 0) {
        console.warn("[AI Finance] Invalid amount:", aiIntent.amount);
      }

      const date = convertDateString(aiIntent.date);

      const category = normalizeCategory(aiIntent.category);

      return {
        descricao: aiIntent.description || "Despesa sem descrição",
        valor: aiIntent.amount || 0,
        categoria: category,
        data: toLocalISOString(date),
      };
    }

    return null;
  } catch (error: any) {
    console.error("[AI Finance] Error:", error.message);
    throw error;
  }
}

function extractFinanceData(text: string): any | null {
  const { module, action } = intent.detect(text);
  if (module !== "finances") return null;

  const t = normalize(text);

  if (action === "view") return { __action__: "view" };

  if (action === "create") {
    const amount = extractAmount(t) || 0;

    let description: string | null = null;
    const descAfter = t.match(
      /(?:com|na|no|em|de)\s+([a-zçãéêíóúàõ\s]+?)(?=$|\s*(r\$|\d|reais?|mil))/i
    );
    if (descAfter) description = cleanDescription(descAfter[1]);

    if (!description) {
      const descBefore = t.match(
        /(?:despesa|gasto)\s+(?:com|de|em)\s+([a-zçãéêíóúàõ\s]+?)(?=\s*(no valor|r\$|\d|reais?|mil|$))/i
      );
      if (descBefore) description = cleanDescription(descBefore[1]);
    }

    if (!description) {
      const words = t.split(" ");
      const last = words[words.length - 1];
      if (last.length > 2 && isNaN(Number(last))) {
        description = cleanDescription(last);
      }
    }

    const category = detectCategory(t);
    return {
      descricao: description || "Despesa sem descrição",
      valor: amount,
      categoria: category,
    };
  }

  return null;
}

async function fetchFinances(groupId: number, userId: number): Promise<any> {
  try {
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

    await getFinancesByGroupId(mockReq, mockRes);

    if (mockRes.statusCode === 200 && Array.isArray(mockRes.data)) {
      return {
        success: true,
        data: mockRes.data.map((f: any) => ({
          descricao: f.descricao || "-",
          valor: f.valor || 0,
          categoria: f.categoria || "-",
          data: f.data || "-",
        })),
      };
    }

    return {
      success: false,
      error: `Error fetching expenses`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Error fetching expenses: ${error.message}`,
    };
  }
}

async function sendFinanceToBackend(
  finance: any,
  groupId: number,
  userId: number
): Promise<any> {
  try {
    const payload = {
      descricao: finance.descricao,
      valor: finance.valor,
      categoria: finance.categoria,
      data: finance.data,
    };

    const mockReq: any = {
      body: payload,
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

    await createFinance(mockReq, mockRes);

    if (mockRes.statusCode === 201 || mockRes.statusCode === 200) {
      return { success: true, data: mockRes.data };
    }

    return {
      success: false,
      error: `Error creating expense`,
    };
  } catch (error: any) {
    return { success: false, error: `Error sending expense: ${error.message}` };
  }
}

export async function execute(
  text: string,
  user_id: number,
  group_id: number
): Promise<any> {
  if (!user_id || !group_id) {
    return { success: false, error: "Missing user/group." };
  }

  let data = null;

  if (isAIEnabled()) {
    try {
      console.log("[Finance Module] Using AI parser");
      data = await extractFinanceDataWithAI(text);
    } catch (error: any) {
      console.log(
        "[Finance Module] AI failed, falling back to manual parser:",
        error.message
      );
      data = extractFinanceData(text);
    }
  } else {
    console.log("[Finance Module] AI disabled, using manual parser");
    data = extractFinanceData(text);
  }

  if (!data) {
    return {
      success: false,
      error: "Nenhuma intenção de finanças reconhecida.",
    };
  }

  if (data.__action__ === "view") {
    return await fetchFinances(group_id, user_id);
  }

  return await sendFinanceToBackend(data, group_id, user_id);
}

export default { execute };
