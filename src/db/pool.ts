import pg from "pg";
import { env } from "../config/env.js";

const ssl = env.DATABASE_URL.includes("localhost") || env.DATABASE_URL.includes("host.docker.internal")
  ? false
  : { rejectUnauthorized: false };

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});
