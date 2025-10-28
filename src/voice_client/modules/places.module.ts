import axios from "axios";

const API_URL = "http://localhost:3000/places";
const LAT_CENTRO = -25.4411;
const LON_CENTRO = -49.2670;

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function fetchPlaces(
  command: string,
  latitude: number = LAT_CENTRO,
  longitude: number = LON_CENTRO,
  radius: number = 2000
): Promise<any> {
  try {
    const params = {
      latitude,
      longitude,
      radius,
      voice: "true",
      keyword: command.trim(),
    };

    const response = await axios.get(API_URL, { params });
    const data = response.data;

    const results = data.results || [];
    const message = data.message;

    if (message && results.length === 0) {
      return { success: false, error: message };
    }

    const filteredResults = results.map((place: any) => {
      const obj: Record<string, any> = {};

      if (place.name) obj.nome = place.name;
      if (place.vicinity || place.formatted_address)
        obj.endereco = place.vicinity || place.formatted_address;
      if (place.rating !== undefined && place.rating !== null)
        obj.avaliacao = place.rating;
      if (place.user_ratings_total)
        obj.avaliacoes_totais = place.user_ratings_total;
      if (
        place.opening_hours &&
        place.opening_hours.open_now !== undefined &&
        place.opening_hours.open_now !== null
      )
        obj.aberto_agora = place.opening_hours.open_now;
      if (place.types && Array.isArray(place.types))
        obj.tipos = place.types;

     
      if (place.photos && place.photos.length > 0 && place.photos[0].photo_reference) {
        obj.foto = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_API_KEY}`;
      }

      return obj;
    });

    return {
      success: true,
      total: filteredResults.length,
      data: filteredResults,
    };
  } catch (error: any) {
    return { success: false, error: `Erro ao consultar o Google Places API: ${error.message}` };
  }
}

export async function execute(text: string, token?: string): Promise<any> {
  const normalizedText = normalize(text);

  if (!normalizedText || normalizedText.trim() === "") {
    return { success: false, error: "Comando de voz vazio ou inválido." };
  }

  const results = await fetchPlaces(normalizedText);

  if (!results.success || !results.data || results.data.length === 0) {
    return { success: false, error: results.error || "Nenhum local encontrado." };
  }

  return {
    success: true,
    total: results.total,
    data: results.data,
  };
}

export default { execute };
