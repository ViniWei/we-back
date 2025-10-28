import fetch from "node-fetch";

const API_KEY = process.env.GOOGLE_API_KEY as string;

export interface GooglePlace {
  name: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
}

interface GooglePlacesResponse {
  status: string;
  error_message?: string;
  results: GooglePlace[];
}

export async function fetchNearbyPlacesFromAPI(
  latitude: string,
  longitude: string,
  type: string,
  radius: number,
  keyword: string = ""
): Promise<GooglePlace[]> {
  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.append("location", `${latitude},${longitude}`);
    url.searchParams.append("radius", radius.toString());
    if (type) url.searchParams.append("type", type);
    if (keyword) url.searchParams.append("keyword", keyword);
    url.searchParams.append("key", API_KEY);

    const response = await fetch(url);
    const data = await response.json() as GooglePlacesResponse; // 👈 aqui corrigido

    if (data.status !== "OK") {
      console.error("Google Places API Error:", data.status, data.error_message);
      return [];
    }

    return data.results;
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
}
