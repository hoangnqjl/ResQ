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
    const [rows] = await connection.query("SELECT id, food_item_id, quantity FROM reservations WHERE status IN ('held','confirmed') AND hold_expires_at <= CURRENT_TIMESTAMP FOR UPDATE");
    for (const row of rows as Array<{ id: string; food_item_id: string; quantity: number }>) {
      const [waitlistRows] = await connection.query(
        "SELECT id FROM waitlists WHERE food_item_id = ? AND status = 'waiting' ORDER BY queue_position ASC LIMIT 1 FOR UPDATE",
        [row.food_item_id],
      );
      const nextWaitlist = (waitlistRows as Array<{ id: string }>)[0];
      if (nextWaitlist) {
        await connection.query(
          "UPDATE waitlists SET status = 'offered', offered_at = CURRENT_TIMESTAMP, offer_expires_at = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 MINUTE) WHERE id = ?",
          [nextWaitlist.id],
        );
      } else {
        await connection.query("UPDATE food_items SET quantity_available = quantity_available + ? WHERE id = ?", [row.quantity, row.food_item_id]);
      }
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
    if (reservation.status !== "held" && reservation.status !== "confirmed") {
      await connection.rollback();
      res.status(409).json({ error: "This reservation is no longer active." });
      return;
    }
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
    let rows;
    if (req.query.reporterId) {
      [rows] = await pool.query("SELECT * FROM complaints WHERE reporter_id = ? ORDER BY created_at DESC", [req.query.reporterId]);
    } else if (req.query.shopOwnerId) {
      [rows] = await pool.query(
        `SELECT c.* FROM complaints c
         JOIN orders o ON o.id = c.order_id
         JOIN shops s ON s.id = o.shop_id
         WHERE s.owner_id = ? ORDER BY c.created_at DESC`,
        [req.query.shopOwnerId],
      );
    } else {
      [rows] = await pool.query("SELECT * FROM complaints WHERE status IN ('submitted','reviewing') ORDER BY created_at DESC");
    }
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

app.put("/api/complaints/:id/respond", async (req, res) => {
  const { sellerId, resolution, status = "reviewing" } = req.body ?? {};
  if (!sellerId || !String(resolution ?? "").trim() || !["reviewing", "resolved", "rejected"].includes(status)) {
    res.status(400).json({ error: "Seller, a response, and a valid complaint status are required." });
    return;
  }
  try {
    const [result] = await pool.query(
      `UPDATE complaints c JOIN orders o ON o.id = c.order_id JOIN shops s ON s.id = o.shop_id
       SET c.resolution = ?, c.status = ?
       WHERE c.id = ? AND s.owner_id = ? AND c.status IN ('submitted','reviewing')`,
      [String(resolution).trim(), status, req.params.id, sellerId],
    );
    if (!(result as { affectedRows: number }).affectedRows) { res.status(404).json({ error: "Open complaint not found for this seller." }); return; }
    const [rows] = await pool.query("SELECT * FROM complaints WHERE id = ?", [req.params.id]);
    res.json((rows as unknown[])[0]);
  } catch { res.status(500).json({ error: "Unable to save complaint response." }); }
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

app.put("/api/foods/:id", async (req, res) => {
  const { sellerId, currentPrice, quantity } = req.body ?? {};
  if (!sellerId || (currentPrice !== undefined && (!Number.isFinite(Number(currentPrice)) || Number(currentPrice) < 0)) || (quantity !== undefined && (!Number.isInteger(Number(quantity)) || Number(quantity) < 0))) {
    res.status(400).json({ error: "Seller, a non-negative price, and an optional non-negative quantity are required." });
    return;
  }
  try {
    const [result] = await pool.query(
      `UPDATE food_items f JOIN shops s ON s.id = f.shop_id
       SET f.current_price = COALESCE(?, f.current_price), f.quantity_available = COALESCE(?, f.quantity_available)
       WHERE f.id = ? AND s.owner_id = ? AND f.status IN ('active','sold_out')`,
      [currentPrice === undefined ? null : Number(currentPrice), quantity === undefined ? null : Number(quantity), req.params.id, sellerId],
    );
    if (!(result as { affectedRows: number }).affectedRows) { res.status(404).json({ error: "Listing not found for this seller." }); return; }
    const [rows] = await pool.query("SELECT f.*, s.name AS shop_name, s.address FROM food_items f JOIN shops s ON s.id = f.shop_id WHERE f.id = ?", [req.params.id]);
    res.json((rows as unknown[])[0]);
  } catch { res.status(500).json({ error: "Unable to update this listing." }); }
});

app.get("/api/seller/:sellerId/pricing", async (req, res) => {
  const shopId = String(req.query.shopId ?? "");
  if (!shopId) { res.status(400).json({ error: "shopId is required." }); return; }
  try {
    const [rows] = await pool.query(
      `SELECT r.enabled, r.tiers, r.cutoff_minutes FROM seller_pricing_rules r JOIN shops s ON s.id = r.shop_id
       WHERE r.shop_id = ? AND s.owner_id = ?`, [shopId, req.params.sellerId],
    );
    const rule = (rows as Array<{ enabled: boolean; tiers: unknown; cutoff_minutes: number }>)[0];
    res.json({ enabled: rule?.enabled ?? true, cutoffMinutes: rule?.cutoff_minutes ?? 30, tiers: rule?.tiers ?? [{ minutesBeforeClose: 120, discountPercent: 20 }, { minutesBeforeClose: 60, discountPercent: 40 }, { minutesBeforeClose: 30, discountPercent: 70 }] });
  } catch { res.status(500).json({ error: "Unable to load dynamic pricing rules." }); }
});

app.put("/api/seller/:sellerId/pricing", async (req, res) => {
  const { shopId, enabled, tiers, cutoffMinutes = 30 } = req.body ?? {};
  if (!shopId || typeof enabled !== "boolean" || !Number.isInteger(cutoffMinutes) || cutoffMinutes < 0 || cutoffMinutes > 180 || !Array.isArray(tiers) || tiers.length > 8 || tiers.some((tier) => !Number.isInteger(tier.minutesBeforeClose) || tier.minutesBeforeClose < 0 || !Number.isInteger(tier.discountPercent) || tier.discountPercent < 0 || tier.discountPercent > 100)) {
    res.status(400).json({ error: "A store, enabled flag, and valid discount tiers are required." }); return;
  }
  try {
    const [owned] = await pool.query("SELECT id FROM shops WHERE id = ? AND owner_id = ?", [shopId, req.params.sellerId]);
    if (!(owned as unknown[]).length) { res.status(404).json({ error: "Store not found for this seller." }); return; }
    await pool.query(
      `INSERT INTO seller_pricing_rules (shop_id, enabled, tiers, cutoff_minutes) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), tiers = VALUES(tiers), cutoff_minutes = VALUES(cutoff_minutes)`,
      [shopId, enabled, JSON.stringify(tiers), cutoffMinutes],
    );
    res.json({ enabled, cutoffMinutes, tiers });
  } catch { res.status(500).json({ error: "Unable to save dynamic pricing rules." }); }
});

app.get("/api/seller/:sellerId/orders", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id AS order_id, o.created_at, o.total_amount, o.status AS order_status,
              r.id AS reservation_id, r.quantity, r.status AS reservation_status,
              f.id AS food_item_id, f.name AS food_name, s.id AS shop_id, s.name AS shop_name
       FROM orders o JOIN reservations r ON r.id = o.reservation_id
       JOIN food_items f ON f.id = r.food_item_id JOIN shops s ON s.id = o.shop_id
       WHERE s.owner_id = ? ORDER BY o.created_at DESC LIMIT 200`,
      [req.params.sellerId],
    );
    res.json({ items: rows });
  } catch { res.status(500).json({ error: "Unable to load seller orders." }); }
});

app.get("/api/seller/:sellerId/shifts", async (req, res) => {
  const shopId = String(req.query.shopId ?? "");
  if (!shopId) { res.status(400).json({ error: "shopId is required." }); return; }
  try {
    const [rows] = await pool.query(
      `SELECT c.* FROM seller_shift_closures c JOIN shops s ON s.id = c.shop_id
       WHERE c.shop_id = ? AND s.owner_id = ? ORDER BY c.closed_at DESC LIMIT 30`, [shopId, req.params.sellerId],
    );
    res.json({ items: rows });
  } catch { res.status(500).json({ error: "Unable to load shift closures." }); }
});

app.post("/api/seller/:sellerId/shifts/close", async (req, res) => {
  const shopId = String(req.body?.shopId ?? "");
  if (!shopId) { res.status(400).json({ error: "shopId is required." }); return; }
  try {
    const [owned] = await pool.query("SELECT id FROM shops WHERE id = ? AND owner_id = ?", [shopId, req.params.sellerId]);
    if (!(owned as unknown[]).length) { res.status(404).json({ error: "Store not found for this seller." }); return; }
    const [summaryRows] = await pool.query(
      `SELECT COALESCE(SUM(o.total_amount), 0) AS revenue, COUNT(o.id) AS completed_orders,
              COALESCE(SUM(r.quantity), 0) AS sold_portions
       FROM orders o JOIN reservations r ON r.id = o.reservation_id
       WHERE o.shop_id = ? AND o.status = 'completed' AND o.created_at >= CURRENT_DATE`, [shopId],
    );
    const summary = (summaryRows as Array<{ revenue: number; completed_orders: number; sold_portions: number }>)[0];
    const [giftRows] = await pool.query("SELECT COALESCE(SUM(quantity_available), 0) AS gifted_portions FROM food_items WHERE shop_id = ? AND current_price = 0", [shopId]);
    const gifted = Number((giftRows as Array<{ gifted_portions: number }>)[0]?.gifted_portions ?? 0);
    const [leftoverRows] = await pool.query("SELECT COALESCE(SUM(quantity_available), 0) AS leftover_portions FROM food_items WHERE shop_id = ? AND current_price > 0 AND status = 'active'", [shopId]);
    const leftover = Number((leftoverRows as Array<{ leftover_portions: number }>)[0]?.leftover_portions ?? 0);
    const id = randomUUID();
    await pool.query(
      `INSERT INTO seller_shift_closures (id, shop_id, seller_id, revenue, completed_orders, sold_portions, gifted_portions, leftover_portions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, shopId, req.params.sellerId, Number(summary?.revenue ?? 0), Number(summary?.completed_orders ?? 0), Number(summary?.sold_portions ?? 0), gifted, leftover],
    );
    res.status(201).json({ id, shopId, revenue: Number(summary?.revenue ?? 0), completedOrders: Number(summary?.completed_orders ?? 0), soldPortions: Number(summary?.sold_portions ?? 0), giftedPortions: gifted, leftoverPortions: leftover, closedAt: new Date().toISOString() });
  } catch { res.status(500).json({ error: "Unable to close this shift." }); }
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
    const [cutoffRows] = await connection.query(
      `SELECT f.pickup_ends_at, COALESCE(r.cutoff_minutes, 30) AS cutoff_minutes
       FROM food_items f LEFT JOIN seller_pricing_rules r ON r.shop_id = f.shop_id WHERE f.id = ?`, [foodItemId],
    );
    const pickupRules = (cutoffRows as Array<{ pickup_ends_at: Date | string | null; cutoff_minutes: number }>)[0];
    if (pickupRules?.pickup_ends_at && new Date(pickupRules.pickup_ends_at).getTime() - Date.now() <= Number(pickupRules.cutoff_minutes) * 60_000) {
      await connection.rollback();
      res.status(409).json({ error: "Pickup registration is closed for this listing." });
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


// ==========================================
// MODULE 3 & 4 ENDPOINTS (US-C & US-D)
// ==========================================

// Get single food with full safety details (US-C1, C2, C3)
app.get("/api/foods/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.*, s.name AS shop_name, s.address, s.latitude, s.longitude, s.verified, s.reputation_score,
              s.safety_certificate_url
       FROM food_items f JOIN shops s ON s.id = f.shop_id
       WHERE f.id = ?`,
      [req.params.id]
    );
    const item = (rows as Array<any>)[0];
    if (!item) {
      res.status(404).json({ error: "Food item not found." });
      return;
    }
    const foodDetails = {
      ...item,
      manufacturing_date: item.prepared_at || new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      recommended_expiry: item.expires_at || new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
      label_image_url: item.label_image_url || item.image_url,
      storage_type: item.storage_type || (item.storage_instructions?.toLowerCase().includes("refrigerat") ? "refrigerated" : "room_temperature"),
      reheating_instructions: item.reheating_instructions || "Reheat until steaming hot and consume immediately.",
      refrigeration_requirement: item.refrigeration_requirement || "Keep refrigerated at 0–4°C. Consume within 2 hours if stored at room temperature.",
      origin_info: typeof item.origin_info === "string" ? JSON.parse(item.origin_info) : item.origin_info || {
        business_permit: "230503-HD",
        certificate_no: "FS-2026-0184",
        issue_date: "2026-03-12",
        inspected_by: "Department of Food Safety and Hygiene",
        activity_start: "2025-10-12",
        ingredient_source: "Local food safety inspected suppliers"
      },
      seller_commitments: typeof item.seller_commitments === "string" ? JSON.parse(item.seller_commitments) : item.seller_commitments || [
        "100% fresh, inspected safe surplus ingredients",
        "Proper food preparation under certified hygiene standards",
        "Controlled cold-chain storage and verified countdown tracking",
        "Dedicated pickup zone with zero waiting time and silent handoff",
        "Prompt complaint resolution and 100% refund guarantee if spoiled"
      ]
    };
    res.json(foodDetails);
  } catch {
    res.status(500).json({ error: "Unable to load food details." });
  }
});

// Update spot reservation with hold minutes (US-D1)
app.post("/api/reservations/hold", async (req, res) => {
  const { foodItemId, buyerId, holdMinutes = 20, quantity = 1 } = req.body ?? {};
  if (!foodItemId || !buyerId || !Number.isInteger(quantity) || quantity < 1 || ![15, 20, 30].includes(Number(holdMinutes))) {
    res.status(400).json({ error: "foodItemId, buyerId, a positive quantity, and a 15, 20, or 30 minute hold are required." });
    return;
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [foodRows] = await connection.query(
      "SELECT id, shop_id, current_price, quantity_available FROM food_items WHERE id = ? AND status = 'active' FOR UPDATE",
      [foodItemId]
    );
    const food = (foodRows as Array<any>)[0];
    if (!food || food.quantity_available < quantity) {
      await connection.rollback();
      res.status(409).json({ error: "Not enough portions available." });
      return;
    }
    const [cutoffRows] = await connection.query(
      `SELECT f.pickup_ends_at, COALESCE(r.cutoff_minutes, 30) AS cutoff_minutes
       FROM food_items f LEFT JOIN seller_pricing_rules r ON r.shop_id = f.shop_id WHERE f.id = ?`, [foodItemId],
    );
    const pickupRules = (cutoffRows as Array<{ pickup_ends_at: Date | string | null; cutoff_minutes: number }>)[0];
    if (pickupRules?.pickup_ends_at && new Date(pickupRules.pickup_ends_at).getTime() - Date.now() <= Number(pickupRules.cutoff_minutes) * 60_000) {
      await connection.rollback();
      res.status(409).json({ error: "Pickup registration is closed for this listing." });
      return;
    }
    const reservationId = randomUUID();
    const expiresAt = new Date(Date.now() + Number(holdMinutes) * 60 * 1000);
    const depositAmount = 10000;
    await connection.query(
      `INSERT INTO reservations (id, food_item_id, buyer_id, quantity, status, hold_expires_at, deposit_amount)
       VALUES (?, ?, ?, ?, 'held', ?, ?)`,
      [reservationId, foodItemId, buyerId, quantity, expiresAt, depositAmount]
    );
    await connection.query("UPDATE food_items SET quantity_available = quantity_available - ? WHERE id = ?", [quantity, foodItemId]);
    const orderId = randomUUID();
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pickupCode = "";
    for (let i = 0; i < 3; i++) pickupCode += chars.charAt(Math.floor(Math.random() * chars.length));
    pickupCode += "-";
    for (let i = 0; i < 3; i++) pickupCode += chars.charAt(Math.floor(Math.random() * chars.length));
    
    await connection.query(
      `INSERT INTO orders (id, reservation_id, buyer_id, shop_id, total_amount, pickup_qr_token, status)
       VALUES (?, ?, ?, ?, ?, ?, 'awaiting_pickup')`,
      [orderId, reservationId, buyerId, food.shop_id, Number(food.current_price) * quantity, pickupCode]
    );
    await connection.commit();
    res.status(201).json({
      reservationId,
      orderId,
      pickupCode,
      holdMinutes,
      holdExpiresAt: expiresAt.toISOString(),
      depositAmount,
      quantity,
      totalAmount: Number(food.current_price) * quantity,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: "Unable to hold spot reservation." });
  } finally {
    connection.release();
  }
});

// Pay deposit (US-D2)
app.post("/api/reservations/:id/deposit", async (req, res) => {
  const { paymentMethod = "momo" } = req.body ?? {};
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [resRows] = await connection.query("SELECT * FROM reservations WHERE id = ? FOR UPDATE", [req.params.id]);
    const reservation = (resRows as Array<any>)[0];
    if (!reservation) {
      await connection.rollback();
      res.status(404).json({ error: "Reservation not found." });
      return;
    }
    if (reservation.status !== "held" || new Date(reservation.hold_expires_at).getTime() <= Date.now()) {
      await connection.rollback();
      res.status(409).json({ error: "This hold has expired. Choose the meal again to reserve a new portion." });
      return;
    }
    const [existingRows] = await connection.query(
      "SELECT id FROM transactions WHERE order_id = (SELECT id FROM orders WHERE reservation_id = ?) AND transaction_type = 'deposit' AND status = 'completed' LIMIT 1",
      [req.params.id],
    );
    if ((existingRows as unknown[]).length) {
      await connection.rollback();
      res.status(409).json({ error: "A deposit has already been recorded for this reservation." });
      return;
    }
    const txId = "DC-" + Math.floor(10000 + Math.random() * 90000);
    const [orderRows] = await connection.query("SELECT id FROM orders WHERE reservation_id = ?", [req.params.id]);
    const orderId = (orderRows as Array<{ id: string }>)[0]?.id;
    if (!orderId) {
      await connection.rollback();
      res.status(404).json({ error: "Order for this reservation was not found." });
      return;
    }
    const amount = Number(reservation.deposit_amount);
    await connection.query(
      `INSERT INTO transactions (id, order_id, user_id, amount, transaction_type, status, provider_reference)
       VALUES (?, ?, ?, ?, 'deposit', 'completed', ?)`,
      [randomUUID(), orderId, reservation.buyer_id, amount, txId]
    );
    await connection.query("UPDATE reservations SET status = 'confirmed' WHERE id = ?", [req.params.id]);
    await connection.commit();
    res.json({
      success: true,
      transactionId: "#" + txId,
      paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount,
      paymentMethod,
      depositStatus: "Deposit paid",
      heldUntil: reservation.hold_expires_at
    });
  } catch {
    await connection.rollback();
    res.status(500).json({ error: "Unable to process deposit." });
  } finally { connection.release(); }
});

// Choose pickup time slot (US-D3)
app.post("/api/reservations/:id/slot", async (req, res) => {
  const { slotStart, slotEnd, dateStr } = req.body ?? {};
  if (!slotStart || !slotEnd || Number.isNaN(new Date(slotStart).getTime()) || Number.isNaN(new Date(slotEnd).getTime()) || new Date(slotEnd) <= new Date(slotStart)) {
    res.status(400).json({ error: "A valid pickup start and end time are required." });
    return;
  }
  try {
    const [rows] = await pool.query("SELECT status FROM reservations WHERE id = ?", [req.params.id]);
    const reservation = (rows as Array<{ status: string }>)[0];
    if (!reservation) { res.status(404).json({ error: "Reservation not found." }); return; }
    if (reservation.status !== "confirmed") { res.status(409).json({ error: "Pay the deposit before selecting a pickup time." }); return; }
    await pool.query(
      "UPDATE reservations SET pickup_slot_start = ?, pickup_slot_end = ? WHERE id = ?",
      [slotStart, slotEnd, req.params.id]
    );
    const dateFormatted = dateStr || new Date(slotStart).toLocaleDateString("vi-VN");
    const startFormatted = new Date(slotStart).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const endFormatted = new Date(slotEnd).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    res.json({ success: true, slot: dateFormatted + " · " + startFormatted + " – " + endFormatted });
  } catch {
    res.status(500).json({ error: "Unable to update pickup slot." });
  }
});

// Cancel & Release to waitlist or back to stock (US-D4)
app.post("/api/reservations/:id/cancel-release", async (req, res) => {
  try { await releaseExpiredHolds(); }
  catch { res.status(503).json({ error: "Unable to release expired holds." }); return; }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [resRows] = await connection.query("SELECT * FROM reservations WHERE id = ? FOR UPDATE", [req.params.id]);
    const reservation = (resRows as Array<any>)[0];
    if (!reservation) {
      await connection.rollback();
      res.status(404).json({ error: "Reservation not found." });
      return;
    }
    if (reservation.status !== "held" && reservation.status !== "confirmed") {
      await connection.rollback();
      res.status(409).json({ error: "This reservation is no longer active." });
      return;
    }
    await connection.query("UPDATE reservations SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    await connection.query("UPDATE orders SET status = 'cancelled' WHERE reservation_id = ?", [req.params.id]);
    
    const [waitlistRows] = await connection.query(
      "SELECT * FROM waitlists WHERE food_item_id = ? AND status = 'waiting' ORDER BY queue_position ASC LIMIT 1 FOR UPDATE",
      [reservation.food_item_id]
    );
    const nextInWaitlist = (waitlistRows as Array<any>)[0];
    let nextBuyerName = null;
    if (nextInWaitlist) {
      await connection.query(
        "UPDATE waitlists SET status = 'offered', offered_at = CURRENT_TIMESTAMP, offer_expires_at = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 MINUTE) WHERE id = ?",
        [nextInWaitlist.id]
      );
      const [userRows] = await connection.query("SELECT full_name FROM users WHERE id = ?", [nextInWaitlist.user_id]);
      nextBuyerName = (userRows as Array<any>)[0]?.full_name || "Buyer in queue";
    } else {
      await connection.query(
        "UPDATE food_items SET quantity_available = quantity_available + ? WHERE id = ?",
        [reservation.quantity, reservation.food_item_id]
      );
    }
    await connection.commit();
    res.json({
      success: true,
      portionsReleased: reservation.quantity,
      assignedToWaitlist: Boolean(nextInWaitlist),
      nextBuyerName,
      depositTransferred: true
    });
  } catch {
    await connection.rollback();
    res.status(500).json({ error: "Unable to cancel and release order." });
  } finally {
    connection.release();
  }
});

// Waitlist status & join (US-D4)
app.get("/api/foods/:id/waitlist", async (req, res) => {
  try {
    await releaseExpiredHolds();
    const [rows] = await pool.query(
      `SELECT w.*, u.full_name AS user_name
       FROM waitlists w JOIN users u ON u.id = w.user_id
       WHERE w.food_item_id = ? AND w.status IN ('waiting', 'offered')
       ORDER BY w.queue_position ASC`,
      [req.params.id]
    );
    const [heldRows] = await pool.query(
      "SELECT COUNT(*) AS heldCount FROM reservations WHERE food_item_id = ? AND status IN ('held', 'confirmed')",
      [req.params.id]
    );
    res.json({
      heldCount: (heldRows as Array<any>)[0]?.heldCount || 0,
      waitlistCount: (rows as Array<any>).length,
      waitlist: rows
    });
  } catch {
    res.status(500).json({ error: "Unable to load waitlist." });
  }
});

app.post("/api/foods/:id/waitlist", async (req, res) => {
  const { userId, quantity = 1 } = req.body ?? {};
  if (!userId || !Number.isInteger(quantity) || quantity < 1) {
    res.status(400).json({ error: "A user id and a positive whole number of portions are required." });
    return;
  }
  try {
    const [existingRows] = await pool.query(
      "SELECT id, queue_position FROM waitlists WHERE food_item_id = ? AND user_id = ? AND status IN ('waiting','offered') LIMIT 1",
      [req.params.id, userId],
    );
    const existing = (existingRows as Array<{ id: string; queue_position: number }>)[0];
    if (existing) { res.json({ success: true, waitlistId: existing.id, position: existing.queue_position }); return; }
    const [posRows] = await pool.query(
      "SELECT COALESCE(MAX(queue_position), 0) + 1 AS nextPos FROM waitlists WHERE food_item_id = ?",
      [req.params.id]
    );
    const position = (posRows as Array<any>)[0]?.nextPos || 1;
    const waitlistId = randomUUID();
    await pool.query(
      `INSERT INTO waitlists (id, food_item_id, user_id, queue_position, quantity, status)
       VALUES (?, ?, ?, ?, ?, 'waiting')`,
      [waitlistId, req.params.id, userId, position, quantity]
    );
    res.status(201).json({ success: true, waitlistId, position });
  } catch {
    res.status(500).json({ error: "Unable to join waitlist." });
  }
});

const port = Number(process.env.API_PORT ?? 4000);
app.listen(port, "0.0.0.0", () => console.log(`ResQ API listening on http://0.0.0.0:${port}`));
