import { Request, Response } from "express";
import { getNearbyPlaces } from "./places.service.js";
import { spawnSync } from "child_process";

// Coordenadas conhecidas (Curitiba)
const LOCATIONS: Record<string, { lat: string; lon: string }> = {
  centro: { lat: "-25.4411", lon: "-49.2670" },
  "centro civico": { lat: "-25.4180", lon: "-49.2713" },
  centrocivico: { lat: "-25.4180", lon: "-49.2713" },
  batel: { lat: "-25.4417", lon: "-49.2900" },
  "agua verde": { lat: "-25.4494", lon: "-49.2773" },
  aguaverde: { lat: "-25.4494", lon: "-49.2773" },
  portao: { lat: "-25.4740", lon: "-49.2940" },
  "jardim botanico": { lat: "-25.4424", lon: "-49.2435" },
  jardimbotanico: { lat: "-25.4424", lon: "-49.2435" }
};

async function recognizeVoice(): Promise<{ command: string }> {
  return new Promise((resolve, reject) => {
    try {
      const result = spawnSync("python", ["src/voice_client/voice_search.py"], { encoding: "utf-8" });
      if (result.error) return reject(result.error);

      const output = result.stdout.trim();
      const parsed = JSON.parse(output);
      console.log("🎤 JSON recebido do Python:", parsed);
      resolve(parsed);
    } catch (err) {
      reject(err);
    }
  });
}

// Interpreta o comando de voz
function interpretCommand(command: string): { type?: string; keyword?: string; area?: string } {
  const lower = command
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  let type: string | undefined;
  let keyword: string | undefined;
  let area: string | undefined;

  // Tipos principais
  const typeMap: Record<string, string> = {
    hotel: "hotel", hoteis: "hotel",
    bar: "bar", bares: "bar",
    parque: "park", parques: "park",
    mercado: "supermarket", mercados: "supermarket",
    cafeteria: "cafe", cafeterias: "cafe",
    restaurante: "restaurant", restaurantes: "restaurant",
    cinema: "movie_theater", cinemas: "movie_theater",
    filme: "movie_theater", filmes: "movie_theater",
    boate: "night_club", boates: "night_club",
    museu: "museum", museus: "museum",
    zoologico: "zoo", zoologicos: "zoo"
  };

  // Palavras relacionadas à comida (inclui redes e tipos específicos)
  const foodKeywords = [
    "pizzaria", "pizza",
    "hamburgueria", "hamburguer", "burger", "mcdonalds", "burger king",
    "sushi", "japonesa", "comida japonesa",
    "coreana", "comida coreana",
    "asiatica", "comida asiatica", "chinesa", "comida chinesa",
    "italiana", "comida italiana", "massas", "macarrao", "lasanha",
    "churrascaria", "churrasco", "rodizio",
    "pastelaria", "pastel",
    "sopa", "sopas"
  ];

  // Detecta tipo principal
  for (const [key, value] of Object.entries(typeMap)) {
    if (lower.includes(key)) {
      type = value;
      break;
    }
  }

  // Detecta comidas e especializações
  for (const food of foodKeywords) {
    if (lower.includes(food)) {
      type = "restaurant";
      keyword = food;
      break;
    }
  }

  // Detecta áreas conhecidas
  for (const key of Object.keys(LOCATIONS)) {
    if (lower.includes(key)) {
      area = key;
      break;
    }
  }

  // Expressões de proximidade
  const nearPhrases = [
    "perto", "proximo", "proximo de mim", "perto de mim",
    "nas proximidades", "nas redondezas"
  ];
  if (nearPhrases.some(p => lower.includes(p))) area = "user";

  return { type, keyword, area };
}

// Controller principal
export async function getNearbyPlacesController(req: Request, res: Response): Promise<void> {
  try {
    let latitude = String(req.query.latitude || "");
    let longitude = String(req.query.longitude || "");
    let radius = String(req.query.radius || "2000");
    let type = "";
    let keyword = "";

    // 🔹 Comando vindo da voz (Python)
    let command = "";
    if (req.query.voice === "true" && typeof req.query.keyword === "string") {
      command = req.query.keyword;
      console.log(`🎧 Comando recebido: "${command}"`);
    }

    if (!command && req.query.voice === "true") {
      const result = await recognizeVoice();
      command = result.command;
    }

    if (!command) {
      res.status(400).json({ message: "Nenhum comando de voz fornecido." });
      return;
    }

    const { type: detectedType, keyword: detectedKeyword, area } = interpretCommand(command);

    if (!detectedType) {
      res.status(400).json({
        message: "Não foi possível identificar o tipo de local solicitado.",
        command
      });
      return;
    }

    type = detectedType;
    keyword = detectedKeyword || "";

    // Define localização
    if (area && area !== "user") {
      const loc = LOCATIONS[area];
      if (loc) {
        latitude = loc.lat;
        longitude = loc.lon;
      }
    }

    // Coordenadas padrão
    if (!latitude || !longitude) {
      latitude = "-25.4411";
      longitude = "-49.2670";
    }

    console.log(`📍 Tipo: ${type} | Palavra-chave: ${keyword || "-"} | Área: ${area || "padrão"} | Coordenadas: ${latitude}, ${longitude}`);

    // 🔍 Busca de lugares
    const places = await getNearbyPlaces(latitude, longitude, type, Number(radius), keyword);

    // 🧹 Filtros avançados
    const filteredPlaces = places.filter((place) => {
      const name = place.name?.toLowerCase() || "";
      const types = Array.isArray(place.types) ? place.types.map(t => t.toLowerCase()) : [];

      // Remove hotéis e saunas se não for tipo hotel
      if (type !== "hotel" && (name.includes("hotel") || types.includes("lodging"))) return false;
      if (name.includes("sauna") || name.includes("spa")) return false;

      // Regras por tipo
      if (type === "restaurant") {
        const isFood = types.some(t => ["restaurant", "food", "establishment"].includes(t));
        const hasBar = types.includes("bar");
        if (!isFood || hasBar) return false;
      }

      if (type === "cafe") {
        const isCafe = types.includes("cafe");
        const isFood = types.some(t => ["food", "restaurant", "establishment"].includes(t));
        if (!isCafe && !isFood) return false;
      }

      if (type === "park") {
        const isPark = types.includes("park");
        const isTourist = types.includes("tourist_attraction");
        if (!(isPark && isTourist)) return false;
      }

      if (type === "museum" && !types.includes("museum")) return false;
      if (type === "movie_theater" && !types.includes("movie_theater")) return false;
      if (type === "night_club" && !types.includes("night_club")) return false;
      if (type === "zoo" && !types.includes("zoo")) return false;

      // Filtro de palavras-chave
      if (keyword) {
        const normalizedKeyword = keyword.toLowerCase().replace(/s$/i, "");
        if (!name.includes(normalizedKeyword)) return false;
      }

      return true;
    });

    if (!filteredPlaces.length) {
      res.status(404).json({
        message: "Nenhum local encontrado após aplicar os filtros.",
        query: { latitude, longitude, type, keyword }
      });
      return;
    }

    res.json({
      query: { latitude, longitude, radius, type, keyword },
      totalResults: filteredPlaces.length,
      results: filteredPlaces
    });
  } catch (error: any) {
    console.error("💥 Erro em getNearbyPlacesController:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}
