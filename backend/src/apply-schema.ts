import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { databaseConfig, pool } from "./db.js";

try {
  const databaseName = process.env.DB_NAME ?? "";
  if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
    throw new Error("DB_NAME must contain only ASCII letters, numbers, or underscores.");
  }
  const bootstrap = await mysql.createConnection(databaseConfig);
  try {
    await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  } finally {
    await bootstrap.end();
  }

  const schemaPath = fileURLToPath(new URL("../db/schema.sql", import.meta.url));
  const [existingUsers] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`,
  );
  const userColumns = new Set((existingUsers as Array<{ COLUMN_NAME: string }>).map((column) => column.COLUMN_NAME));
  if (userColumns.size && !userColumns.has("full_name")) {
    throw new Error(
      `Database "${databaseName}" already contains a different application's users table (no full_name column). No tables were changed. Set DB_NAME in backend/.env to a new, empty database dedicated to ResQ, then rerun npm run db:schema.`,
    );
  }
  const sql = await readFile(schemaPath, "utf8");
  const statements = sql.split(";").map((statement) => statement.trim()).filter(Boolean);
  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (error) {
      const dbError = error as { code?: string; sqlMessage?: string };
      if (dbError.code === "ER_FK_INCOMPATIBLE_COLUMNS") {
        throw new Error(
          `Existing MySQL tables have incompatible column types for a foreign key. No tables were dropped. Use a new empty database name in backend/.env (for example resq_clean), then rerun npm run db:schema and npm run db:seed. Original error: ${dbError.sqlMessage ?? "foreign key column mismatch"}`,
        );
      }
      throw error;
    }
  }
  console.log("MySQL database and ResQ schema are ready.");
} finally {
  await pool.end();
}
