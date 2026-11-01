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
  if (![0.5, 1, 2, 3].includes(radius) || !/^\d{2}:\d{2}$/.test(quietStart) || !/^\d{2}:\d{2}$/.test(quietEnd)) {
    res.status(400).json({ error: "Radius must be 0.5–3 km and quiet hours must use HH:MM." });
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

app.post("/api/drop-alerts/search", async (req, res) => {
  const userId = String(req.body?.userId ?? "");
  const keyword = String(req.body?.keyword ?? "").trim();
  const radiusKm = Number(req.body?.radiusKm ?? 3);
  const options = req.body?.options;
  const allowedRadii = [0.5, 1, 2, 3, 5];
  if (!userId || !keyword || keyword.length > 255 || !allowedRadii.includes(radiusKm)) {
    res.status(400).json({ error: "userId, a search keyword, and a radius of 0.5, 1, 2, 3, or 5 km are required." });
    return;
  }
  if (options !== undefined && (
    typeof options !== "object" || options === null ||
    !["food", "shop"].includes(options.target) ||
    !Array.isArray(options.shopIds) || options.shopIds.length > 100 ||
    typeof options.discountsOnly !== "boolean" ||
    typeof options.freeOnly !== "boolean" ||
    typeof options.timeWindow !== "string" || options.timeWindow.length > 32
  )) {
    res.status(400).json({ error: "Invalid search alert options." });
    return;
  }
  const alertOptions = JSON.stringify(options ?? { start: "22:00", end: "07:00" });
  try {
    const [existing] = await pool.query(
      "SELECT id FROM drop_alerts WHERE user_id = ? AND shop_id IS NULL AND keyword = ? ORDER BY created_at DESC LIMIT 1",
      [userId, keyword],
    );
    const alertId = (existing as Array<{ id: string }>)[0]?.id;
    if (alertId) {
      await pool.query("UPDATE drop_alerts SET radius_km = ?, quiet_hours = ?, enabled = TRUE WHERE id = ?", [radiusKm, alertOptions, alertId]);
    } else {
      await pool.query(
        `INSERT INTO drop_alerts (id, user_id, keyword, radius_km, notify_free_food, quiet_hours, enabled)
         VALUES (?, ?, ?, ?, FALSE, ?, TRUE)`,
        [randomUUID(), userId, keyword, radiusKm, alertOptions],
      );
    }
    res.status(201).json({ saved: true, keyword, radiusKm });
  } catch { res.status(500).json({ error: "Unable to save search alert." }); }
});

app.get("/api/drop-alerts/search", async (req, res) => {
  const userId = String(req.query.userId ?? "");
  if (!userId) { res.status(400).json({ error: "userId is required." }); return; }
  try {
    const [rows] = await pool.query(
      `SELECT id, keyword, radius_km, enabled, created_at, quiet_hours
       FROM drop_alerts
       WHERE user_id = ? AND shop_id IS NULL AND keyword IS NOT NULL AND keyword != '__global_settings__'
       ORDER BY created_at DESC`,
      [userId],
    );
    res.json({ items: rows });
  } catch { res.status(500).json({ error: "Unable to load search alerts." }); }
});

app.put("/api/drop-alerts/search/:id", async (req, res) => {
  const userId = String(req.body?.userId ?? "");
  const enabled = req.body?.enabled;
  if (!userId || typeof enabled !== "boolean") {
    res.status(400).json({ error: "userId and a boolean enabled value are required." });
    return;
  }
  try {
    const [result] = await pool.query(
      `UPDATE drop_alerts SET enabled = ?
       WHERE id = ? AND user_id = ? AND shop_id IS NULL AND keyword IS NOT NULL AND keyword != '__global_settings__'`,
      [enabled, req.params.id, userId],
    );
    if (!(result as { affectedRows: number }).affectedRows) {
      res.status(404).json({ error: "Search alert not found." });
      return;
    }
    res.json({ enabled });
  } catch { res.status(500).json({ error: "Unable to update search alert." }); }
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

app.get("/api/favorite-shops", async (req, res) => {
  const userId = String(req.query.userId ?? "");
  const includeDesignSamples = req.query.includeDesignSamples === "true";
  if (!userId) { res.status(400).json({ error: "userId is required." }); return; }
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.address, s.verified, s.reputation_score,
              (SELECT f.image_url FROM food_items f WHERE f.shop_id = s.id ORDER BY f.created_at DESC LIMIT 1) AS image_url
       FROM saved_shops ss JOIN shops s ON s.id = ss.shop_id
       WHERE ss.user_id = ? ORDER BY ss.created_at DESC`,
      [userId],
    );
    if (!includeDesignSamples) {
      res.json({ items: rows });
      return;
    }
    const designSamples = [
      { id: "33333333-3333-4333-8333-333333333336", name: "The Corner Kitchen", address: "District 1 · 1.2 km" },
      { id: "33333333-3333-4333-8333-333333333341", name: "Morning Brew Cafe", address: "District 3 · 2.4 km" },
      { id: "33333333-3333-4333-8333-333333333342", name: "Green Bowl Studio", address: "Binh Thanh · 3.1 km" },
    ];
    const [sampleRows] = await pool.query(
      `SELECT s.id, s.name, s.address, s.verified, s.reputation_score, NULL AS image_url
       FROM shops s
       WHERE s.id IN (?, ?, ?)
       ORDER BY FIELD(s.id, ?, ?, ?)`,
      [
        "33333333-3333-4333-8333-333333333336",
        "33333333-3333-4333-8333-333333333341",
        "33333333-3333-4333-8333-333333333342",
        "33333333-3333-4333-8333-333333333336",
        "33333333-3333-4333-8333-333333333341",
        "33333333-3333-4333-8333-333333333342",
      ],
    );
    const existingDesignRows = sampleRows as { id: string }[];
    const existingDesignIds = new Set(existingDesignRows.map((shop) => shop.id));
    const missingDesignRows = designSamples
      .filter((shop) => !existingDesignIds.has(shop.id))
      .map((shop) => ({ ...shop, verified: 1, reputation_score: 4.8, image_url: null }));
    const savedShopIds = new Set((rows as { id: string }[]).map((shop) => shop.id));
    res.json({
      items: [
        ...[...existingDesignRows, ...missingDesignRows].filter((shop) => !savedShopIds.has(shop.id)),
        ...rows as object[],
      ],
    });
  } catch { res.status(500).json({ error: "Unable to load saved shops." }); }
});

app.post("/api/favorite-shops", async (req, res) => {
  const { userId, shopId } = req.body ?? {};
  if (!userId || !shopId) { res.status(400).json({ error: "userId and shopId are required." }); return; }
  try {
    const [existing] = await pool.query("SELECT 1 FROM saved_shops WHERE user_id = ? AND shop_id = ?", [userId, shopId]);
    const saved = !(existing as unknown[]).length;
    if (saved) await pool.query("INSERT INTO saved_shops (user_id, shop_id) VALUES (?, ?)", [userId, shopId]);
    else await pool.query("DELETE FROM saved_shops WHERE user_id = ? AND shop_id = ?", [userId, shopId]);
    res.json({ saved });
  } catch { res.status(500).json({ error: "Unable to update saved shops." }); }
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
  const includeSearchDesignSamples = req.query.includeSearchDesignSamples === "true";
  const includeSharingDesignSamples = req.query.includeSharingDesignSamples === "true";
  const includeDropAlertDesignSamples = req.query.includeDropAlertDesignSamples === "true";
  const searchDesignSampleIds = [
    "44444444-4444-4444-8444-444444444446",
    "44444444-4444-4444-8444-444444444447",
    "44444444-4444-4444-8444-444444444448",
    "44444444-4444-4444-8444-444444444449",
    "44444444-4444-4444-8444-444444444450",
    "44444444-4444-4444-8444-444444444451",
  ];
  const sharingDesignSampleIds = [
    "44444444-4444-4444-8444-444444444452",
    "44444444-4444-4444-8444-444444444453",
    "44444444-4444-4444-8444-444444444454",
    "44444444-4444-4444-8444-444444444455",
  ];
  const dropAlertDesignSampleIds = ["44444444-4444-4444-8444-444444444456"];
  const allDesignSampleIds = [...searchDesignSampleIds, ...sharingDesignSampleIds, ...dropAlertDesignSampleIds];
  const includedSampleIds = [
    ...(includeSearchDesignSamples ? searchDesignSampleIds : []),
    ...(includeSharingDesignSamples ? sharingDesignSampleIds : []),
    ...(includeDropAlertDesignSamples ? dropAlertDesignSampleIds : []),
  ];
  const searchDesignLocations: Record<string, string> = {
    "44444444-4444-4444-8444-444444444446": "District 1 · 1.2 km",
    "44444444-4444-4444-8444-444444444447": "District 3 · 2.1 km",
    "44444444-4444-4444-8444-444444444448": "Binh Thanh · 3.4 km",
    "44444444-4444-4444-8444-444444444449": "District 2 · 4.0 km",
    "44444444-4444-4444-8444-444444444450": "District 1 · 2.8 km",
    "44444444-4444-4444-8444-444444444451": "District 3 · 4.0 km",
  };
  const locationExpression = includeSearchDesignSamples || includeDropAlertDesignSamples
    ? `CASE f.id ${Object.entries({
      ...searchDesignLocations,
      ...(includeDropAlertDesignSamples ? { "44444444-4444-4444-8444-444444444456": "1.2 km away" } : {}),
    }).map(([id, location]) =>
      `WHEN '${id}' THEN '${location}'`).join(" ")} ELSE s.address END`
    : "s.address";
  const filteredSampleIds = includedSampleIds.length > 0 ? includedSampleIds : allDesignSampleIds;
  const sampleFilter = `f.id ${includedSampleIds.length > 0 ? "IN" : "NOT IN"} (${filteredSampleIds.map(() => "?").join(", ")})`;
  try {
    await releaseExpiredHolds();
    const [rows] = await pool.query(
      `SELECT f.id, f.name, f.description, f.image_url, f.original_price, f.current_price, f.storage_instructions,
              f.quantity_available, f.allergens, f.expires_at, f.pickup_starts_at, f.pickup_ends_at,
              s.id AS shop_id, s.name AS shop_name, ${locationExpression} AS address, s.latitude, s.longitude, s.verified, s.reputation_score
       FROM food_items f JOIN shops s ON s.id = f.shop_id
       WHERE f.status = 'active' AND f.quantity_available > 0 AND f.pickup_ends_at > CURRENT_TIMESTAMP
         AND ${sampleFilter}
         AND LOWER(CONCAT_WS(' ', f.name, f.description, s.name)) LIKE LOWER(?) ORDER BY f.pickup_ends_at ASC, f.id ASC LIMIT 50`,
      [...filteredSampleIds, `%${search}%`],
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

app.get("/api/shops/:id/reviews", async (req, res) => {
  const userId = String(req.query.userId ?? "");
  try {
    const [reviews] = await pool.query(
      `SELECT r.id, r.order_id, r.rating, r.comment, r.created_at, u.full_name AS author_name
       FROM reviews r JOIN users u ON u.id = r.author_id
       WHERE r.shop_id = ? ORDER BY r.created_at DESC LIMIT 100`,
      [req.params.id],
    );
    const [eligibleOrders] = userId
      ? await pool.query(
        `SELECT o.id, o.created_at, o.total_amount
         FROM orders o
         LEFT JOIN reviews r ON r.order_id = o.id AND r.author_id = o.buyer_id
         WHERE o.shop_id = ? AND o.buyer_id = ? AND o.status = 'completed' AND r.id IS NULL
         ORDER BY o.created_at DESC LIMIT 1`,
        [req.params.id, userId],
      )
      : [[]];
    const [shops] = await pool.query("SELECT id FROM shops WHERE id = ?", [req.params.id]);
    if (!(shops as unknown[]).length) { res.status(404).json({ error: "Shop not found." }); return; }
    res.json({
      items: reviews,
      eligibleOrder: (eligibleOrders as Array<{ id: string }>)[0] ?? null,
    });
  } catch { res.status(500).json({ error: "Unable to load shop reviews." }); }
});

app.post("/api/shops/:id/reviews", async (req, res) => {
  const authorId = String(req.body?.authorId ?? "");
  const orderId = String(req.body?.orderId ?? "");
  const rating = Number(req.body?.rating);
  const comment = String(req.body?.comment ?? "").trim();
  if (!authorId || !orderId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400).json({ error: "authorId, orderId, and a rating from 1 to 5 are required." });
    return;
  }
  try {
    const [orders] = await pool.query(
      "SELECT id FROM orders WHERE id = ? AND shop_id = ? AND buyer_id = ? AND status = 'completed'",
      [orderId, req.params.id, authorId],
    );
    if (!(orders as unknown[]).length) {
      res.status(403).json({ error: "Only the buyer of a completed order can review this shop." });
      return;
    }
    const [existing] = await pool.query("SELECT id FROM reviews WHERE order_id = ? AND author_id = ?", [orderId, authorId]);
    if ((existing as unknown[]).length) {
      res.status(409).json({ error: "This completed order already has a review." });
      return;
    }
    const id = randomUUID();
    await pool.query(
      "INSERT INTO reviews (id, order_id, author_id, shop_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)",
      [id, orderId, authorId, req.params.id, rating, comment || null],
    );
    res.status(201).json({ id, order_id: orderId, author_id: authorId, shop_id: req.params.id, rating, comment: comment || null });
  } catch { res.status(500).json({ error: "Unable to save shop review." }); }
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
app.listen(port, "0.0.0.0", () => console.log(`ResQ API listening on http://0.0.0.0:${port}`));
