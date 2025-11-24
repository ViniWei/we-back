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
1. **action**: Use "create" para QUALQUER variação de: adicionar, adicione, adicionou, criar, crie, criou, registrar, registre, registrou, inserir, insere, insira, lançar, lance, lançou, anotar, anote, cadastrar, cadastre, nova, novo, paguei, gastei, comprei, compra, despesa, gasto, finança
   Use "view" para: mostrar, listar, ver, exibir, consultar despesas/gastos/finanças
   
2. **description**: Extraia apenas o nome da despesa, removendo TODAS as palavras de comando. Exemplos:
   - "adicionar despesa com jantar" → "Jantar"
   - "cria despesa de uber" → "Uber"
   - "registre gasto com pizza" → "Pizza"
   - "paguei mercado" → "Mercado"
   - "gastei em cinema" → "Cinema"
   - "comprei remédio" → "Remédio"
   - Se não houver descrição clara, use null
   
3. **amount**: Extraia o valor numérico de QUALQUER formato:
   - Com "valor": "no valor de 50", "com o valor de 100", "valor 75" → 50, 100, 75
   - Com "reais": "50 reais", "cem reais", "150 real" → 50, 100, 150
   - Com R$: "R$ 200", "R$35.50", "r$ 80" → 200, 35.50, 80
   - Direto: "150", "35.50", "75" → 150, 35.50, 75
   - Mil: "2 mil", "1.5 mil", "2k" → 2000, 1500, 2000
   - Por extenso: "cinquenta reais" → 50, "cento e vinte" → 120
   - Se não houver valor, use null
   
4. **category**: Identifique a categoria baseada em palavras-chave:
   - alimentação: comida, restaurante, jantar, almoço, lanche, mercado, supermercado, pizza, hambúrguer, café, bar, bebida, ifood, padaria, açougue, feira
   - transporte: uber, taxi, ônibus, metro, gasolina, combustível, estacionamento, passagem, pedágio, 99, cabify
   - acomodação: hotel, pousada, airbnb, hospedagem, motel
   - entretenimento: cinema, show, teatro, parque, festa, jogo, balada, streaming, netflix, spotify
   - compras: roupa, sapato, shopping, eletrônico, livro, presente, perfume, maquiagem
   - contas: luz, água, telefone, internet, aluguel, energia, conta, boleto, iptu
   - saúde: farmácia, remédio, médico, consulta, hospital, dentista, academia, exame
   - outros: se não se encaixar em nenhuma categoria acima
   - Se categoria for mencionada explicitamente, use-a
   
5. **date**: Extraia a data aceitando TODAS as variações:
   - Hoje: "hoje", "data de hoje", "data atual", "data de hoje", "hoje mesmo", "neste dia" → "today"
   - Amanhã: "amanhã", "amanha", "dia de amanhã" → "tomorrow"
   - Depois: "depois de amanhã", "daqui 2 dias" → "day_after_tomorrow"
   - Dias futuros: "daqui a 3 dias", "em 5 dias" → "in_3_days", "in_5_days"
   - Data específica: "15/01", "15/01/2024", "15 de janeiro" → converta para "YYYY-MM-DD"
   - Se não mencionar data, use "today"

Exemplos de entrada e saída:

Entrada: "adicionar despesa jantar valor 150 reais hoje"
Saída: {"action":"create","description":"Jantar","amount":150,"category":"alimentação","date":"today"}

Entrada: "cria despesa uber 35 reais"
Saída: {"action":"create","description":"Uber","amount":35,"category":"transporte","date":"today"}

Entrada: "registre gasto com pizza no valor de 50 reais data de hoje"
Saída: {"action":"create","description":"Pizza","amount":50,"category":"alimentação","date":"today"}

Entrada: "paguei mercado 250 reais amanhã"
Saída: {"action":"create","description":"Mercado","amount":250,"category":"alimentação","date":"tomorrow"}

Entrada: "gastei 80 em cinema data atual"
Saída: {"action":"create","description":"Cinema","amount":80,"category":"entretenimento","date":"today"}

Entrada: "nova finança farmácia com o valor de 45 reais"
Saída: {"action":"create","description":"Farmácia","amount":45,"category":"saúde","date":"today"}

Entrada: "mostrar despesas"
Saída: {"action":"view","description":null,"amount":null,"category":null,"date":null}

Entrada: "listar gastos"
Saída: {"action":"view","description":null,"amount":null,"category":null,"date":null}

IMPORTANTE: Sempre retorne JSON válido, nunca retorne texto explicativo ou markdown.`;

export async function parseFinanceIntent(
  userText: string
): Promise<FinanceIntent> {
  if (!AI_ENABLED || !OPENAI_API_KEY) {
    throw new Error("AI disabled");
  }

  try {
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
        timeout: 10000,
      }
    );

    const content = response.data.choices[0].message.content;
    const parsed: FinanceIntent = JSON.parse(content);

    return parsed;
  } catch (error: any) {
    console.error("[AI] Error parsing finance intent:", error.message);
    throw error;
  }
}

export function isAIEnabled(): boolean {
  return AI_ENABLED && !!OPENAI_API_KEY;
}

interface RecommendationContext {
  movies?: string[];
  destinations?: string[];
  dateLocations?: string[];
  expenses?: Array<{ category: string; description: string; amount: number }>;
}

export async function generateRecommendation(
  type: "movies" | "travel" | "date" | "finance",
  context: RecommendationContext
): Promise<string> {
  if (!AI_ENABLED || !OPENAI_API_KEY) {
    throw new Error("AI disabled");
  }

  let systemPrompt = "";
  let userPrompt = "";

  switch (type) {
    case "movies":
      systemPrompt = `Você é um especialista em cinema que recomenda filmes para casais.
      
      IMPORTANTE: 
      - NÃO inclua mensagens introdutórias ou de conclusão
      - Vá direto para a lista numerada de filmes
      - Use Markdown corretamente: **Título do Filme** para negrito
      - Cada filme deve ter: número, título em negrito, ano, breve sinopse e "Por que assistir:" em negrito
      - Não use emojis na resposta
      
      Formato da resposta:
      1. **Nome do Filme** (Ano)
         Breve descrição do filme em 2-3 linhas.
         **Por que assistir:** Razão específica para o casal.`;

      userPrompt =
        context.movies && context.movies.length > 0
          ? `Liste 5 filmes para um casal assistir juntos. Eles JÁ ASSISTIRAM: ${context.movies.join(
              ", "
            )}. NÃO sugira esses filmes. Vá direto para a lista numerada.`
          : `Liste 5 filmes românticos, de comédia romântica ou dramas emocionantes para um casal. Vá direto para a lista numerada.`;
      break;

    case "travel":
      systemPrompt = `Você é um especialista em viagens que recomenda destinos românticos para casais.
      
      IMPORTANTE:
      - NÃO inclua mensagens introdutórias ou de conclusão
      - Vá direto para a lista numerada de destinos
      - Use Markdown: **Nome do Destino** para negrito
      - Cada destino: número, nome em negrito, atrativos, melhor época, orçamento e "Por que é especial:" em negrito
      - Não use emojis na resposta
      
      Formato da resposta:
      1. **Nome do Destino**
         Principais atrativos descritos brevemente.
         **Melhor época:** Período ideal
         **Orçamento:** Baixo/Médio/Alto
         **Por que é especial:** Razão específica para casais.`;

      userPrompt =
        context.destinations && context.destinations.length > 0
          ? `Liste 5 destinos para um casal viajar. Eles JÁ VISITARAM: ${context.destinations.join(
              ", "
            )}. NÃO sugira esses lugares. Vá direto para a lista numerada.`
          : `Liste 5 destinos românticos para um casal viajar, variando perfis e orçamentos. Vá direto para a lista numerada.`;
      break;

    case "date":
      systemPrompt = `Você é um especialista em relacionamentos que sugere lugares para encontros românticos.
      
      IMPORTANTE:
      - NÃO inclua mensagens introdutórias ou de conclusão
      - Vá direto para a lista numerada de lugares
      - Use Markdown: **Nome do Local/Atividade** para negrito
      - Cada sugestão: número, nome em negrito, descrição, ocasião ideal, faixa de preço e "Por que vai amar:" em negrito
      - Não use emojis na resposta

      Formato da resposta:
      1. **Nome do Local ou Atividade**
         Descrição da experiência em 2-3 linhas.
         **Ocasião:** Dia/Noite, Casual/Especial
         **Preço:** R$ estimado
         **Por que vai amar:** Razão específica.`;

      userPrompt =
        context.dateLocations && context.dateLocations.length > 0
          ? `Liste 5 lugares para um casal ter encontros românticos. Eles JÁ FORAM em: ${context.dateLocations.join(
              ", "
            )}. NÃO sugira esses lugares. Vá direto para a lista numerada.`
          : `Liste 5 lugares e atividades criativas para um casal ter encontros românticos memoráveis. Vá direto para a lista numerada.`;
      break;

    case "finance":
      systemPrompt = `Você é um consultor financeiro especializado em finanças pessoais para casais.
      
      IMPORTANTE:
      - NÃO inclua mensagens introdutórias ou de conclusão
      - Vá direto para a análise e dicas
      - Use Markdown: **Título das Seções** para negrito
      - Estrutura: Análise dos gastos + Lista numerada de dicas práticas
      - Não use emojis na resposta
      
      Formato da resposta:
      **Análise dos Gastos:**
      Breve análise dos principais gastos em 2-3 linhas.
      
      **Dicas de Economia:**
      1. **Nome da Dica**
         Explicação prática e específica.`;

      if (context.expenses && context.expenses.length > 0) {
        const categories = context.expenses.reduce((acc: any, exp) => {
          if (!acc[exp.category]) {
            acc[exp.category] = { total: 0, items: [] };
          }
          acc[exp.category].total += exp.amount;
          acc[exp.category].items.push(
            `${exp.description}: R$ ${exp.amount.toFixed(2)}`
          );
          return acc;
        }, {});

        const summary = Object.entries(categories)
          .map(
            ([cat, data]: [string, any]) =>
              `${cat}: R$ ${data.total.toFixed(2)} (${data.items.join(", ")})`
          )
          .join("\n");

        userPrompt = `Analise os gastos deste casal e forneça 5 dicas personalizadas de economia:

${summary}

Total gasto: R$ ${context.expenses
          .reduce((sum, exp) => sum + exp.amount, 0)
          .toFixed(2)}

Vá direto para a análise e lista de dicas.`;
      } else {
        userPrompt = `Forneça 5 dicas gerais de finanças pessoais para um casal organizar despesas e economizar. Vá direto para a lista de dicas.`;
      }
      break;
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const recommendation = response.data.choices[0].message.content;

    return recommendation;
  } catch (error: any) {
    console.error(
      `[AI] Error generating ${type} recommendation:`,
      error.message
    );
    throw error;
  }
}
