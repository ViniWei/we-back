import axios from "axios";

interface FinanceIntent {
  action: "create" | "view" | "update" | "delete";
  description: string | null;
  amount: number | null;
  category: string | null;
  date: string | null; // "today", "tomorrow", "YYYY-MM-DD", etc.
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const AI_ENABLED = process.env.AI_VOICE_ENABLED === "true";

const SYSTEM_PROMPT = `Você é um assistente que extrai informações estruturadas de comandos de voz sobre finanças pessoais.

Categorias válidas (sempre retorne em minúsculas com acentos): alimentação, transporte, acomodação, entretenimento, compras, contas, saúde, outros

Você deve retornar um JSON válido com a seguinte estrutura:
{
  "action": "create" | "view",
  "description": string ou null,
  "amount": number ou null,
  "category": string ou null,
  "date": string ou null
}

Regras importantes:
1. **action**: Use "create" para adicionar/registrar/criar despesa, "view" para mostrar/listar/ver despesas
2. **description**: Extraia apenas o nome da despesa, removendo todas as palavras de comando. Exemplos:
   - "adicionar despesa com jantar" → "Jantar"
   - "registrar gasto de uber" → "Uber"
   - "comprei pizza" → "Pizza"
   - Se não houver descrição clara, use null
3. **amount**: Extraia o valor numérico, incluindo:
   - Números diretos: "150", "35.50", "R$ 200"
   - Por extenso: "cinquenta reais" → 50, "cento e vinte" → 120
   - Mil: "2 mil" → 2000, "1.5 mil" → 1500
   - Se não houver valor, use null
4. **category**: Identifique a categoria baseada em palavras-chave:
   - alimentação: comida, restaurante, jantar, almoço, lanche, mercado, supermercado, pizza, hambúrguer, café, bar, bebida, ifood
   - transporte: uber, taxi, ônibus, metro, gasolina, combustível, estacionamento, passagem
   - acomodação: hotel, pousada, airbnb, hospedagem
   - entretenimento: cinema, show, teatro, parque, festa, jogo, balada
   - compras: roupa, sapato, shopping, eletrônico, livro
   - contas: luz, água, telefone, internet, aluguel
   - saúde: farmácia, remédio, médico, consulta, hospital, dentista, academia
   - outros: se não se encaixar em nenhuma categoria acima
   - Se categoria for mencionada explicitamente ("na categoria X"), use-a
5. **date**: Extraia a data:
   - "hoje", "data de hoje" → "today"
   - "amanhã", "amanha" → "tomorrow"
   - "depois de amanhã" → "day_after_tomorrow"
   - "daqui a 3 dias" → "in_3_days" (use o padrão in_N_days)
   - Data específica: "15/01", "15/01/2024" → converta para "2024-01-15"
   - Dia da semana: "segunda", "próxima terça" → calcule baseado em hoje ser 23/11/2025
   - Se não mencionar data, use "today"

Exemplos de entrada e saída esperada:

Entrada: "adicionar uma despesa com a descrição jantar com o valor 150 reais na categoria alimentação na data de hoje"
Saída: {"action":"create","description":"Jantar","amount":150,"category":"alimentação","date":"today"}

Entrada: "registrar gasto de uber de 35 reais"
Saída: {"action":"create","description":"Uber","amount":35,"category":"transporte","date":"today"}

Entrada: "comprei pizza por 50 pila"
Saída: {"action":"create","description":"Pizza","amount":50,"category":"alimentação","date":"today"}

Entrada: "adicionar despesa mercado 250 reais amanhã"
Saída: {"action":"create","description":"Mercado","amount":250,"category":"alimentação","date":"tomorrow"}

Entrada: "mostrar minhas despesas"
Saída: {"action":"view","description":null,"amount":null,"category":null,"date":null}

Entrada: "listar gastos"
Saída: {"action":"view","description":null,"amount":null,"category":null,"date":null}

IMPORTANTE: Sempre retorne JSON válido, nunca retorne texto explicativo ou markdown.`;

export async function parseFinanceIntent(
  userText: string
): Promise<FinanceIntent> {
  // Se AI não está habilitada, retorna null para usar fallback
  if (!AI_ENABLED || !OPENAI_API_KEY) {
    console.log("[AI] Voice AI disabled, using fallback parser");
    throw new Error("AI disabled");
  }

  try {
    console.log(`[AI] Parsing finance intent: "${userText}"`);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userText },
        ],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10s timeout
      }
    );

    const content = response.data.choices[0].message.content;
    const parsed: FinanceIntent = JSON.parse(content);

    console.log("[AI] Parsed intent:", JSON.stringify(parsed));

    return parsed;
  } catch (error: any) {
    console.error("[AI] Error parsing finance intent:", error.message);
    throw error;
  }
}

export function isAIEnabled(): boolean {
  return AI_ENABLED && !!OPENAI_API_KEY;
}
