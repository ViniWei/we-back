import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import usersRoutes from "./routes/users.routes";
import groupsRoutes from "./routes/groups.routes";
import moviesRoutes from "./routes/movies.routes";
import movieListsRoutes from "./routes/movieLists.routes";
import tripsRoutes from "./routes/trips.routes";
import financesRoutes from "./routes/finances.routes";
import activitiesRoutes from "./routes/activities.routes";
import gamesRoutes from "./routes/games.routes";
import voiceRoutes from "./routes/voice.routes";
import igdbRoutes from "./api/igdb/igdb.routes";
import placesRoutes from "./api/places/places.routes";
import datesRoutes from "./routes/dates.routes";
import { pool } from "./db";
import errorHelper from "./helper/error.helper";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:8081",
    credentials: true,
  })
);

app.use("/users", usersRoutes);
app.use("/groups", groupsRoutes);
app.use("/movies", moviesRoutes);
app.use("/movie-lists", movieListsRoutes);
app.use("/finances", financesRoutes);
app.use("/trips", tripsRoutes);
app.use("/activities", activitiesRoutes);
app.use("/games", gamesRoutes);
app.use("/voice", voiceRoutes);
app.use("/dates", datesRoutes);


app.use("/igdb", igdbRoutes);
app.use("/places", placesRoutes);

app.get("/", (_req, res) => {
  res.send("API working.");
});

app.get("/db-health-check", async (_req, res) => {
  try {
    const [rows] = (await pool.query("SELECT NOW() AS now")) as any[];
    res.send(rows[0].now);
  } catch (error) {
    res
      .status(500)
      .json(
        errorHelper.buildStandardResponse(
          "Can't connect to database",
          "db-failed-connection",
          error
        )
      );
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
