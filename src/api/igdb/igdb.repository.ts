import fetch from "node-fetch";
import { fetchToken } from "./igdb.auth";
import { IgdbGameRaw, Game } from "./igdb.types";

const IGDB_ENDPOINT = "https://api.igdb.com/v4/games";

/** Monta a URL da capa a partir do ID da imagem. */
function coverUrlFromImageId(imageId: string | undefined): string | null {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
}

/** Função genérica para enviar queries diretas à API IGDB (usada nas recomendações). */
async function postIgdb(query: string): Promise<any> {
  const token = await fetchToken();
  const res = await fetch(IGDB_ENDPOINT, {
    method: "POST",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID || "",
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body: query,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IGDB query error: ${res.status} ${text}`);
  }

  return await res.json();
}

/** Busca jogos crus diretamente (sem formatação). */
async function searchGamesRaw(q: string, limit = 10, offset = 0): Promise<IgdbGameRaw[]> {
  const safeQ = q.replace(/"/g, '\\"');
  const query = `fields id,name,platforms.name,cover.image_id; search "${safeQ}"; limit ${limit}; offset ${offset};`;
  const data = await postIgdb(query);
  return Array.isArray(data) ? (data as IgdbGameRaw[]) : [];
}

/** Busca jogo cru por ID. */
async function getGameByIdRaw(id: number): Promise<IgdbGameRaw | null> {
  const query = `fields id,name,platforms.name,cover.image_id; where id = ${id};`;
  const data = await postIgdb(query);
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0] as IgdbGameRaw;
}

/** Busca formatada de jogos com paginação. */
async function searchGames(q: string, page = 1, pageSize = 10): Promise<Game[]> {
  const offset = (page - 1) * pageSize;
  const raw = await searchGamesRaw(q, pageSize, offset);
  return raw.map((g) => {
    const coverId = g.cover?.image_id;
    return {
      id: g.id,
      name: g.name,
      platforms: (g.platforms || []).map((p) => p.name || "").filter(Boolean),
      cover_url: coverUrlFromImageId(coverId),
    } as Game;
  });
}

/** Busca jogo formatado por ID. */
async function getGameById(id: number): Promise<Game | null> {
  const raw = await getGameByIdRaw(id);
  if (!raw) return null;
  const coverId = raw.cover?.image_id;
  return {
    id: raw.id,
    name: raw.name,
    platforms: (raw.platforms || []).map((p) => p.name || "").filter(Boolean),
    cover_url: coverUrlFromImageId(coverId),
  } as Game;
}

/** Exporta todas as funções de repositório. */
export default {
  searchGames,
  getGameById,
  postIgdb, // ✅ adicionada para consultas diretas (usada nas recomendações)
};

export type { Game };
