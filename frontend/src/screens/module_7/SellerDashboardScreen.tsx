import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../api";

type Props = { userId: string; onBack: () => void; onPostSurplus: () => void; onScanQr: () => void; onMenuManager: () => void; onShiftReport: () => void; onOpenSettings: () => void };
type Shop = { id: string; name: string };
type Food = { id: string; name: string; shop_id: string; current_price: number | string; original_price: number | string; quantity_available: number };
type Order = { order_id?: string; id?: string; shop_id: string; food_name?: string; order_status?: string; status?: string; total_amount?: number | string; quantity?: number; created_at?: string };

const money = (value: number | string) => `${Number(value || 0).toLocaleString("vi-VN")}₫`;

export default function SellerDashboardScreen({ userId, onBack, onPostSurplus, onScanQr, onMenuManager, onShiftReport, onOpenSettings }: Props) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shiftName, setShiftName] = useState("Evening shift");

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch(`${API_URL}/api/shops?ownerId=${encodeURIComponent(userId)}`).then((r) => r.json()),
      fetch(`${API_URL}/api/foods`).then((r) => r.json()),
      fetch(`${API_URL}/api/seller/${encodeURIComponent(userId)}/orders`).then((r) => r.json()),
    ]).then(([shopResult, foodResult, orderResult]) => {
      if (!active) return;
      const rows = shopResult.items ?? [];
      setShops(rows);
      setShopId(rows[0]?.id ?? "");
      setFoods(foodResult.items ?? []);
      setOrders(orderResult.items ?? []);
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  const storeFoods = useMemo(() => foods.filter((food) => food.shop_id === shopId), [foods, shopId]);
  const storeOrders = useMemo(() => orders.filter((order) => order.shop_id === shopId), [orders, shopId]);
  const activeFoods = storeFoods.filter((food) => Number(food.quantity_available) > 0);
  const pending = storeOrders.filter((order) => ["pending", "confirmed", "reserved", "deposit_paid"].includes((order.order_status || order.status || "").toLowerCase()));
  const cancelled = storeOrders.filter((order) => (order.order_status || order.status || "").toLowerCase().includes("cancel"));
  const completed = storeOrders.filter((order) => ["completed", "picked_up"].includes((order.order_status || order.status || "").toLowerCase()));
  const rescued = completed.reduce((sum, order) => sum + Number(order.quantity || 1), 0);
  const recovered = completed.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const available = storeFoods.reduce((sum, food) => sum + Number(food.quantity_available || 0), 0);
  const pendingCount = pending.length;
  const noShow = storeOrders.filter((order) => (order.order_status || order.status || "").toLowerCase().includes("no_show")).length;
  const sellThrough = storeFoods.length ? Math.round((rescued / Math.max(1, rescued + available)) * 100) : 0;

  return <View style={s.root}>
    <View style={s.header}>
      <View style={s.storeHeading}>
        <Pressable onPress={onMenuManager} style={s.titleTap}><Text numberOfLines={1} style={s.storeName}>{shops.find((shop) => shop.id === shopId)?.name || "Seller Dashboard"}</Text><Ionicons name="pencil-outline" size={15} color={c.ink} /></Pressable>
        <Pressable onPress={onShiftReport} style={s.shiftLink}><Text style={s.shiftText}>{shiftName}</Text><Ionicons name="chevron-forward" size={13} color={c.ink} /></Pressable>
      </View>
      <View style={s.headerActions}>
        <Pressable onPress={onBack} style={s.headerIcon}><Ionicons name="home-outline" size={17} color={c.ink} /></Pressable>
        <Pressable onPress={onShiftReport} style={s.headerIcon}><Ionicons name="notifications-outline" size={17} color={c.ink} /></Pressable>
        <Pressable onPress={() => setMenuOpen((open) => !open)} style={s.more}><Ionicons name="ellipsis-horizontal" size={18} color={c.ink} /></Pressable>
      </View>
      {menuOpen && <View style={s.popover}>
        <Pressable onPress={() => { setMenuOpen(false); setShiftName((current) => current === "Evening shift" ? "Morning shift" : "Evening shift"); }} style={s.popoverRow}><Ionicons name="swap-horizontal-outline" size={15} color={c.ink} /><Text style={s.popoverText}>Switch shift</Text></Pressable>
        <Pressable onPress={() => { setMenuOpen(false); onShiftReport(); }} style={s.popoverRow}><Ionicons name="close-outline" size={15} color={c.ink} /><Text style={s.popoverText}>Close shift</Text></Pressable>
        <Pressable onPress={() => { setMenuOpen(false); onOpenSettings(); }} style={s.popoverRow}><Ionicons name="settings-outline" size={15} color={c.ink} /><Text style={s.popoverText}>Setting shift</Text></Pressable>
      </View>}
    </View>

    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.shiftCard}>
        <View style={s.countdownRow}><View><Text style={s.closeTitle}>Pick-up close in</Text><Text style={s.closeSub}>Current discount 50% ↻</Text></View><Text style={s.timer}>00:42:10</Text></View>
        <View style={s.actionsRow}>
          <Pressable onPress={onPostSurplus} style={s.postButton}><Ionicons name="add" size={17} color={c.white} /><Text style={s.actionLight}>Post surplus</Text></Pressable>
          <Pressable onPress={onScanQr} style={s.scanButton}><Text style={s.actionDark}>Scan QR</Text></Pressable>
        </View>
        <Pressable onPress={onMenuManager} style={s.menuManager}><Ionicons name="clipboard-outline" size={15} color={c.ink} /><Text style={s.menuManagerText}>Menu manager</Text></Pressable>
      </View>

      {shops.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.shopPills}>{shops.map((shop) => <Pressable key={shop.id} onPress={() => setShopId(shop.id)} style={[s.shopPill, shopId === shop.id && s.shopPillActive]}><Text style={[s.shopPillText, shopId === shop.id && s.shopPillTextActive]}>{shop.name}</Text></Pressable>)}</ScrollView>}

      {loading ? <ActivityIndicator color={c.green} style={{ margin: 24 }} /> : <>
        <View style={s.metricsRow}>
          <Metric label="Meals rescued" value={String(rescued)} hint="↑ 12%" />
          <Metric label="Recovered rev" value={money(recovered)} hint="↑ 14%" orange />
        </View>
        <View style={s.metricsRow}>
          <Metric label="Sell-through" value={`${sellThrough}%`} hint="↑ 5%" orange />
          <Metric label="No-show rate" value={`${storeOrders.length ? Math.round(noShow / storeOrders.length * 100) : 0}%`} hint="↓ 2%" orange />
        </View>

        <Section title="Active Posts" onViewAll={onMenuManager}>
          <View style={s.listCard}>{activeFoods.slice(0, 4).map((food, index) => <View key={food.id} style={[s.foodRow, index > 0 && s.divider]}><View style={s.rowMain}><Text numberOfLines={1} style={s.itemTitle}>{food.name} <Text style={s.discount}>({discount(food)}% OFF)</Text></Text><Text style={s.itemSub}>Stock: {food.quantity_available}</Text></View><View style={s.pricePill}><Text style={s.priceText}>{money(food.current_price)} <Text style={s.wasPrice}>({money(food.original_price)})</Text></Text></View></View>)}{!activeFoods.length && <Empty text="No active surplus posts yet." />}</View>
        </Section>

        <Section title="Pending Pickup" onViewAll={onScanQr}>
          <View style={s.listCard}>{pending.slice(0, 4).map((order, index) => <View key={order.order_id || order.id || index} style={[s.orderRow, index > 0 && s.divider]}><View style={s.rowMain}><Text style={s.itemTitle}>#{order.order_id || order.id || "ORDER"} · {order.food_name || "ResQ meal"}</Text><Text style={s.itemSub}>{money(order.total_amount || 0)} · x{order.quantity || 1}</Text></View><Pressable onPress={onScanQr} style={s.depositPill}><Text style={s.depositText}>Deposit Paid</Text></Pressable></View>)}{!pendingCount && <Empty text="No pickups waiting right now." />}</View>
        </Section>

        <Section title="Cancelled Order" onViewAll={onShiftReport}>
          <View style={s.cancelList}>{cancelled.slice(0, 4).map((order, index) => <View key={order.order_id || order.id || index} style={s.cancelRow}><Text numberOfLines={1} style={s.itemTitle}>#{order.order_id || order.id || "ORDER"} · {order.food_name || "ResQ meal"}</Text><Text style={s.itemSub}>{money(order.total_amount || 0)} · x{order.quantity || 1}</Text><Ionicons name="chevron-forward" size={15} color={c.muted} /></View>)}{!cancelled.length && <Empty text="No cancelled orders." />}</View>
        </Section>
      </>}
    </ScrollView>
  </View>;
}

function discount(food: Food) { const original = Number(food.original_price); return original > 0 ? Math.max(0, Math.round((1 - Number(food.current_price) / original) * 100)) : 0; }
function Metric({ label, value, hint, orange = false }: { label: string; value: string; hint: string; orange?: boolean }) { return <View style={s.metric}><Text style={s.metricLabel}>{label}</Text><View style={s.metricBottom}><Text numberOfLines={1} adjustsFontSizeToFit style={[s.metricValue, orange && s.orange]}>{value}</Text><Text style={s.hint}>{hint}</Text></View></View>; }
function Section({ title, onViewAll, children }: { title: string; onViewAll: () => void; children: React.ReactNode }) { return <View style={s.section}><View style={s.sectionHeader}><Text style={s.sectionTitle}>{title}</Text><Pressable onPress={onViewAll}><Text style={s.viewAll}>View all</Text></Pressable></View>{children}</View>; }
function Empty({ text }: { text: string }) { return <Text style={s.empty}>{text}</Text>; }

const c = { green: "#176c4a", dark: "#183c2b", ink: "#183c2b", white: "#ffffff", muted: "#738176", pale: "#e8f3ea", line: "#e3ebe4", orange: "#ed7200" };
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.white },
  header: { minHeight: 63, paddingHorizontal: 16, paddingTop: 5, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderColor: c.line, zIndex: 2 },
  storeHeading: { flex: 1, gap: 2 }, titleTap: { flexDirection: "row", alignItems: "center", gap: 5 }, storeName: { color: c.ink, fontSize: 15, fontWeight: "800", maxWidth: 190 }, shiftLink: { flexDirection: "row", alignItems: "center", gap: 3 }, shiftText: { color: c.ink, fontSize: 10 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 }, headerIcon: { width: 25, height: 32, alignItems: "center", justifyContent: "center" }, more: { width: 29, height: 29, borderRadius: 15, backgroundColor: "#f1f4f1", alignItems: "center", justifyContent: "center" },
  popover: { position: "absolute", top: 52, right: 42, width: 150, backgroundColor: c.white, borderRadius: 12, padding: 6, elevation: 9, shadowColor: "#000", shadowOpacity: 0.14, shadowRadius: 10, zIndex: 5 }, popoverRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 8 }, popoverText: { color: c.ink, fontSize: 11 },
  content: { padding: 14, paddingBottom: 28, gap: 9 }, shiftCard: { borderRadius: 16, backgroundColor: c.green, padding: 14, gap: 9 }, countdownRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, closeTitle: { color: c.white, fontSize: 13, fontWeight: "800" }, closeSub: { color: "#d6ecdd", fontSize: 10, marginTop: 2 }, timer: { color: c.white, fontSize: 12, fontWeight: "800" }, actionsRow: { flexDirection: "row", gap: 9 }, postButton: { flex: 1, height: 34, flexDirection: "row", gap: 5, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#105c3d" }, scanButton: { flex: 1, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: c.white }, actionLight: { color: c.white, fontSize: 11, fontWeight: "700" }, actionDark: { color: c.ink, fontSize: 11, fontWeight: "700" }, menuManager: { height: 29, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: c.white, borderRadius: 16 }, menuManagerText: { color: c.ink, fontSize: 10, fontWeight: "600" },
  shopPills: { gap: 7 }, shopPill: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: c.line }, shopPillActive: { backgroundColor: c.pale, borderColor: c.green }, shopPillText: { color: c.ink, fontSize: 10 }, shopPillTextActive: { color: c.green, fontWeight: "700" },
  metricsRow: { flexDirection: "row", gap: 8 }, metric: { flex: 1, minHeight: 50, borderRadius: 11, borderWidth: 1, borderColor: c.line, paddingHorizontal: 10, paddingVertical: 7, justifyContent: "space-between" }, metricLabel: { color: c.ink, fontSize: 9 }, metricBottom: { flexDirection: "row", alignItems: "baseline", gap: 5 }, metricValue: { color: c.orange, fontSize: 15, fontWeight: "500", flexShrink: 1 }, orange: { color: c.orange }, hint: { color: "#8b958d", fontSize: 8 },
  section: { gap: 6, marginTop: 2 }, sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, sectionTitle: { color: c.ink, fontSize: 12, fontWeight: "800" }, viewAll: { color: c.green, fontSize: 9, textDecorationLine: "underline" }, listCard: { borderRadius: 15, borderWidth: 1, borderColor: c.line, paddingHorizontal: 11, paddingVertical: 2 }, foodRow: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 7 }, orderRow: { minHeight: 39, flexDirection: "row", alignItems: "center", gap: 7 }, divider: { borderTopWidth: 1, borderColor: "#eef2ee" }, rowMain: { flex: 1, gap: 2 }, itemTitle: { color: c.ink, fontSize: 9, fontWeight: "600" }, discount: { color: c.ink, fontSize: 7, fontWeight: "400" }, itemSub: { color: c.muted, fontSize: 8 }, pricePill: { borderRadius: 12, paddingHorizontal: 7, paddingVertical: 5, backgroundColor: c.pale }, priceText: { color: c.green, fontSize: 7, fontWeight: "700" }, wasPrice: { color: c.muted, fontWeight: "400" }, depositPill: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: c.pale }, depositText: { color: c.green, fontSize: 7, fontWeight: "600" }, cancelList: { borderRadius: 14, paddingHorizontal: 4 }, cancelRow: { minHeight: 24, flexDirection: "row", alignItems: "center", gap: 5 }, empty: { paddingVertical: 12, color: c.muted, fontSize: 9 },
});
