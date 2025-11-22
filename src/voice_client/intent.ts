export class Intent {
  private trip_create: string[] = [
    "adicionar viagem", "criar viagem", "marcar viagem",
    "cadastrar viagem", "programar viagem", "planejar viagem",
    "agendar viagem", "nova viagem", "viagem para"
  ];

  private trip_view: string[] = [
    "ver viagem", "ver viagens", "listar viagens", "mostrar viagens",
    "ver proximas viagens", "ver próximas viagens",
    "viagens agendadas", "viagens marcadas",
    "ver viagens marcadas", "ver viagens agendadas",
    "proximas viagens", "próximas viagens"
  ];

  private finance_create: string[] = [
    "adicionar despesa", "registrar despesa", "nova despesa",
    "inserir despesa", "adicionar gasto", "registrar gasto",
    "adicionar finança", "registrar finança", "nova finança",
    "criar gasto", "criar despesa"
  ];

  private finance_view: string[] = [
    "ver despesa", "ver despesas", "listar despesas", "mostrar despesas",
    "exibir despesas", "ver finanças", "mostrar finanças",
    "listar finanças", "exibir finanças", "ver gastos",
    "mostrar gastos", "listar gastos", "exibir gastos",
    "consultar gastos", "consultar despesas", "consultar finanças",
    "ver todas as despesas", "ver meus gastos",
    "exibir meus gastos", "consultar minhas finanças"
  ];

 
  private dates_view: string[] = [
    "ver encontro", "ver encontros", "mostrar encontros", "listar encontros",
    "consultar encontros", "ver proximos encontros", "ver próximos encontros",
    "encontros marcados", "encontros agendados"
  ];

  private dates_create: string[] = [
    "marcar encontro",
    "agendar encontro",
    "programar encontro",
    "marcar um encontro",
    "agendar um encontro",
    "programar um encontro",
    "encontro"
  ];


  private activities_view: string[] = [
    "ver atividade", "ver atividades", "listar atividades", "mostrar atividades",
    "consultar atividades", "ver proximas atividades", "ver próximas atividades",
    "atividades agendadas", "atividades marcadas",
    "ver evento", "ver eventos", "listar eventos", "mostrar eventos", "consultar eventos",
    "ver proximos eventos", "ver próximos eventos",
    "eventos marcados", "eventos agendados",
    "ver compromisso", "ver compromissos", "listar compromissos", "consultar compromissos"
  ];


  private activities_create: string[] = [
    "marcar", "agendar", "criar", "adicionar",
    "planejar", "programar", "registrar"
  ];

  private place_verbs = "(buscar|procurar|achar|encontrar|localizar|ver)";
  private place_words =
    "(bares?|restaurantes?|hot[eé]is?|caf[eé]s?|cafeterias?|parques?|museus?|boates?|cinemas?|zool[oó]gicos?|mercados?|supermercados?" +
    "|pizzarias?|pizzas?|sushi|sushis?|hamburguerias?|hamb[uú]rguer(?:es)?|burgers?|burger" +
    "|churrascarias?|rod[ií]zio?s?|pastelarias?|past[eé]is?|sopas?|sopa" +
    "|comida\\s+(?:japonesa|italiana|chinesa|coreana|asi[aá]tica))";

  private places_patterns: RegExp[] = [
    new RegExp(`\\b${this.place_verbs}\\s+${this.place_words}\\b`, "i"),
    new RegExp(`\\b${this.place_words}\\s+(no|na|em|perto|pr[oó]ximo|proximo)\\b`, "i"),
    new RegExp(`\\b${this.place_words}.*\\b(perto\\s+de\\s+mim|nas?\\s+proximidades|aqui\\s+perto)\\b`, "i")
  ];

  private trigger_words: string[] = [
    "buscar", "procurar", "achar", "encontrar",
    "adicionar", "criar", "cadastrar", "registrar",
    "planejar", "marcar", "programar", "mostrar",
    "listar", "ver", "exibir", "consultar", "agendar",
    "cancelar", "apagar", "remover", "excluir", "desmarcar", "deletar"
  ];

  public detect(text: string): { module: string | null; action: string | null } {
    const t = text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // FINANÇAS
    if (this.finance_view.some(p => t.includes(p)))
      return { module: "finances", action: "view" };

    if (this.finance_create.some(p => t.includes(p)))
      return { module: "finances", action: "create" };

    // VIAGENS
    if (this.trip_view.some(p => t.includes(p)))
      return { module: "trips", action: "view" };

    if (this.trip_create.some(p => t.includes(p)))
      return { module: "trips", action: "create" };

    // LOCAIS (places)
    for (const pattern of this.places_patterns) {
      if (pattern.test(t)) return { module: "places", action: "search" };
    }

    // DATES (encontros) - VIEW
    if (this.dates_view.some(p => t.includes(p))) {
      return { module: "dates", action: "view" };
    }

    // DATES (encontros) - CREATE
    if (this.dates_create.some(p => t.includes(p))) {
      return { module: "dates", action: "create" };
    }

    if (this.activities_view.some(p => t.includes(p))) {
      return { module: "activities", action: "view" };
    }

    if (this.activities_create.some(v => t.includes(v))) {
      const notTripCreate = !this.trip_create.some(p => t.includes(p));
      const notFinanceCreate = !this.finance_create.some(p => t.includes(p));
      const notPlace = !this.places_patterns.some(r => r.test(t));
      const notDatesCreate = !this.dates_create.some(p => t.includes(p));

      if (notTripCreate && notFinanceCreate && notPlace && notDatesCreate) {
        return { module: "activities", action: "create" };
      }
    }

    return { module: null, action: null };
  }
}

export default new Intent();
