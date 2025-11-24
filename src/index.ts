import express from "express";
import cors from "cors";

import usersRoutes from "./routes/users.routes";
import groupsRoutes from "./routes/groups.routes";
import moviesRoutes from "./routes/movies.routes";
import movieListsRoutes from "./routes/movieLists.routes";
import tripsRoutes from "./routes/trips.routes";
import financesRoutes from "./routes/finances.routes";
import activitiesRoutes from "./routes/activities.routes";
import datesRoutes from "./routes/dates.routes";
import voiceRoutes from "./routes/voice.routes";
import moodRoutes from "./routes/mood.routes";
import recommendationsRoutes from "./routes/recommendations.routes";
import { pool } from "./db";
import errorHelper from "./helper/error.helper";
import dotenv from "dotenv";

dotenv.config();

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
app.use("/dates", datesRoutes);
app.use("/voice", voiceRoutes);
app.use("/mood", moodRoutes);
app.use("/recommendations", recommendationsRoutes);

app.get("/", (_req: express.Request, res: express.Response) => {
  res.send("Api working.");
});

app.get(
  "/db-health-check",
  async (_req: express.Request, res: express.Response) => {
    try {
      const [rows] = (await pool.query("SELECT NOW() AS now")) as any[];
      res.send(rows[0].now);
    } catch (error) {
      res
        .status(500)
        .json(
          errorHelper.buildStandardResponse(
            "Can't connect to db",
            "db-failed-connection",
            error
          )
        );
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
