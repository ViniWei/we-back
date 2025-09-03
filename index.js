import express from "express";
import cors from "cors";
import session from "express-session";

import usersRoutes from "./routes/users.routes.js";
import couplesRoutes from "./routes/couples.routes.js";
import moviesRoutes from "./routes/movies.routes.js";
import movieListsRoutes from "./routes/movieLists.routes.js";
import expensesRoutes from "./routes/expenses.routes.js";
import { pool } from "./db.js";  
import errorHelper from "./helper/error.helper.js";

const app = express();

app.use(express.json());

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(cors());

app.use("/users", usersRoutes);
app.use("/couples", couplesRoutes);
app.use("/movies", moviesRoutes);
app.use("/movie-lists", movieListsRoutes);
app.use("/expenses", expensesRoutes);

app.get("/", (_req, res) => {
    res.send("Api working.");
});

app.get("/db-health-check", async (_req, res) => {
    try {
        const [rows] = await pool.query("SELECT NOW() AS now");
        res.send(rows[0].now);
    } catch (error) {
        res.status(500).json(errorHelper.buildStandardResponse("Can't connect to db", "db-failed-connection", error));
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Listening on port: ${process.env.PORT}`);
});
