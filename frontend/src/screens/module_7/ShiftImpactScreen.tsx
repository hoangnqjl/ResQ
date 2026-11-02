import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommunityHeader, communityColors as c } from "../../components/CommunityLayout";
import { API_URL } from "../../api";

type Props = { userId: string; onBack: () => void };
type Reservation = { id: string; order_id?: string; shop_id?: string; pickup_qr_token?: string; order_status?: string; total_amount?: string | number; status: string; quantity: number; created_at: string; food_item_id: string; food_name?: string };
type Food = { id: string; name: string; shop_id: string; current_price: number | string; quantity_available: number };
type Shop = { id: string; name: string };
type ShiftClosure = { id: string; revenue: number | string; completed_orders: number; sold_portions: number; gifted_portions: number; leftover_portions: number; closed_at: string };

export default function ShiftImpactScreen({ userId, onBack }: Props) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [closures, setClosures] = useState<ShiftClosure[]>([]);
  const [closing, setClosing] = useState(false);
  const [scanToken, setScanToken] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("");
  const videoContainer = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7 days" | "30 days">("30 days");

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch(`${API_URL}/api/shops?ownerId=${encodeURIComponent(userId)}`).then((r) => r.json()),
      fetch(`${API_URL}/api/seller/${encodeURIComponent(userId)}/orders`).then((r) => r.json()),
      fetch(`${API_URL}/api/foods`).then((r) => r.json()),
    ]).then(([shopResponse, reservationResponse, foodResponse]) => {
      if (!active) return;
      const loadedShops = (shopResponse.items ?? []) as Shop[];
      setShops(loadedShops); setShopId(loadedShops[0]?.id ?? "");
      setReservations(reservationResponse.items ?? []); setFoods(foodResponse.items ?? []);
    }).catch(() => { if (active) Alert.alert("Shift & Impact", "Some report data could not be loaded."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  useEffect(() => {
    if (!shopId) return;
    void fetch(`${API_URL}/api/seller/${encodeURIComponent(userId)}/shifts?shopId=${encodeURIComponent(shopId)}`).then((response) => response.json()).then((result) => setClosures(result.items ?? [])).catch(() => {});
  }, [shopId, userId]);

  const closeShift = async () => {
    if (!shopId || closing) return;
    setClosing(true);
    try {
      const response = await fetch(`${API_URL}/api/seller/${encodeURIComponent(userId)}/shifts/close`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shopId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to close shift.");
      setClosures((current) => [result, ...current]);
      Alert.alert("Shift closed", `Saved report: ${Number(result.completedOrders)} completed orders and ${Number(result.revenue).toLocaleString("vi-VN")}₫ revenue.`);
    } catch (error) { Alert.alert("Unable to close shift", error instanceof Error ? error.message : "Please try again."); }
    finally { setClosing(false); }
  };

  const confirmPickup = async (value = scanToken) => {
    if (!value.trim() || scanning) return;
    setScanning(true);
    try {
      const response = await fetch(`${API_URL}/api/orders/scan`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: value.trim() }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "This pickup code could not be verified.");
      setReservations((current) => current.map((row) => row.order_id === result.orderId ? { ...row, order_status: "completed", status: "picked_up" } : row));
      setScanToken("");
      Alert.alert("Pickup complete", "The order is marked as picked up.");
    } catch (error) { Alert.alert("Pickup code invalid", error instanceof Error ? error.message : "Check the buyer’s code and try again."); }
    finally { setScanning(false); }
  };

  useEffect(() => {
    if (!cameraActive) return;
    if (Platform.OS !== "web" || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof document === "undefined") {
      setCameraMessage("Camera scanning is unavailable here. Enter the buyer’s pickup token below.");
      setCameraActive(false);
      return;
    }
    let stream: MediaStream | null = null;
    let frame = 0;
    let stopped = false;
    void (async () => {
      try {
        const BarcodeDetectorCtor = (window as any).BarcodeDetector;
        if (!BarcodeDetectorCtor) throw new Error("This browser does not support QR scanning. Enter the pickup token manually.");
        const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (stopped) { stream.getTracks().forEach((track) => track.stop()); return; }
        const video = document.createElement("video");
        video.autoplay = true; video.muted = true; video.playsInline = true;
        video.srcObject = stream;
        const container = videoContainer.current as HTMLElement | null;
        if (!container) throw new Error("Camera preview is unavailable.");
        container.replaceChildren(video);
        await video.play();
        const scanFrame = async () => {
          if (stopped) return;
          try {
            const codes = await detector.detect(video);
            const code = codes[0]?.rawValue;
            if (code) {
              stopped = true;
              stream?.getTracks().forEach((track) => track.stop());
              setCameraActive(false);
              setCameraMessage("");
              setScanToken(code);
              void confirmPickup(code);
              return;
            }
          } catch { /* Keep scanning while the buyer positions the QR code. */ }
          frame = requestAnimationFrame(() => { void scanFrame(); });
        };
        frame = requestAnimationFrame(() => { void scanFrame(); });
      } catch (error) {
        setCameraMessage(error instanceof Error ? error.message : "Unable to open the camera.");
        setCameraActive(false);
      }
    })();
    return () => { stopped = true; cancelAnimationFrame(frame); stream?.getTracks().forEach((track) => track.stop()); };
  }, [cameraActive]);

  const storeFoods = useMemo(() => foods.filter((food) => food.shop_id === shopId), [foods, shopId]);
  const orders = reservations.filter((reservation) => reservation.shop_id === shopId);
  const periodStart = Date.now() - (period === "7 days" ? 7 : 30) * 24 * 60 * 60 * 1000;
  const periodOrders = orders.filter((order) => new Date(order.created_at).getTime() >= periodStart);
  const completed = periodOrders.filter((reservation) => reservation.order_status === "completed" || reservation.status === "picked_up");
  const revenue = completed.reduce((total, row) => total + Number(row.total_amount || 0), 0);
  const meals = completed.reduce((total, row) => total + Number(row.quantity || 1), 0);
  const sold = completed.reduce((total, row) => total + Number(row.quantity || 1), 0);
  const gifted = storeFoods.filter((food) => Number(food.current_price) === 0).reduce((sum, food) => sum + Number(food.quantity_available), 0);
  const totalAvailable = storeFoods.reduce((sum, food) => sum + Number(food.quantity_available), 0);

  return <View style={s.root}>
    <CommunityHeader title="Shift & Impact" onBack={onBack} onMore={() => Alert.alert("Reports", "Totals reflect available order and inventory records.")} />
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.intro}><Text style={s.eyebrow}>MODULE 7 · STORE REPORTS</Text><Text style={s.title}>{shops.find((shop) => shop.id === shopId)?.name || "Your store"}</Text><Text style={s.muted}>Rescue volume, recovered revenue and shift close.</Text></View>
      {shops.length > 1 && <View style={s.pills}>{shops.map((shop) => <Pressable key={shop.id} onPress={() => setShopId(shop.id)} style={[s.pill, shop.id === shopId && s.pillActive]}><Text style={[s.pillText, shop.id === shopId && s.pillTextActive]}>{shop.name}</Text></Pressable>)}</View>}
      <View style={s.periodRow}>{(["7 days", "30 days"] as const).map((value) => <Pressable key={value} onPress={() => setPeriod(value)} style={[s.period, period === value && s.periodActive]}><Text style={[s.periodText, period === value && s.periodTextActive]}>{value}</Text></Pressable>)}</View>
      {loading ? <ActivityIndicator color={c.green} /> : <>
        <View style={s.card}><Text style={s.cardTitle}>Silent pickup · Scan buyer code</Text><Text style={s.muted}>Scan the buyer’s QR or enter the pickup token manually.</Text>{Platform.OS === "web" ? <Pressable onPress={() => { setCameraMessage(""); setCameraActive((active) => !active); }} style={s.outlineScanButton}><Ionicons name="scan-outline" size={17} color={c.green} /><Text style={s.scanLink}>{cameraActive ? "Stop camera" : "Open camera scanner"}</Text></Pressable> : null}{cameraActive ? <View ref={videoContainer} style={s.cameraPreview} /> : null}{cameraMessage ? <Text style={s.cameraMessage}>{cameraMessage}</Text> : null}<View style={s.scanRow}><TextInput value={scanToken} onChangeText={setScanToken} autoCapitalize="characters" placeholder="ABC-123 or QR token" style={s.scanInput} /><Pressable disabled={scanning || !scanToken.trim()} onPress={() => void confirmPickup()} style={[s.scanButton, (!scanToken.trim() || scanning) && { opacity: 0.5 }]}><Text style={s.buttonText}>{scanning ? "Checking…" : "Confirm"}</Text></Pressable></View></View>
        <View style={s.metrics}>
          <Metric icon="fast-food-outline" value={String(meals)} label="Meals rescued" trend={`${completed.length} completed orders`} />
          <Metric icon="leaf-outline" value={`${(meals * 2.5).toFixed(1)} kg`} label="Waste prevented · est." trend="2.5 kg per meal" />
          <Metric icon="cloud-outline" value={`${(meals * 6.4).toFixed(1)} kg`} label="CO₂ emissions cut · est." trend="6.4 kg per meal" />
          <Metric icon="cash-outline" value={`${revenue.toLocaleString("vi-VN")}₫`} label="Recovered revenue" trend={`${completed.length} orders`} />
        </View>
        <View style={s.card}><Text style={s.cardTitle}>Daily rescue volume</Text><View style={s.chart}>{[34, 58, 44, 72, 55, 84, 63].map((height, index) => <View key={index} style={s.barColumn}><View style={[s.bar, { height }]} /><Text style={s.chartLabel}>{["M", "T", "W", "T", "F", "S", "S"][index]}</Text></View>)}</View><Text style={s.caption}>Visual summary · detailed daily history is not stored yet.</Text></View>
        <View style={s.card}><Text style={s.cardTitle}>Shift summary</Text><Row label="Completed pickups" value={String(completed.length)} /><Row label="Completed order revenue" value={`${revenue.toLocaleString("vi-VN")}₫`} /><Row label="Sold portions" value={String(sold)} /><Row label="Free portions available" value={String(gifted)} /><Row label="Paid listings still available" value={String(totalAvailable - gifted)} /><Pressable disabled={closing || !shopId} onPress={() => void closeShift()} style={[s.button, closing && { opacity: 0.55 }]}><Text style={s.buttonText}>{closing ? "Closing…" : "Close shift"}</Text></Pressable></View>
        <View style={s.card}><Text style={s.cardTitle}>Transaction history · {period}</Text>{periodOrders.slice(0, 8).map((order) => <View key={order.order_id || order.id} style={s.historyRow}><View style={{ flex: 1 }}><Text style={s.historyTitle}>{order.food_name || "ResQ meal"}</Text><Text style={s.caption}>{new Date(order.created_at).toLocaleString()} · {order.quantity} portion{order.quantity === 1 ? "" : "s"}</Text></View><View style={{ alignItems: "flex-end", gap: 3 }}><Text style={s.rowValue}>{Number(order.total_amount || 0).toLocaleString("vi-VN")}₫</Text><Text style={s.caption}>{(order.order_status || "pending").replaceAll("_", " ")}</Text></View></View>)}{!periodOrders.length && <Text style={s.caption}>No orders have been recorded for this period.</Text>}</View>
        <View style={s.card}><Text style={s.cardTitle}>Previous shift closures</Text>{closures.slice(0, 4).map((closure) => <Row key={closure.id} label={new Date(closure.closed_at).toLocaleString()} value={`${Number(closure.completed_orders)} orders`} />)}{!closures.length && <Text style={s.caption}>No shift reports saved yet.</Text>}</View>
        <View style={s.impact}><Ionicons name="leaf" size={23} color={c.green} /><View style={{ flex: 1, gap: 4 }}><Text style={s.cardTitle}>Equivalent green impact</Text><Text style={s.muted}>Your rescued meals prevented food waste and saved about 45 kg of CO₂ this month.</Text></View></View>
      </>}
    </ScrollView>
  </View>;
}

function Metric({ icon, value, label, trend }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string; trend: string }) { return <View style={s.metric}><View style={s.metricIcon}><Ionicons name={icon} size={17} color={c.green} /></View><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label}</Text><Text style={s.trend}>{trend}</Text></View>; }
function Row({ label, value }: { label: string; value: string }) { return <View style={s.row}><Text style={s.muted}>{label}</Text><Text style={s.rowValue}>{value}</Text></View>; }

const s = StyleSheet.create({ root: { flex: 1, backgroundColor: c.white }, content: { padding: 18, paddingBottom: 36, gap: 14 }, intro: { gap: 6 }, eyebrow: { color: c.green, fontSize: 10, fontWeight: "800", letterSpacing: 1 }, title: { color: c.ink, fontSize: 23, fontWeight: "800" }, muted: { color: c.muted, fontSize: 12, lineHeight: 18 }, pills: { flexDirection: "row", gap: 8 }, pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 17, borderWidth: 1, borderColor: c.line }, pillActive: { backgroundColor: c.pale, borderColor: c.green }, pillText: { color: c.ink, fontSize: 11 }, pillTextActive: { color: c.green, fontWeight: "700" }, periodRow: { flexDirection: "row", backgroundColor: "#f4f7f3", borderRadius: 12, padding: 3 }, period: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 9 }, periodActive: { backgroundColor: c.white }, periodText: { color: c.muted, fontSize: 11 }, periodTextActive: { color: c.green, fontWeight: "700" }, metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, metric: { width: "48%", flexGrow: 1, minHeight: 126, borderWidth: 1, borderColor: c.line, borderRadius: 16, padding: 12, gap: 5 }, metricIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: c.pale, alignItems: "center", justifyContent: "center" }, metricValue: { color: c.ink, fontSize: 20, fontWeight: "800" }, metricLabel: { color: c.muted, fontSize: 11 }, trend: { color: c.green, fontSize: 10, fontWeight: "700" }, card: { borderWidth: 1, borderColor: c.line, borderRadius: 17, padding: 15, gap: 12 }, cardTitle: { color: c.ink, fontSize: 14, fontWeight: "800" }, chart: { height: 115, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", paddingTop: 15 }, barColumn: { alignItems: "center", justifyContent: "flex-end", gap: 5 }, bar: { width: 22, borderRadius: 7, backgroundColor: "#8dc7a2" }, chartLabel: { color: c.muted, fontSize: 9 }, caption: { color: c.muted, fontSize: 10 }, row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderColor: c.line }, rowValue: { color: c.ink, fontSize: 12, fontWeight: "700" }, button: { height: 45, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: c.green, marginTop: 3 }, buttonText: { color: c.white, fontSize: 13, fontWeight: "700" }, impact: { flexDirection: "row", gap: 12, padding: 16, borderRadius: 17, backgroundColor: c.pale, alignItems: "flex-start" }, scanRow: { flexDirection: "row", gap: 8 }, scanInput: { flex: 1, height: 42, borderWidth: 1, borderColor: c.line, borderRadius: 11, paddingHorizontal: 12, color: c.ink, fontSize: 12 }, scanButton: { height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, backgroundColor: c.green }, historyRow: { flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderColor: c.line, paddingVertical: 8 }, historyTitle: { color: c.ink, fontSize: 12, fontWeight: "700" }, outlineScanButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 40, borderWidth: 1, borderColor: c.green, borderRadius: 20 }, scanLink: { color: c.green, fontSize: 12, fontWeight: "700" }, cameraPreview: { width: "100%", height: 220, overflow: "hidden", borderRadius: 14, backgroundColor: "#10251a" }, cameraMessage: { color: "#a44a21", backgroundColor: "#fff0df", borderRadius: 9, padding: 9, fontSize: 11 } });
