import express from "express";

import usersRoutes from "./routes/users.routes.js";
import couplesRoutes from "./routes/couples.routes.js";
import activityRoutes from "./routes/activity.routes.js"
import { pool } from "./db.js";  
import errorHelper from "./helper/error.helper.js";

const app = express();

app.use(express.json());

app.use("/users", usersRoutes);
app.use("/couples", couplesRoutes);
app.use("/activity", activityRoutes)

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
