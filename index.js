import express from "express";
import cors from "cors";
import session from "express-session";
import connectMysqlSession from "express-mysql-session";

import usersRoutes from "./routes/users.routes.js";
import groupsRoutes from "./routes/groups.routes.js";
import moviesRoutes from "./routes/movies.routes.js";
import movieListsRoutes from "./routes/movieLists.routes.js";
import financesRoutes from "./routes/finances.routes.js";
import { pool } from "./db.js";
import errorHelper from "./helper/error.helper.js";

const app = express();

app.use(express.json());

const MysqlStore = connectMysqlSession(session);
const sessionStore = new MysqlStore({}, pool);

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store: sessionStore,
  })
);
app.use(cors());

app.use("/users", usersRoutes);
app.use("/groups", groupsRoutes);
app.use("/movies", moviesRoutes);
app.use("/movie-lists", movieListsRoutes);
app.use("/finances", financesRoutes);

app.get("/", (_req, res) => {
  res.send("Api working.");
});

app.get("/db-health-check", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
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
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on port: ${process.env.PORT}`);
});
