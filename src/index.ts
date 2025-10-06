import express from "express";
import cors from "cors";
import session from "express-session";

import usersRoutes from "./routes/users.routes";
import groupsRoutes from "./routes/groups.routes";
import moviesRoutes from "./routes/movies.routes";
import movieListsRoutes from "./routes/movieLists.routes";
import tripsRoutes from "./routes/trips.routes";
import financesRoutes from "./routes/finances.routes";
import { pool } from "./config/database";
import errorHelper from "./helper/error.helper";

const app = express();

app.use(express.json());

app.use(
  session({
    secret: process.env.SECRET_KEY || "default-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(cors());

app.use("/users", usersRoutes);
app.use("/groups", groupsRoutes);
app.use("/movies", moviesRoutes);
app.use("/movie-lists", movieListsRoutes);
app.use("/finances", financesRoutes);
app.use("/trips", tripsRoutes);

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
