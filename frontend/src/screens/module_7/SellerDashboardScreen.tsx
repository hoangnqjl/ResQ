import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../api";
import { MOCK_SHOPS, MOCK_FOODS } from "../../data/offlineMockData";

type Props = { userId: string; onBack: () => void; onPostSurplus: () => void; onScanQr: () => void; onMenuManager: () => void; onShiftReport: () => void; onOpenSettings: () => void };
type Shop = { id: string; name: string };
type Food = { id: string; name: string; shop_id: string; current_price: number | string; original_price: number | string; quantity_available: number };
type Order = { order_id?: string; id?: string; shop_id: string; food_name?: string; order_status?: string; status?: string; total_amount?: number | string; quantity?: number; created_at?: string };

const money = (value: number | string) => `${Number(value || 0).toLocaleString("vi-VN")}₫`;

const FALLBACK_SHOPS: Shop[] = [
  { id: "33333333-3333-4333-8333-333333333336", name: "The Corner Kitchen" },
  { id: "33333333-3333-4333-8333-333333333333", name: "ResQ Central Kitchen" },
];

const FALLBACK_FOODS: Food[] = [
  { id: "f-1", name: "Grilled Chicken Rice", shop_id: "33333333-3333-4333-8333-333333333336", current_price: 35000, original_price: 70000, quantity_available: 4 },
  { id: "f-2", name: "Baguette Combo", shop_id: "33333333-3333-4333-8333-333333333336", current_price: 25000, original_price: 35000, quantity_available: 2 },
];

const FALLBACK_ORDERS: Order[] = [
  { order_id: "ORD-84920", id: "ORD-84920", shop_id: "33333333-3333-4333-8333-333333333336", food_name: "Chicken Rice", order_status: "reserved", total_amount: 35000, quantity: 1 },
  { order_id: "ORD-84920B", id: "ORD-84920B", shop_id: "33333333-3333-4333-8333-333333333336", food_name: "Baguette Combo", order_status: "reserved", total_amount: 25000, quantity: 1 },
  { order_id: "ORD-84921", id: "ORD-84921", shop_id: "33333333-3333-4333-8333-333333333336", food_name: "Chicken Rice", order_status: "cancelled", total_amount: 35000, quantity: 1 },
  { order_id: "ORD-84922", id: "ORD-84922", shop_id: "33333333-3333-4333-8333-333333333336", food_name: "Baguette Combo", order_status: "cancelled", total_amount: 25000, quantity: 1 },
];

export default function SellerDashboardScreen({ userId, onBack, onPostSurplus, onScanQr, onMenuManager, onShiftReport, onOpenSettings }: Props) {
  const [shops, setShops] = useState<Shop[]>(FALLBACK_SHOPS);
  const [shopId, setShopId] = useState("33333333-3333-4333-8333-333333333336");
  const [foods, setFoods] = useState<Food[]>(FALLBACK_FOODS);
  const [orders, setOrders] = useState<Order[]>(FALLBACK_ORDERS);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shiftName, setShiftName] = useState("Evening shift");

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch(`${API_URL}/api/shops?ownerId=${encodeURIComponent(userId)}`).then((r) => r.json()).catch(() => ({})),
      fetch(`${API_URL}/api/foods`).then((r) => r.json()).catch(() => ({})),
      fetch(`${API_URL}/api/seller/${encodeURIComponent(userId)}/orders`).then((r) => r.json()).catch(() => ({})),
    ]).then(([shopResult, foodResult, orderResult]) => {
      if (!active) return;
      if (shopResult?.items && shopResult.items.length > 0) {
        setShops(shopResult.items);
        setShopId(shopResult.items[0].id);
      }
      if (foodResult?.items && foodResult.items.length > 0) {
        setFoods(foodResult.items);
      }
      if (orderResult?.items && orderResult.items.length > 0) {
        setOrders(orderResult.items);
      }
    }).catch(() => {});
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

function discount(food: Food) {
  const original = Number(food.original_price);
  return original > 0 ? Math.max(0, Math.round((1 - Number(food.current_price) / original) * 100)) : 0;
}

function Metric({
  label,
  value,
  hint,
  orange = false,
}: {
  label: string;
  value: string;
  hint: string;
  orange?: boolean;
}) {
  return (
    <View style={s.metric}>
      <Text style={s.metricLabel}>{label}</Text>
      <View style={s.metricBottom}>
        <Text numberOfLines={1} style={[s.metricValue, orange && s.orange]}>
          {value}
        </Text>
        <Text style={s.hint}>{hint}</Text>
      </View>
    </View>
  );
}

function Section({
  title,
  onViewAll,
  children,
}: {
  title: string;
  onViewAll: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{title}</Text>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text style={s.viewAll}>View all</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return <Text style={s.empty}>{text}</Text>;
}

const c = {
  green: "#176c4a",
  dark: "#183c2b",
  ink: "#183c2b",
  white: "#ffffff",
  muted: "#738176",
  pale: "#e8f3ea",
  line: "#e3ebe4",
  orange: "#ed7200",
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8faf8" },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: c.white,
    borderBottomWidth: 1,
    borderColor: c.line,
    zIndex: 2,
  },
  storeHeading: { flex: 1, gap: 3 },
  titleTap: { flexDirection: "row", alignItems: "center", gap: 6 },
  storeName: { color: c.ink, fontSize: 18, fontWeight: "800", maxWidth: 220 },
  shiftLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  shiftText: { color: c.muted, fontSize: 13, fontWeight: "500" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#f3f6f3", alignItems: "center", justifyContent: "center" },
  more: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#f3f6f3", alignItems: "center", justifyContent: "center" },
  popover: {
    position: "absolute",
    top: 54,
    right: 16,
    width: 170,
    backgroundColor: c.white,
    borderRadius: 14,
    padding: 8,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 10,
    borderWidth: 1,
    borderColor: c.line,
  },
  popoverRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 10 },
  popoverText: { color: c.ink, fontSize: 13, fontWeight: "500" },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  shiftCard: { borderRadius: 20, backgroundColor: c.green, padding: 18, gap: 14 },
  countdownRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  closeTitle: { color: c.white, fontSize: 16, fontWeight: "800" },
  closeSub: { color: "#d6ecdd", fontSize: 13, marginTop: 3 },
  timer: { color: c.white, fontSize: 16, fontWeight: "800" },
  actionsRow: { flexDirection: "row", gap: 12 },
  postButton: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#105c3d",
  },
  scanButton: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: c.white,
  },
  actionLight: { color: c.white, fontSize: 14, fontWeight: "700" },
  actionDark: { color: c.ink, fontSize: 14, fontWeight: "700" },
  menuManager: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: c.white,
    borderRadius: 20,
  },
  menuManagerText: { color: c.ink, fontSize: 13, fontWeight: "700" },
  shopPills: { gap: 8 },
  shopPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: c.line, backgroundColor: c.white },
  shopPillActive: { backgroundColor: c.pale, borderColor: c.green },
  shopPillText: { color: c.ink, fontSize: 13 },
  shopPillTextActive: { color: c.green, fontWeight: "700" },
  metricsRow: { flexDirection: "row", gap: 12 },
  metric: {
    flex: 1,
    minHeight: 74,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  metricLabel: { color: c.muted, fontSize: 12, fontWeight: "600" },
  metricBottom: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 4 },
  metricValue: { color: c.orange, fontSize: 20, fontWeight: "800" },
  orange: { color: c.orange },
  hint: { color: "#8b958d", fontSize: 11, fontWeight: "600" },
  section: { gap: 10, marginTop: 4 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: c.ink, fontSize: 16, fontWeight: "800" },
  viewAll: { color: c.green, fontSize: 13, fontWeight: "600" },
  listCard: { borderRadius: 16, borderWidth: 1, borderColor: c.line, backgroundColor: c.white, paddingHorizontal: 14, paddingVertical: 4 },
  foodRow: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  orderRow: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderColor: "#eef2ee" },
  rowMain: { flex: 1, gap: 3 },
  itemTitle: { color: c.ink, fontSize: 14, fontWeight: "700" },
  discount: { color: c.orange, fontSize: 12, fontWeight: "700" },
  itemSub: { color: c.muted, fontSize: 12 },
  pricePill: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: c.pale },
  priceText: { color: c.green, fontSize: 12, fontWeight: "700" },
  wasPrice: { color: c.muted, fontWeight: "400", textDecorationLine: "line-through" },
  depositPill: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: c.pale },
  depositText: { color: c.green, fontSize: 12, fontWeight: "700" },
  cancelList: { borderRadius: 16, borderWidth: 1, borderColor: c.line, backgroundColor: c.white, paddingHorizontal: 14, paddingVertical: 4 },
  cancelRow: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  empty: { paddingVertical: 18, color: c.muted, fontSize: 13, textAlign: "center" },
});
