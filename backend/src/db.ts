import { existsSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

const localEnv = resolve(process.cwd(), ".env");
const sharedEnv = resolve(process.cwd(), "../.env");
const exampleEnv = resolve(process.cwd(), ".env.example");
const envPath = existsSync(localEnv) ? localEnv : existsSync(sharedEnv) ? sharedEnv : existsSync(exampleEnv) ? exampleEnv : undefined;
if (envPath) dotenv.config({ path: envPath });

const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const;
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing MySQL settings: ${missing.join(", ")}. Set them in backend/.env (or backend/.env.example).`);
}

export const databaseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ...(process.env.DB_SSL === "true" ? { ssl: { rejectUnauthorized: false } } : {}),
};

export const pool = mysql.createPool({
  ...databaseConfig,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
});

