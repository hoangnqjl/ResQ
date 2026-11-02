import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

const uploadsDir = resolve(process.cwd(), "uploads");

// Comprehensive list of high quality food and store images
const imageSources = [
  ["grilled-chicken-rice.jpg", "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=80"],
  ["salmon-poke-bowl.jpg", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80"],
  ["chicken-pho.jpg", "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80"],
  ["berry-pancakes.jpg", "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1000&q=80"],
  ["vegetarian-garden-bowl.jpg", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80"],
  ["food-beef-noodles.jpg", "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1000&q=80"],
  ["food-avocado-toast.jpg", "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=80"],
  ["food-truffle-pasta.jpg", "https://images.unsplash.com/photo-1621996346565-e3d5d6281745?auto=format&fit=crop&w=1000&q=80"],
  ["food-vegetable-rice.jpg", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80"],
  ["food-banh-mi.jpg", "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=1000&q=80"],
  ["food-pizza.jpg", "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80"],
  ["category-bakery.jpg", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80"],
  ["category-hot-meals.jpg", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80"],
  ["category-produce.jpg", "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1000&q=80"],
  ["category-sharing-corner.jpg", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1000&q=80"],
  ["shop-corner-kitchen.jpg", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"],
  ["sushi-set.jpg", "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80"],
  ["matcha-latte.jpg", "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=1000&q=80"],
  ["fresh-salad.jpg", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80"],
  ["croissant-box.jpg", "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80"],
  ["bento-box.jpg", "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=1000&q=80"]
] as const;

try {
  await mkdir(uploadsDir, { recursive: true });
  const baseUrl = (process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.API_PORT ?? 4000}`).replace(/\/$/, "");
  const localImages = new Map<string, string>();

  for (const [fileName, sourceUrl] of imageSources) {
    const targetPath = resolve(uploadsDir, basename(fileName));
    let existing = false;
    try {
      const current = await readFile(targetPath);
      existing = current.length > 500;
    } catch {
      // Missing file
    }

    if (!existing) {
      try {
        console.log(`Downloading demo asset: ${fileName}...`);
        const response = await fetch(sourceUrl);
        if (response.ok) {
          const bytes = Buffer.from(await response.arrayBuffer());
          await writeFile(targetPath, bytes);
        }
      } catch (err) {
        console.warn(`Could not download ${fileName}, will fallback to baseUrl.`);
      }
    }
    localImages.set(fileName, `${baseUrl}/uploads/${fileName}`);
  }

  const seedPath = fileURLToPath(new URL("../db/seed.sql", import.meta.url));
  let sql = await readFile(seedPath, "utf8");
  for (const [fileName, url] of localImages) {
    sql = sql.replaceAll(`{{${fileName}}}`, url);
  }

  for (const statement of sql.split(";").map((part) => part.trim()).filter(Boolean)) {
    await pool.query(statement);
  }

  const [rows] = await pool.query(
    `SELECT COUNT(DISTINCT shop_id) AS shops, COUNT(*) AS listings, SUM(quantity_available) AS portions
     FROM food_items WHERE status = 'active'`
  );
  const totals = (rows as Array<{ shops: number; listings: number; portions: number }>)[0];
  console.log(
    `Demo data is ready: ${totals.shops} active shops, ${totals.listings} listings, ${totals.portions} portions available with rich photos!`,
  );
} finally {
  await pool.end();
}
