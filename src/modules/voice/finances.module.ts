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
  if (!text || typeof text !== "string") {
    return "";
  }
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cleanDescription(text: string): string {
  let t = text
    .replace(
      /\b(adicionar|adicione|adiciona|adicionou|adicionaram|registrar|registre|registra|registrou|registraram|criar|cria|crie|criou|criaram|inserir|insere|insira|inseriu|lançar|lança|lance|lançou|anotar|anota|anote|anotou|cadastrar|cadastre|cadastrou|nova|novo|despesa|despesas|gasto|gastos|finança|finanças|compra|comprei|paguei|gastei|pagamento|gastar|valor|reais?|r\$|real|de|do|da|no|na|em|com|para|por|ao|aos|às|os|as|o|a|um|uma|hoje|amanhã|ontem|data|atual)\b/gi,
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
  const t = text.replace(/,/g, ".").replace(/\s+/g, " ");

  // Tentar variações com "reais", "real", "R$"
  // Ex: "50 reais", "R$ 100", "no valor de 75 reais", "com o valor de 30 reais"
  const patterns = [
    /(?:valor\s+de\s+)?(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:mil|k)?(?:\s*reais?)?/i,
    /(?:com\s+o?\s*valor\s+de\s+)?(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:mil|k)?(?:\s*reais?)?/i,
    /(?:no\s+valor\s+de\s+)?(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:mil|k)?(?:\s*reais?)?/i,
    /(?:de\s+)?(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:mil|k)?(?:\s*reais?)?/i,
    /(\d+(?:[.,]\d{1,2})?)\s*(?:mil|k)?(?:\s*reais?)?/i,
  ];

  for (const pattern of patterns) {
    const match = t.match(pattern);
    if (match) {
      let value = parseFloat(match[1].replace(",", "."));

      // Detectar se é "mil" ou "k"
      if (/mil|k/i.test(match[0])) {
        value *= 1000;
      }

      if (!isNaN(value)) {
        return parseFloat(value.toFixed(2));
      }
    }
  }

  return null;
}

function convertDateString(dateStr: string | null): Date {
  const now = new Date();

  if (!dateStr || dateStr === "today") {
    // Retorna a data atual à meia-noite (hora local)
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
  }

  if (dateStr === "tomorrow") {
    // Retorna amanhã à meia-noite (hora local)
    const d = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    d.setDate(d.getDate() + 1);
    return d;
  }

  if (dateStr === "day_after_tomorrow") {
    // Retorna depois de amanhã à meia-noite (hora local)
    const d = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    d.setDate(d.getDate() + 2);
    return d;
  }

  const inDaysMatch = dateStr.match(/^in_(\d+)_days?$/);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1]);
    const d = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    d.setDate(d.getDate() + days);
    return d;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    // Parse data no formato YYYY-MM-DD
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  // Fallback para hoje
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
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
  // Timezone do Brasil (UTC-3)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Retorna no formato YYYY-MM-DD com horário meio-dia para evitar problemas de timezone
  return `${year}-${month}-${day}T12:00:00.000Z`;
}

async function extractFinanceDataWithAI(text: string): Promise<any | null> {
  try {
    const aiIntent = await parseFinanceIntent(text);

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

    // Tentar extrair descrição após várias preposições
    const patterns = [
      /(?:com|na|no|em|de|para)\s+([a-zçãéêíóúàõ\s]+?)(?=$|\s*(r\$|\d|reais?|mil|valor|hoje|amanha|data))/i,
      /(?:despesa|gasto|finança|compra|paguei|gastei)\s+(?:com|de|em|para|na|no)?\s*([a-zçãéêíóúàõ\s]+?)(?=\s*(no valor|com o valor|r\$|\d|reais?|mil|hoje|amanha|data|$))/i,
      /(?:criar|cria|registrar|registre|adicionar|adicione|inserir)\s+(?:despesa|gasto|finança)?\s+(?:com|de|em|para)?\s*([a-zçãéêíóúàõ\s]+?)(?=\s*(no valor|com o valor|valor|r\$|\d|reais?|mil|hoje|amanha|data|$))/i,
    ];

    for (const pattern of patterns) {
      const match = t.match(pattern);
      if (match && match[1]) {
        description = cleanDescription(match[1]);
        if (description && description !== "Despesa sem descrição") {
          break;
        }
      }
    }

    // Se ainda não encontrou, tentar pegar última palavra significativa
    if (!description || description === "Despesa sem descrição") {
      const words = t.split(" ");
      for (let i = words.length - 1; i >= 0; i--) {
        const word = words[i];
        if (
          word.length > 2 &&
          isNaN(Number(word)) &&
          !/^(reais?|real|mil|hoje|amanha|ontem|data|atual|valor|r\$)$/i.test(
            word
          )
        ) {
          description = cleanDescription(word);
          break;
        }
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
  // Validação de entrada
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return {
      success: false,
      error: "Texto inválido ou vazio.",
    };
  }

  if (!user_id || !group_id) {
    return { success: false, error: "Missing user/group." };
  }

  let data = null;

  if (isAIEnabled()) {
    try {
      data = await extractFinanceDataWithAI(text);
    } catch (error: any) {
      console.warn(
        "[Finance] AI failed, falling back to regex:",
        error.message
      );
      data = extractFinanceData(text);
    }
  } else {
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
