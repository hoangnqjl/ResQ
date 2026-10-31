import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { pool } from "./db.js";

const uploadsDir = resolve(process.cwd(), "uploads");
const imageSources = [
  ["grilled-chicken-rice.jpg", "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=80"],
  ["salmon-poke-bowl.jpg", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80"],
  ["chicken-pho.jpg", "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80"],
  ["berry-pancakes.jpg", "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1000&q=80"],
  ["vegetarian-garden-bowl.jpg", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80"],
] as const;

try {
  const [userColumns] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`,
  );
  const userColumnNames = new Set((userColumns as Array<{ COLUMN_NAME: string }>).map((column) => column.COLUMN_NAME));
  if (!userColumnNames.has("full_name")) {
    throw new Error(
      `The selected database "${process.env.DB_NAME}" is not initialized with the ResQ schema. Set DB_NAME in backend/.env to a new, empty database dedicated to ResQ, run npm run db:schema, then npm run db:seed. No demo records were inserted.`,
    );
  }

  await mkdir(uploadsDir, { recursive: true });
  const baseUrl = (process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.API_PORT ?? 4000}`).replace(/\/$/, "");
  const localImages = new Map<string, string>();
  for (const [fileName, sourceUrl] of imageSources) {
    const targetPath = resolve(uploadsDir, basename(fileName));
    let existing = false;
    try {
      const current = await readFile(targetPath);
      existing = current.length > 1024;
    } catch { /* Download missing demo image. */ }

    if (!existing) {
      const response = await fetch(sourceUrl);
      if (!response.ok) throw new Error(`Could not download demo image ${fileName}: HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!response.headers.get("content-type")?.startsWith("image/")) throw new Error(`Download for ${fileName} was not an image.`);
      await writeFile(targetPath, bytes);
    }
    localImages.set(fileName, `${baseUrl}/uploads/${fileName}`);
  }

  const seedPath = fileURLToPath(new URL("../db/seed.sql", import.meta.url));
  let sql = await readFile(seedPath, "utf8");
  for (const [fileName, url] of localImages) sql = sql.replaceAll(`{{${fileName}}}`, url);
  for (const statement of sql.split(";").map((part) => part.trim()).filter(Boolean)) await pool.query(statement);
  const [rows] = await pool.query(
    `SELECT COUNT(DISTINCT shop_id) AS shops, COUNT(*) AS listings, SUM(quantity_available) AS portions
     FROM food_items WHERE shop_id IN (?, ?, ?, ?) AND status = 'active'`,
    [
      "33333333-3333-4333-8333-333333333333",
      "33333333-3333-4333-8333-333333333334",
      "33333333-3333-4333-8333-333333333335",
      "33333333-3333-4333-8333-333333333337",
    ],
  );
  const totals = (rows as Array<{ shops: number; listings: number; portions: number }>)[0];
  console.log(
    `Demo data is ready: ${totals.shops} shops, ${totals.listings} listings, ${totals.portions} portions. Images are stored in ${uploadsDir}.`,
  );
} finally {
  await pool.end();
}
