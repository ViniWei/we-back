export class Intent {
  private trip_create: string[] = [
    // Variações com "adicionar"
    "adicionar viagem",
    "adicionar uma viagem",
    "adicionou viagem",
    "adicionou uma viagem",
    "adicionaram viagem",
    "adicione viagem",
    "adicione uma viagem",

    // Variações com "criar"
    "criar viagem",
    "criar uma viagem",
    "cria viagem",
    "cria uma viagem",
    "criou viagem",
    "criou uma viagem",
    "criaram viagem",
    "crie viagem",
    "crie uma viagem",

    // Variações com "marcar"
    "marcar viagem",
    "marcar uma viagem",
    "marca viagem",
    "marca uma viagem",
    "marcou viagem",
    "marcou uma viagem",
    "marcaram viagem",
    "marque viagem",
    "marque uma viagem",

    // Variações com "cadastrar"
    "cadastrar viagem",
    "cadastrar uma viagem",
    "cadastra viagem",
    "cadastre viagem",
    "cadastrou viagem",
    "cadastraram viagem",

    // Variações com "programar"
    "programar viagem",
    "programar uma viagem",
    "programa viagem",
    "programa uma viagem",
    "programou viagem",
    "programaram viagem",
    "programe viagem",
    "programe uma viagem",

    // Variações com "planejar"
    "planejar viagem",
    "planejar uma viagem",
    "planeja viagem",
    "planeja uma viagem",
    "planejou viagem",
    "planejaram viagem",
    "planeje viagem",
    "planeje uma viagem",

    // Variações com "agendar"
    "agendar viagem",
    "agendar uma viagem",
    "agenda viagem",
    "agenda uma viagem",
    "agendou viagem",
    "agendaram viagem",
    "agende viagem",
    "agende uma viagem",

    // Variações com "registrar"
    "registrar viagem",
    "registrar uma viagem",
    "registra viagem",
    "registre viagem",
    "registrou viagem",
    "registraram viagem",

    // Variações com "inserir"
    "inserir viagem",
    "inserir uma viagem",
    "insere viagem",
    "insira viagem",
    "inseriu viagem",

    // Variações com "lançar"
    "lançar viagem",
    "lança viagem",
    "lance viagem",
    "lançou viagem",

    // Variações com "anotar"
    "anotar viagem",
    "anota viagem",
    "anote viagem",
    "anotou viagem",

    // Variações diretas/simples
    "nova viagem",
    "novo passeio",
    "nova excursão",
    "viagem para",
    "viagem pra",
    "viagem pro",
    "viagem em",
    "viajar para",
    "viajar pra",
    "vamos viajar",
    "vamos para",
    "vamos pra",
    "ir para",
    "ir pra",
    "conhecer",
    "visitar",
    "passeio em",
    "passeio para",
    "excursão para",
    "roteiro para",
    "roteiro em",
  ];

  private trip_view: string[] = [
    "ver viagem",
    "ver viagens",
    "listar viagens",
    "mostrar viagens",
    "ver proximas viagens",
    "ver próximas viagens",
    "viagens agendadas",
    "viagens marcadas",
    "ver viagens marcadas",
    "ver viagens agendadas",
    "proximas viagens",
    "próximas viagens",
  ];

  private finance_create: string[] = [
    // Variações com "adicionar"
    "adicionar despesa",
    "adicionar uma despesa",
    "adicionar gasto",
    "adicionar um gasto",
    "adicionar finança",
    "adicionar uma finança",
    "adicionar finanças",
    "adicionou despesa",
    "adicionou uma despesa",
    "adicionou gasto",
    "adicionaram despesa",
    "adicione despesa",
    "adicione uma despesa",
    "adicione gasto",

    // Variações com "registrar"
    "registrar despesa",
    "registrar uma despesa",
    "registrar gasto",
    "registrar um gasto",
    "registrar finança",
    "registrar uma finança",
    "registrar finanças",
    "registre despesa",
    "registre uma despesa",
    "registre gasto",
    "registraram despesa",
    "registrou despesa",

    // Variações com "criar"
    "criar despesa",
    "criar uma despesa",
    "criar gasto",
    "criar um gasto",
    "criar finança",
    "criar uma finança",
    "criar finanças",
    "cria despesa",
    "cria uma despesa",
    "cria gasto",
    "criou despesa",
    "criaram despesa",
    "crie despesa",
    "crie uma despesa",

    // Variações com "inserir"
    "inserir despesa",
    "inserir uma despesa",
    "inserir gasto",
    "inserir um gasto",
    "inserir finança",
    "insere despesa",
    "insira despesa",
    "inseriu despesa",

    // Variações com "lançar"
    "lançar despesa",
    "lançar uma despesa",
    "lançar gasto",
    "lança despesa",
    "lance despesa",
    "lançou despesa",

    // Variações com "nova/novo"
    "nova despesa",
    "novo gasto",
    "nova finança",
    "novas despesas",
    "novos gastos",

    // Variações com "anotar"
    "anotar despesa",
    "anotar gasto",
    "anotar finança",
    "anota despesa",
    "anote despesa",
    "anotou despesa",

    // Variações com "cadastrar"
    "cadastrar despesa",
    "cadastrar gasto",
    "cadastrar finança",
    "cadastre despesa",
    "cadastrou despesa",

    // Variações diretas/simples
    "despesa de",
    "gasto de",
    "gasto com",
    "despesa com",
    "paguei",
    "gastei",
    "comprei",
    "compra de",
  ];

  private finance_view: string[] = [
    "ver despesa",
    "ver despesas",
    "listar despesas",
    "mostrar despesas",
    "exibir despesas",
    "ver finanças",
    "mostrar finanças",
    "listar finanças",
    "exibir finanças",
    "ver gastos",
    "mostrar gastos",
    "listar gastos",
    "exibir gastos",
    "consultar gastos",
    "consultar despesas",
    "consultar finanças",
    "ver todas as despesas",
    "ver meus gastos",
    "exibir meus gastos",
    "consultar minhas finanças",
  ];

  private activities_verbs: string[] = [
    // Variações com "marcar"
    "marcar",
    "marca",
    "marque",
    "marcou",
    "marcaram",
    "marcar encontro",
    "marcar um encontro",
    "marca encontro",
    "marque encontro",
    "marcou encontro",

    // Variações com "agendar"
    "agendar",
    "agenda",
    "agende",
    "agendou",
    "agendaram",
    "agendar encontro",
    "agendar um encontro",
    "agenda encontro",
    "agende encontro",
    "agendou encontro",

    // Variações com "criar"
    "criar",
    "cria",
    "crie",
    "criou",
    "criaram",
    "criar encontro",
    "criar um encontro",
    "cria encontro",
    "crie encontro",
    "criou encontro",

    // Variações com "adicionar"
    "adicionar",
    "adiciona",
    "adicione",
    "adicionou",
    "adicionaram",
    "adicionar encontro",
    "adicionar um encontro",
    "adiciona encontro",
    "adicione encontro",
    "adicionou encontro",

    // Variações com "planejar"
    "planejar",
    "planeja",
    "planeje",
    "planejou",
    "planejaram",
    "planejar encontro",
    "planejar um encontro",
    "planeja encontro",
    "planeje encontro",
    "planejou encontro",

    // Variações com "programar"
    "programar",
    "programa",
    "programe",
    "programou",
    "programaram",
    "programar encontro",
    "programar um encontro",
    "programa encontro",
    "programe encontro",
    "programou encontro",

    // Variações com "registrar"
    "registrar",
    "registra",
    "registre",
    "registrou",
    "registraram",
    "registrar encontro",
    "registrar um encontro",
    "registra encontro",
    "registre encontro",
    "registrou encontro",

    // Variações com "inserir"
    "inserir",
    "insere",
    "insira",
    "inseriu",
    "inserir encontro",
    "insere encontro",
    "insira encontro",

    // Variações com "anotar"
    "anotar",
    "anota",
    "anote",
    "anotou",
    "anotar encontro",
    "anota encontro",
    "anote encontro",

    // Variações diretas/simples
    "novo encontro",
    "nova atividade",
    "novo evento",
    "novo compromisso",
    "encontro em",
    "encontro no",
    "encontro na",
    "atividade em",
    "atividade no",
    "atividade na",
    "evento em",
    "evento no",
    "evento na",
    "compromisso em",
    "compromisso no",
    "compromisso na",
    "sair com",
    "sair para",
    "vamos sair",
    "vamos para",
    "vamos no",
    "vamos na",
    "ir no",
    "ir na",
    "ir para",
    "ir ao",
  ];

  private activities_view: string[] = [
    "ver atividade",
    "ver atividades",
    "listar atividades",
    "mostrar atividades",
    "consultar atividades",
    "ver proximas atividades",
    "ver próximas atividades",
    "atividades agendadas",
    "atividades marcadas",
    "ver encontro",
    "ver encontros",
    "mostrar encontros",
    "listar encontros",
    "consultar encontros",
    "ver proximos encontros",
    "ver próximos encontros",
    "encontros marcados",
    "encontros agendados",
    "ver evento",
    "ver eventos",
    "listar eventos",
    "mostrar eventos",
    "consultar eventos",
    "ver proximos eventos",
    "ver próximos eventos",
    "eventos marcados",
    "eventos agendados",
    "ver compromisso",
    "ver compromissos",
    "listar compromissos",
    "consultar compromissos",
  ];

  private place_verbs = "(buscar|procurar|achar|encontrar|localizar|ver)";
  private place_words =
    "(bares?|restaurantes?|hot[eé]is?|caf[eé]s?|cafeterias?|parques?|museus?|boates?|cinemas?|zool[oó]gicos?|mercados?|supermercados?" +
    "|pizzarias?|pizzas?|sushi|sushis?|hamburguerias?|hamb[uú]rguer(?:es)?|burgers?|burger" +
    "|churrascarias?|rod[ií]zio?s?|pastelarias?|past[eé]is?|sopas?|sopa" +
    "|comida\\s+(?:japonesa|italiana|chinesa|coreana|asi[aá]tica))";

  private places_patterns: RegExp[] = [
    new RegExp(`\\b${this.place_verbs}\\s+${this.place_words}\\b`, "i"),
    new RegExp(
      `\\b${this.place_words}\\s+(no|na|em|perto|pr[oó]ximo|proximo)\\b`,
      "i"
    ),
    new RegExp(
      `\\b${this.place_words}.*\\b(perto\\s+de\\s+mim|nas?\\s+proximidades|aqui\\s+perto)\\b`,
      "i"
    ),
  ];

  private trigger_words: string[] = [
    "buscar",
    "procurar",
    "achar",
    "encontrar",
    "adicionar",
    "criar",
    "cadastrar",
    "registrar",
    "planejar",
    "marcar",
    "programar",
    "mostrar",
    "listar",
    "ver",
    "exibir",
    "consultar",
    "agendar",
    "cancelar",
    "apagar",
    "remover",
    "excluir",
    "desmarcar",
    "deletar",
  ];

  public detect(text: string): {
    module: string | null;
    action: string | null;
  } {
    if (!text || typeof text !== "string") {
      console.warn("[Intent] Invalid text input:", text);
      return { module: null, action: null };
    }

    const t = text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    console.log("[Intent] Normalized text:", t);

    if (!t || t.length === 0) {
      return { module: null, action: null };
    }

    if (this.finance_view.some((p) => t.includes(p)))
      return { module: "finances", action: "view" };
    if (this.trip_view.some((p) => t.includes(p)))
      return { module: "trips", action: "view" };
    if (this.activities_view.some((p) => t.includes(p)))
      return { module: "activities", action: "view" };

    const hasTripKeywords =
      /\b(viagem|viagens|viajar|passeio|excursao|excursão|roteiro|visitar|conhecer)\b/i.test(
        t
      );
    const hasFinanceKeywords =
      /\b(despesa|despesas|gasto|gastos|finan[cç]a|finan[cç]as|valor|reais?|r\$|dinheiro|pagar|pagamento|custo|compra|comprei|paguei|gastei)\b/i.test(
        t
      );
    const hasActivityKeywords =
      /\b(encontro|encontros|atividade|atividades|evento|eventos|compromisso|compromissos|sair|jantar|almoço|almoco|cinema)\b/i.test(
        t
      );

    if (hasTripKeywords && this.trip_create.some((p) => t.includes(p)))
      return { module: "trips", action: "create" };

    if (hasActivityKeywords && this.activities_verbs.some((v) => t.includes(v)))
      return { module: "activities", action: "create" };

    if (hasFinanceKeywords && this.finance_create.some((p) => t.includes(p)))
      return { module: "finances", action: "create" };

    if (this.trip_create.some((p) => t.includes(p)))
      return { module: "trips", action: "create" };

    for (const pattern of this.places_patterns) {
      if (pattern.test(t)) return { module: "places", action: "search" };
    }

    if (this.activities_verbs.some((v) => t.includes(v))) {
      const notTrip = !this.trip_create.some((p) => t.includes(p));
      const notFinance = !this.finance_create.some((p) => t.includes(p));
      const notPlace = !this.places_patterns.some((r) => r.test(t));
      if (notTrip && notFinance && notPlace)
        return { module: "activities", action: "create" };
    }

    return { module: null, action: null };
  }
}

export default new Intent();
