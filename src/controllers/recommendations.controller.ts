import { Request, Response } from "express";
import { generateRecommendation } from "../services/ai.service";
import movieListsRepository from "../repositories/movieLists.repository";
import movieListItemsRepository from "../repositories/movieListItems.repository";
import moviesRepository from "../repositories/movies.repository";
import tripsRepository from "../repositories/trips.repository";
import datesRepository from "../repositories/dates.repository";
import financesRepository from "../repositories/finances.repository";

export const getRecommendation = async (req: Request, res: Response) => {
  try {
    const { type, previouslyRecommended } = req.body as {
      type: "movies" | "travel" | "date" | "finance";
      previouslyRecommended?: string[]; // Itens já recomendados anteriormente
    };
    const userId = req.user?.id;
    const groupId = req.user?.groupId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Usuário não pertence a um grupo",
      });
    }

    if (!["movies", "travel", "date", "finance"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de recomendação inválido",
      });
    }

    let context: any = {};

    switch (type) {
      case "movies":
        const movieLists = await movieListsRepository.getAllByGroupId(groupId);
        const allMovieTitles: string[] = [];

        for (const list of movieLists) {
          const items = await movieListItemsRepository.getAllByListId(list.id!);
          for (const item of items) {
            const movie = await moviesRepository.getById(item.movieId!);
            if (movie?.title) {
              allMovieTitles.push(movie.title);
            }
          }
        }

        const combinedMovies = previouslyRecommended
          ? [...new Set([...allMovieTitles, ...previouslyRecommended])]
          : allMovieTitles;

        context.movies = combinedMovies;
        break;

      case "travel":
        const trips = await tripsRepository.getAllByGroupId(groupId);
        const dbDestinations = trips
          .filter((trip) => trip.destination)
          .map((trip) => trip.destination);

        const combinedDestinations = previouslyRecommended
          ? [...new Set([...dbDestinations, ...previouslyRecommended])]
          : dbDestinations;

        context.destinations = combinedDestinations;
        break;

      case "date":
        const dates = await datesRepository.getAllByGroupId(groupId);
        context.dateLocations = dates
          .filter((date) => date.location)
          .map((date) => date.location);
        break;

      case "finance":
        const allFinances = await financesRepository.getAllByGroupId(groupId);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const recentExpenses = allFinances
          .filter((finance) => {
            const transactionDate = new Date(finance.transaction_date!);
            return transactionDate >= threeMonthsAgo;
          })
          .map((finance) => ({
            category: getCategoryName(finance.type_id || 0),
            description: finance.description || "Despesa",
            amount: finance.amount || 0,
          }));

        context.expenses = recentExpenses;
        break;
    }

    const recommendation = await generateRecommendation(type, context);

    return res.status(200).json({
      success: true,
      data: {
        type,
        recommendation,
        context_size: getContextSize(context),
      },
    });
  } catch (error: any) {
    console.error("[RECOMMENDATIONS] Error:", error.message);

    if (error.message === "AI disabled") {
      return res.status(503).json({
        success: false,
        message: "Serviço de recomendações indisponível no momento",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erro ao gerar recomendação",
    });
  }
};

function getCategoryName(typeId: number): string {
  const categories: { [key: number]: string } = {
    1: "alimentação",
    2: "transporte",
    3: "acomodação",
    4: "entretenimento",
    5: "compras",
    6: "contas",
    7: "saúde",
    8: "outros",
  };
  return categories[typeId] || "outros";
}

function getContextSize(context: any): number {
  if (context.movies) return context.movies.length;
  if (context.destinations) return context.destinations.length;
  if (context.dateLocations) return context.dateLocations.length;
  if (context.expenses) return context.expenses.length;
  return 0;
}

export default {
  getRecommendation,
};
