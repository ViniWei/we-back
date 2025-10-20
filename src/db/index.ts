import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import "dotenv/config";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "we",
  port: Number(process.env.DB_PORT) || 3306,
});

export const db = drizzle(pool, { schema, mode: "default" });
export { pool };
