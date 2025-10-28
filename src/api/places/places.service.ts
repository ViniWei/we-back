import { fetchNearbyPlacesFromAPI, GooglePlace } from "./places.repository.js";

export interface PlaceResult {
  name: string;
  address?: string;
  rating: number | null;
  totalRatings: number;
  types: string[];
}

export async function getNearbyPlaces(
  latitude: string,
  longitude: string,
  type: string,
  radius: number,
  keyword: string = ""
): Promise<PlaceResult[]> {
  const places: GooglePlace[] = await fetchNearbyPlacesFromAPI(latitude, longitude, type, radius, keyword);

  if (!places || places.length === 0) {
    return [];
  }

  const searchTerm = keyword.trim().toLowerCase();

  return places
    .filter(place => {
      // Excluir hotéis se o tipo for "restaurant"
      if (type === "restaurant" && place.name.toLowerCase().includes("hotel")) {
        return false;
      }

      // Filtro adicional pelo termo de busca
      if (searchTerm) {
        const name = place.name?.toLowerCase() || "";
        const types = place.types?.join(" ").toLowerCase() || "";
        const vicinity = place.vicinity?.toLowerCase() || "";

        return (
          name.includes(searchTerm) ||
          types.includes(searchTerm) ||
          vicinity.includes(searchTerm)
        );
      }

      return true;
    })
    .map(place => ({
      name: place.name,
      address: place.vicinity,
      rating: place.rating || null,
      totalRatings: place.user_ratings_total || 0,
      types: place.types || []
    }));
}
