import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { extname, resolve } from "node:path";
import multer from "multer";
import { pool } from "./db.js";

const app = express();
const uploadDir = resolve(process.cwd(), "uploads");
mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, done) => done(null, uploadDir),
    filename: (_req, file, done) => done(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 6 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, done) => done(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)),
});
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(uploadDir));

async function releaseExpiredHolds() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query("SELECT id, food_item_id, quantity FROM reservations WHERE status = 'held' AND hold_expires_at <= CURRENT_TIMESTAMP FOR UPDATE");
    for (const row of rows as Array<{ id: string; food_item_id: string; quantity: number }>) {
      await connection.query("UPDATE food_items SET quantity_available = quantity_available + ? WHERE id = ?", [row.quantity, row.food_item_id]);
      await connection.query("UPDATE reservations SET status = 'expired' WHERE id = ?", [row.id]);
      await connection.query("UPDATE orders SET status = 'overdue' WHERE reservation_id = ? AND status = 'awaiting_pickup'", [row.id]);
    }
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

app.post("/api/uploads", upload.single("file"), (req, res) => {
  if (!req.file) { res.status(400).json({ error: "Attach a JPG, PNG, or WebP image up to 6 MB." }); return; }
  const protocol = req.get("x-forwarded-proto") ?? req.protocol;
  res.status(201).json({ url: `${protocol}://${req.get("host")}/uploads/${req.file.filename}` });
});

app.post("/api/users", async (req, res) => {
  const { id, full_name, role = "buyer", is_incognito = false, dietary_preferences = [], allergies = [] } = req.body ?? {};
  if (!id || !full_name || !["buyer", "seller", "admin"].includes(role)) {
    res.status(400).json({ error: "A user id, full name, and valid role are required." });
    return;
  }
  try {
    await pool.query(
      `INSERT INTO users (id, full_name, role, is_incognito, dietary_preferences, allergies)
       VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = VALUES(id)`,
      [id, full_name, role, is_incognito, JSON.stringify(dietary_preferences), JSON.stringify(allergies)],
    );
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    res.status(201).json((rows as unknown[])[0]);
  } catch {
    res.status(500).json({ error: "Unable to create profile." });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    const user = (rows as unknown[])[0];
    if (!user) { res.status(404).json({ error: "Profile not found." }); return; }
    res.json(user);
  } catch { res.status(500).json({ error: "Unable to load profile." }); }
});

app.put("/api/users/:id", async (req, res) => {
  const { full_name, email, phone, role, is_incognito, dietary_preferences, allergies } = req.body ?? {};
  try {
    await pool.query(
      `UPDATE users SET full_name = ?, email = COALESCE(?, email), phone = COALESCE(?, phone), role = ?, is_incognito = ?, dietary_preferences = ?, allergies = ? WHERE id = ?`,
      [full_name, email ?? null, phone ?? null, role, Boolean(is_incognito), JSON.stringify(dietary_preferences ?? []), JSON.stringify(allergies ?? []), req.params.id],
    );
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    const user = (rows as unknown[])[0];
    if (!user) { res.status(404).json({ error: "Profile not found." }); return; }
    res.json(user);
  } catch { res.status(500).json({ error: "Unable to save profile." }); }
});

app.get("/api/users/:id/preferences", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM user_preferences WHERE user_id = ?", [req.params.id]);
    res.json((rows as unknown[])[0] ?? { user_id: req.params.id, notification_radius_km: 3, quiet_start: "22:00:00", quiet_end: "07:00:00" });
  } catch { res.status(500).json({ error: "Unable to load notification preferences." }); }
});

app.put("/api/users/:id/preferences", async (req, res) => {
  const radius = Number(req.body?.notification_radius_km ?? 3);
  const quietStart = String(req.body?.quiet_start ?? "22:00");
  const quietEnd = String(req.body?.quiet_end ?? "07:00");
  if (![1, 2, 3].includes(radius) || !/^\d{2}:\d{2}$/.test(quietStart) || !/^\d{2}:\d{2}$/.test(quietEnd)) {
    res.status(400).json({ error: "Radius must be 1–3 km and quiet hours must use HH:MM." });
    return;
  }
  try {
    await pool.query(
      `INSERT INTO user_preferences (user_id, notification_radius_km, quiet_start, quiet_end) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE notification_radius_km = VALUES(notification_radius_km), quiet_start = VALUES(quiet_start), quiet_end = VALUES(quiet_end)`,
      [req.params.id, radius, `${quietStart}:00`, `${quietEnd}:00`],
    );
    const [rows] = await pool.query("SELECT * FROM user_preferences WHERE user_id = ?", [req.params.id]);
    res.json((rows as unknown[])[0]);
  } catch { res.status(500).json({ error: "Unable to save notification preferences." }); }
});

app.get("/api/drop-alerts", async (req, res) => {
  const { userId, shopId } = req.query;
  if (!userId) {
    res.status(400).json({ error: "userId is required." });
    return;
  }
  try {
    const [rows] = shopId
      ? await pool.query(
        "SELECT * FROM drop_alerts WHERE user_id = ? AND shop_id = ? ORDER BY created_at DESC LIMIT 1",
        [userId, shopId],
      )
      : await pool.query(
        `SELECT a.id, a.user_id, a.shop_id, a.enabled, s.name, s.address
         FROM drop_alerts a JOIN shops s ON s.id = a.shop_id
         WHERE a.user_id = ? AND a.shop_id IS NOT NULL AND a.keyword IS NULL
         ORDER BY a.created_at DESC`,
        [userId],
      );
    res.json({ items: rows });
  } catch { res.status(500).json({ error: "Unable to load drop alert." }); }
});

app.put("/api/drop-alerts", async (req, res) => {
  const { userId, shopId, enabled } = req.body ?? {};
  if (!userId || !shopId || typeof enabled !== "boolean") {
    res.status(400).json({ error: "userId, shopId, and a boolean enabled value are required." });
    return;
  }
  try {
    const [existing] = await pool.query(
      "SELECT id FROM drop_alerts WHERE user_id = ? AND shop_id = ? ORDER BY created_at DESC LIMIT 1",
      [userId, shopId],
    );
    const alertId = (existing as Array<{ id: string }>)[0]?.id;
    if (alertId) {
      await pool.query("UPDATE drop_alerts SET enabled = ? WHERE id = ?", [enabled, alertId]);
    } else {
      await pool.query(
        `INSERT INTO drop_alerts (id, user_id, shop_id, quiet_hours, enabled)
         VALUES (?, ?, ?, JSON_OBJECT('start', '22:00', 'end', '07:00'), ?)`,
        [randomUUID(), userId, shopId, enabled],
      );
    }
    res.json({ enabled });
  } catch { res.status(500).json({ error: "Unable to save drop alert." }); }
});

app.get("/api/drop-alerts/global", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    res.status(400).json({ error: "userId is required." });
    return;
  }
  try {
    const [rows] = await pool.query(
      "SELECT quiet_hours FROM drop_alerts WHERE user_id = ? AND shop_id IS NULL AND keyword = '__global_settings__' ORDER BY created_at DESC LIMIT 1",
      [userId],
    );
    const row = (rows as Array<{ quiet_hours: string | Record<string, unknown> }>)[0];
    const saved = typeof row?.quiet_hours === "string" ? JSON.parse(row.quiet_hours) as Record<string, unknown> : row?.quiet_hours;
    res.json({
      instantPush: typeof saved?.instantPush === "boolean" ? saved.instantPush : true,
      vibrateEmergencyDrops: typeof saved?.vibrateEmergencyDrops === "boolean" ? saved.vibrateEmergencyDrops : true,
    });
  } catch { res.status(500).json({ error: "Unable to load global drop alert settings." }); }
});

app.put("/api/drop-alerts/global", async (req, res) => {
  const { userId, instantPush, vibrateEmergencyDrops } = req.body ?? {};
  if (!userId || typeof instantPush !== "boolean" || typeof vibrateEmergencyDrops !== "boolean") {
    res.status(400).json({ error: "userId and boolean notification settings are required." });
    return;
  }
  const quietHours = JSON.stringify({ instantPush, vibrateEmergencyDrops });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      "SELECT id FROM drop_alerts WHERE user_id = ? AND shop_id IS NULL AND keyword = '__global_settings__' ORDER BY created_at DESC LIMIT 1 FOR UPDATE",
      [userId],
    );
    const alertId = (rows as Array<{ id: string }>)[0]?.id;
    if (alertId) {
      await connection.query("UPDATE drop_alerts SET quiet_hours = ? WHERE id = ?", [quietHours, alertId]);
    } else {
      await connection.query(
        `INSERT INTO drop_alerts (id, user_id, keyword, notify_free_food, quiet_hours, enabled)
         VALUES (?, ?, '__global_settings__', FALSE, ?, TRUE)`,
        [randomUUID(), userId, quietHours],
      );
    }
    await connection.commit();
    res.json({ instantPush, vibrateEmergencyDrops });
  } catch {
    await connection.rollback();
    res.status(500).json({ error: "Unable to save global drop alert settings." });
  } finally { connection.release(); }
});

app.get("/api/favorites", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT food_item_id FROM favorites WHERE user_id = ?", [req.query.userId]);
    res.json({ items: (rows as Array<{ food_item_id: string }>).map((row) => row.food_item_id) });
  } catch { res.status(500).json({ error: "Unable to load favorites." }); }
});

app.post("/api/favorites", async (req, res) => {
  const { userId, foodId } = req.body ?? {};
  if (!userId || !foodId) { res.status(400).json({ error: "userId and foodId are required." }); return; }
  try {
    const [existing] = await pool.query("SELECT 1 FROM favorites WHERE user_id = ? AND food_item_id = ?", [userId, foodId]);
    const saved = !(existing as unknown[]).length;
    if (saved) await pool.query("INSERT INTO favorites (user_id, food_item_id) VALUES (?, ?)", [userId, foodId]);
    else await pool.query("DELETE FROM favorites WHERE user_id = ? AND food_item_id = ?", [userId, foodId]);
    res.json({ saved });
  } catch { res.status(500).json({ error: "Unable to update favorites." }); }
});

app.get("/api/reservations", async (req, res) => {
  try {
    await releaseExpiredHolds();
    const [rows] = await pool.query(
      `SELECT r.*, o.id AS order_id, o.pickup_qr_token, o.status AS order_status, o.total_amount
       FROM reservations r LEFT JOIN orders o ON o.reservation_id = r.id
       WHERE r.buyer_id = ? ORDER BY r.created_at DESC`, [req.query.buyerId],
    );
    res.json({ items: rows });
  } catch { res.status(500).json({ error: "Unable to load reservations." }); }
});

app.delete("/api/reservations/:id", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query("SELECT food_item_id, quantity, status FROM reservations WHERE id = ? FOR UPDATE", [req.params.id]);
    const reservation = (rows as Array<{ food_item_id: string; quantity: number; status: string }>)[0];
    if (!reservation) { await connection.rollback(); res.status(404).json({ error: "Reservation not found." }); return; }
    if (reservation.status === "held" || reservation.status === "confirmed") {
      await connection.query("UPDATE food_items SET quantity_available = quantity_available + ? WHERE id = ?", [reservation.quantity, reservation.food_item_id]);
      await connection.query("UPDATE reservations SET status = 'cancelled' WHERE id = ?", [req.params.id]);
      await connection.query("UPDATE orders SET status = 'cancelled' WHERE reservation_id = ? AND status = 'awaiting_pickup'", [req.params.id]);
    }
    await connection.commit();
    res.json({ cancelled: true });
  } catch {
    await connection.rollback();
    res.status(500).json({ error: "Unable to cancel reservation." });
  } finally { connection.release(); }
});

app.post("/api/orders/:id/deposit", async (req, res) => {
  const amount = Number(req.body?.amount ?? 10000);
  if (!Number.isFinite(amount) || amount < 0) { res.status(400).json({ error: "Invalid deposit amount." }); return; }
  const id = randomUUID();
  try {
    const [orders] = await pool.query("SELECT id, buyer_id FROM orders WHERE id = ?", [req.params.id]);
    const order = (orders as Array<{ id: string; buyer_id: string }>)[0];
    if (!order) { res.status(404).json({ error: "Order not found." }); return; }
    await pool.query(
      "INSERT INTO transactions (id, order_id, user_id, amount, transaction_type, status, provider_reference) VALUES (?, ?, ?, ?, 'deposit', 'pending', 'pay-at-pickup')",
      [id, order.id, order.buyer_id, amount],
    );
    res.status(201).json({ transactionId: id, amount, status: "pending", paymentMethod: "pay-at-pickup" });
  } catch { res.status(500).json({ error: "Unable to record deposit." }); }
});

app.post("/api/orders/scan", async (req, res) => {
  const token = String(req.body?.token ?? "").trim();
  if (!token) { res.status(400).json({ error: "A pickup QR token is required." }); return; }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query("SELECT id, reservation_id, status FROM orders WHERE pickup_qr_token = ? FOR UPDATE", [token]);
    const order = (rows as Array<{ id: string; reservation_id: string; status: string }>)[0];
    if (!order) { await connection.rollback(); res.status(404).json({ error: "Pickup code not found." }); return; }
    if (order.status === "completed") { await connection.rollback(); res.status(409).json({ error: "This order was already picked up." }); return; }
    await connection.query("UPDATE orders SET status = 'completed' WHERE id = ?", [order.id]);
    await connection.query("UPDATE reservations SET status = 'picked_up' WHERE id = ?", [order.reservation_id]);
    await connection.commit();
    res.json({ completed: true, orderId: order.id });
  } catch {
    await connection.rollback();
    res.status(500).json({ error: "Unable to confirm pickup." });
  } finally { connection.release(); }
});

app.get("/api/complaints", async (req, res) => {
  try {
    const [rows] = req.query.reporterId
      ? await pool.query("SELECT * FROM complaints WHERE reporter_id = ? ORDER BY created_at DESC", [req.query.reporterId])
      : await pool.query("SELECT * FROM complaints WHERE status IN ('submitted','reviewing') ORDER BY created_at DESC");
    res.json({ items: rows });
  } catch { res.status(500).json({ error: "Unable to load complaints." }); }
});

app.post("/api/complaints", async (req, res) => {
  const { orderId, reporterId, reason, description, evidenceUrls = [] } = req.body ?? {};
  if (!orderId || !reporterId || !reason || !String(description ?? "").trim()) {
    res.status(400).json({ error: "Order, reporter, reason, and description are required." });
    return;
  }
  const id = randomUUID();
  try {
    await pool.query("INSERT INTO complaints (id, order_id, reporter_id, reason, description, evidence_urls) VALUES (?, ?, ?, ?, ?, ?)", [id, orderId, reporterId, reason, description.trim(), JSON.stringify(evidenceUrls)]);
    const [rows] = await pool.query("SELECT * FROM complaints WHERE id = ?", [id]);
    res.status(201).json((rows as unknown[])[0]);
  } catch { res.status(500).json({ error: "Unable to submit complaint." }); }
});

app.get("/api/health", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT CURRENT_TIMESTAMP AS database_time");
    res.json({ status: "ok", database: "connected", time: (rows as Array<{ database_time: Date }>)[0].database_time });
  } catch {
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.get("/api/foods", async (req, res) => {
  const search = String(req.query.search ?? "").trim();
  try {
    await releaseExpiredHolds();
    const [rows] = await pool.query(
      `SELECT f.id, f.name, f.description, f.image_url, f.original_price, f.current_price, f.storage_instructions,
              f.quantity_available, f.allergens, f.expires_at, f.pickup_starts_at, f.pickup_ends_at,
              s.id AS shop_id, s.name AS shop_name, s.address, s.latitude, s.longitude, s.verified, s.reputation_score
       FROM food_items f JOIN shops s ON s.id = f.shop_id
       WHERE f.status = 'active' AND f.quantity_available > 0 AND f.pickup_ends_at > CURRENT_TIMESTAMP
         AND LOWER(CONCAT_WS(' ', f.name, f.description, s.name)) LIKE LOWER(?) ORDER BY f.pickup_ends_at ASC LIMIT 50`,
      [`%${search}%`],
    );
    res.json({ items: rows });
  } catch {
    res.status(500).json({ error: "Unable to load food listings." });
  }
});

app.get("/api/shops", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM shops WHERE owner_id = ? ORDER BY created_at DESC", [req.query.ownerId]);
    res.json({ items: rows });
  } catch { res.status(500).json({ error: "Unable to load shop profile." }); }
});

app.get("/api/shops/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, COALESCE(AVG(r.rating), 0) AS average_rating, COUNT(r.id) AS review_count
       FROM shops s
       LEFT JOIN reviews r ON r.shop_id = s.id
       WHERE s.id = ?
       GROUP BY s.id`,
      [req.params.id],
    );
    const shop = (rows as unknown[])[0];
    if (!shop) { res.status(404).json({ error: "Shop not found." }); return; }
    res.json(shop);
  } catch { res.status(500).json({ error: "Unable to load shop details." }); }
});

app.post("/api/shops", async (req, res) => {
  const { ownerId, name, address, description = "", latitude = null, longitude = null } = req.body ?? {};
  if (!ownerId || !String(name ?? "").trim() || !String(address ?? "").trim()) {
    res.status(400).json({ error: "ownerId, shop name, and address are required." });
    return;
  }
  const id = randomUUID();
  try {
    await pool.query("INSERT INTO shops (id, owner_id, name, description, address, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, ownerId, name.trim(), description, address.trim(), latitude, longitude]);
    const [rows] = await pool.query("SELECT * FROM shops WHERE id = ?", [id]);
    res.status(201).json((rows as unknown[])[0]);
  } catch { res.status(500).json({ error: "Unable to create shop profile." }); }
});

app.post("/api/foods", async (req, res) => {
  const { sellerId, shopId, name, description = "", originalPrice, price, quantity, expiresAt } = req.body ?? {};
  if (!sellerId || !shopId || !String(name ?? "").trim() || !Number.isFinite(Number(price)) || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
    res.status(400).json({ error: "Shop, food name, price, and positive quantity are required." });
    return;
  }
  const id = randomUUID();
  try {
    await pool.query(
      `INSERT INTO food_items (id, shop_id, name, description, original_price, current_price, quantity_available, allergens, expires_at, pickup_ends_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, JSON_ARRAY(), ?, ?)`,
      [id, shopId, name.trim(), description, Number(originalPrice || price), Number(price), Number(quantity), expiresAt ?? null, expiresAt ?? null],
    );
    const [rows] = await pool.query("SELECT f.*, s.name AS shop_name, s.address, s.verified FROM food_items f JOIN shops s ON s.id = f.shop_id WHERE f.id = ?", [id]);
    res.status(201).json((rows as unknown[])[0]);
  } catch { res.status(500).json({ error: "Unable to publish food listing." }); }
});

app.post("/api/reservations", async (req, res) => {
  const { foodItemId, buyerId, quantity = 1, pickupSlotStart, pickupSlotEnd } = req.body ?? {};
  if (!foodItemId || !buyerId || !Number.isInteger(quantity) || quantity < 1) {
    res.status(400).json({ error: "foodItemId, buyerId and a positive integer quantity are required." });
    return;
  }

  try { await releaseExpiredHolds(); }
  catch { res.status(503).json({ error: "Unable to release expired holds." }); return; }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [foodRows] = await connection.query(
      "SELECT id, shop_id, current_price, quantity_available FROM food_items WHERE id = ? AND status = 'active' FOR UPDATE",
      [foodItemId],
    );
    const food = (foodRows as Array<{ id: string; shop_id: string; current_price: number; quantity_available: number }>)[0];
    if (!food || food.quantity_available < quantity) {
      await connection.rollback();
      res.status(409).json({ error: "Not enough servings are available." });
      return;
    }
    const reservationId = randomUUID();
    await connection.query(
      `INSERT INTO reservations (id, food_item_id, buyer_id, quantity, hold_expires_at, pickup_slot_start, pickup_slot_end)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [reservationId, foodItemId, buyerId, quantity, new Date(Date.now() + 20 * 60 * 1000), pickupSlotStart ?? null, pickupSlotEnd ?? null],
    );
    await connection.query("UPDATE food_items SET quantity_available = quantity_available - ? WHERE id = ?", [quantity, foodItemId]);
    const orderId = randomUUID();
    const pickupToken = randomUUID();
    await connection.query(
      `INSERT INTO orders (id, reservation_id, buyer_id, shop_id, total_amount, pickup_qr_token)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, reservationId, buyerId, food.shop_id, Number(food.current_price) * quantity, pickupToken],
    );
    await connection.commit();
    const [reservationRows] = await connection.query("SELECT * FROM reservations WHERE id = ?", [reservationId]);
    res.status(201).json({ reservation: { ...(reservationRows as Array<Record<string, unknown>>)[0], order_id: orderId, pickup_qr_token: pickupToken }, holdMinutes: 20 });
  } catch {
    await connection.rollback();
    res.status(500).json({ error: "Unable to create reservation." });
  } finally {
    connection.release();
  }
});

const port = Number(process.env.API_PORT ?? 4000);
app.listen(port, () => console.log(`ResQ API listening on port ${port}`));
