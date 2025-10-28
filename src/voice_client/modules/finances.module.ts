import axios from "axios";
import intent from "../intent";

const BACKEND_URL = "http://localhost:3000";

const CATEGORIES: Record<string, string[]> = {
  "alimentação": ["mercado", "supermercado", "comida", "lanche", "restaurante", "pizza", "lanchonete", "padaria", "bar", "bebida", "churrasco", "ifood"],
  "transporte": ["uber", "ônibus", "metro", "gasolina", "estacionamento", "carro", "passagem", "corrida", "combustivel"],
  "acomodação": ["hotel", "pousada", "airbnb", "hospedagem", "motel"],
  "entretenimento": ["cinema", "show", "teatro", "parque", "viagem", "festa", "evento", "jogo", "balada"],
  "compras": ["roupa", "sapato", "shopping", "eletronico", "livro", "acessorio"],
  "contas": ["luz", "água", "telefone", "internet", "aluguel", "energia"],
  "saúde": ["farmacia", "remedio", "remedios", "medico", "consulta", "hospital", "dentista", "academia", "medicamentos"],
  "outros": []
};

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function cleanDescription(text: string): string {
  let t = text
    .replace(/\b(adicionar|registrar|nova|novo|despesa|gasto|compra|pagar|pagamento|gastar|valor|reais?|r\$|de|do|da|no|na|em|com|para|por|ao|aos|às|os|as|o|a)\b/gi, "")
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
      if (t.includes(kw)) return category.charAt(0).toUpperCase() + category.slice(1);
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


function extractFinanceData(text: string): any | null {
  const { module, action } = intent.detect(text);
  if (module !== "finances") return null;

  const t = normalize(text);

  // Visualização de despesas
  if (action === "view") return { __action__: "view" };

  // Criação de despesa
  if (action === "create") {
    const amount = extractAmount(t) || 0;

    let description: string | null = null;
    const descAfter = t.match(/(?:com|na|no|em|de)\s+([a-zçãéêíóúàõ\s]+?)(?=$|\s*(r\$|\d|reais?|mil))/i);
    if (descAfter) description = cleanDescription(descAfter[1]);

    if (!description) {
      const descBefore = t.match(/(?:despesa|gasto)\s+(?:com|de|em)\s+([a-zçãéêíóúàõ\s]+?)(?=\s*(no valor|r\$|\d|reais?|mil|$))/i);
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
      categoria: category
    };
  }

  return null;
}

async function fetchFinances(token: string): Promise<any> {
  if (!token) return { success: false, error: "Missing authentication token." };

  try {
    const res = await axios.get(`${BACKEND_URL}/finances/group`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 200 && Array.isArray(res.data)) {
      return {
        success: true,
        data: res.data.map((f: any) => ({
          descricao: f.descricao || "-",
          valor: f.valor || 0,
          categoria: f.categoria || "-",
          data: f.data || "-"
        }))
      };
    }

    return { success: false, error: `Error fetching expenses: ${res.statusText}` };
  } catch (error: any) {
    return { success: false, error: `Error fetching expenses: ${error.message}` };
  }
}

async function sendFinanceToBackend(finance: any, token: string): Promise<any> {
  if (!token) return { success: false, error: "Missing authentication token." };

  try {
    const payload = {
      descricao: finance.descricao,
      valor: finance.valor,
      categoria: finance.categoria
    };

    const res = await axios.post(`${BACKEND_URL}/finances`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 201 || res.status === 200) {
      return { success: true, data: payload };
    }

    return { success: false, error: `Error creating expense: ${res.statusText}` };
  } catch (error: any) {
    return { success: false, error: `Error sending expense: ${error.message}` };
  }
}

export async function execute(text: string, token?: string): Promise<any> {
  const data = extractFinanceData(text);
  if (!data) return { success: false, error: "Nenhuma intenção de finanças reconhecida." };

  if (data.__action__ === "view") {
    return await fetchFinances(token || "");
  }

  return await sendFinanceToBackend(data, token || "");
}

export default { execute };
