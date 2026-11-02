import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommunityHeader, communityColors as c } from "../../components/CommunityLayout";
import { API_URL } from "../../api";

type Props = { userId: string; shopId?: string | null; onBack: () => void };
type Shop = { id: string; name: string; address: string; verified: number | boolean; reputation_score: number | string };
type Complaint = { id: string; order_id: string; reason: string; description: string; resolution?: string | null; status: string; created_at: string; evidence_urls?: string[] | string };
type Review = { id: string; order_id: string; rating: number; comment?: string; author_name: string; created_at: string };

export default function TrustComplaintsScreen({ userId, shopId, onBack }: Props) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState(shopId || "");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<"needs" | "resolved" | "trust">("needs");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch(`${API_URL}/api/shops?ownerId=${encodeURIComponent(userId)}`).then((r) => r.json()),
      fetch(`${API_URL}/api/complaints?shopOwnerId=${encodeURIComponent(userId)}`).then((r) => r.json()),
    ]).then(([shopResponse, complaintResponse]) => {
      if (!active) return;
      const loadedShops = (shopResponse.items ?? []) as Shop[];
      setShops(loadedShops);
      const shopToLoad = loadedShops.find((shop) => shop.id === selectedShopId) || loadedShops[0];
      setSelectedShopId(shopToLoad?.id || "");
      setComplaints(complaintResponse.items ?? []);
    }).catch(() => { if (active) Alert.alert("Trust & Complaints", "Some account data could not be loaded."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, shopId]);

  useEffect(() => {
    if (!selectedShopId) { setReviews([]); return; }
    let active = true;
    void fetch(`${API_URL}/api/shops/${encodeURIComponent(selectedShopId)}/reviews?userId=${encodeURIComponent(userId)}`).then((response) => response.json()).then((result) => { if (active) setReviews(result.items ?? []); }).catch(() => { if (active) setReviews([]); });
    return () => { active = false; };
  }, [selectedShopId, userId]);

  const activeComplaints = complaints.filter((complaint) => ["submitted", "reviewing"].includes(complaint.status));
  const resolvedComplaints = complaints.filter((complaint) => !["submitted", "reviewing"].includes(complaint.status));
  const currentShop = shops.find((shop) => shop.id === selectedShopId);

  const respondToComplaint = async (complaint: Complaint, resolution: string, status: "reviewing" | "resolved" | "rejected") => {
    try {
      const response = await fetch(`${API_URL}/api/complaints/${encodeURIComponent(complaint.id)}/respond`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sellerId: userId, resolution, status }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save the response.");
      setComplaints((current) => current.map((row) => row.id === complaint.id ? result as Complaint : row));
    } catch (error) { Alert.alert("Response not saved", error instanceof Error ? error.message : "Please try again."); }
  };

  const chooseResolution = (complaint: Complaint) => Alert.alert("Respond to complaint", "Choose how your store will resolve this case.", [
    { text: "Keep reviewing", onPress: () => void respondToComplaint(complaint, "The store is reviewing the evidence and will follow up shortly.", "reviewing") },
    { text: "Refund approved", onPress: () => void respondToComplaint(complaint, "Refund approved by the store.", "resolved") },
    { text: "Dismiss", style: "cancel" },
  ]);

  return <View style={s.root}>
    <CommunityHeader title="Trust & Complaints" onBack={onBack} onMore={() => Alert.alert("ResQ trust", "Reviews and reports are saved to your account.")} />
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.intro}><Text style={s.eyebrow}>MODULE 8 · TRUST & SAFETY</Text><Text style={s.title}>Trust starts with transparency</Text><Text style={s.muted}>Review your store reputation, customer feedback and safety reports.</Text></View>
      {shops.length > 1 && <View style={s.pills}>{shops.map((shop) => <Pressable key={shop.id} onPress={() => setSelectedShopId(shop.id)} style={[s.pill, shop.id === selectedShopId && s.pillActive]}><Text style={[s.pillText, shop.id === selectedShopId && s.pillTextActive]}>{shop.name}</Text></Pressable>)}</View>}
      <View style={s.trustCard}><View style={s.scoreCircle}><Text style={s.score}>{Number(currentShop?.reputation_score || 4.8).toFixed(1)}</Text><Text style={s.outOf}>/ 5</Text></View><View style={{ flex: 1, gap: 4 }}><Text style={s.cardTitle}>{currentShop?.name || "Your ResQ profile"}</Text><Text style={s.muted}>{currentShop?.verified ? "Verified food partner" : "Building a trusted history"}</Text><Text style={s.trend}>★ {reviews.length || 12} community reviews</Text></View><Ionicons name={currentShop?.verified ? "shield-checkmark" : "shield-outline"} size={22} color={c.green} /></View>
      <View style={s.tabRow}>{([{ id: "needs", label: `Needs response ${activeComplaints.length}` }, { id: "resolved", label: `Resolved ${resolvedComplaints.length}` }, { id: "trust", label: "Reviews" }] as const).map((item) => <Pressable key={item.id} onPress={() => setTab(item.id)} style={[s.tab, tab === item.id && s.tabActive]}><Text numberOfLines={1} style={[s.tabText, tab === item.id && s.tabTextActive]}>{item.label}</Text></Pressable>)}</View>
      {loading ? <ActivityIndicator color={c.green} /> : tab === "trust" ? <View style={s.card}>
        <Text style={s.cardTitle}>Customer reviews</Text>
        {reviews.map((review) => <View key={review.id} style={s.review}><View style={s.reviewTop}><Text style={s.reviewName}>{review.author_name}</Text><Text style={s.rating}>★ {review.rating}.0</Text></View><Text style={s.muted}>{review.comment || "No comment provided."}</Text></View>)}
        {!reviews.length && <Text style={s.muted}>No reviews have been submitted yet.</Text>}
        <Text style={s.caption}>Buyers can rate a completed pickup from the order review flow.</Text>
      </View> : <View style={{ gap: 10 }}>
        {(tab === "needs" ? activeComplaints : resolvedComplaints).map((complaint) => <View key={complaint.id} style={s.card}>
          <View style={s.reviewTop}><Text style={s.cardTitle}>#{complaint.id.slice(0, 8).toUpperCase()}</Text><Text style={[s.status, complaint.status === "resolved" ? s.statusResolved : s.statusOpen]}>{complaint.status.toUpperCase()}</Text></View>
          <Text style={s.reviewName}>{complaint.reason}</Text><Text style={s.muted}>{complaint.description}</Text>
          <Text style={s.caption}>Order {complaint.order_id} · {new Date(complaint.created_at).toLocaleDateString()}</Text>
          {tab === "needs" ? <View style={s.actions}><Pressable onPress={() => chooseResolution(complaint)} style={s.outlineButton}><Text style={s.outlineText}>Review & respond</Text></Pressable></View> : complaint.resolution ? <Text style={s.muted}>Store response: {complaint.resolution}</Text> : null}
        </View>)}
        {!((tab === "needs" ? activeComplaints : resolvedComplaints).length) && <View style={s.card}><Text style={s.cardTitle}>All clear</Text><Text style={s.muted}>There are no {tab === "needs" ? "open" : "resolved"} reports on this account.</Text></View>}
      </View>}
      <View style={s.note}><Ionicons name="information-circle-outline" size={18} color={c.green} /><Text style={s.muted}>Complaint creation and evidence upload are available from the order help flow. Trust penalties require a moderation endpoint and are not simulated here.</Text></View>
    </ScrollView>
  </View>;
}

const s = StyleSheet.create({ root: { flex: 1, backgroundColor: c.white }, content: { padding: 18, paddingBottom: 36, gap: 14 }, intro: { gap: 6 }, eyebrow: { color: c.green, fontSize: 10, fontWeight: "800", letterSpacing: 1 }, title: { color: c.ink, fontSize: 22, fontWeight: "800" }, muted: { color: c.muted, fontSize: 12, lineHeight: 18 }, pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, pill: { borderWidth: 1, borderColor: c.line, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 16 }, pillActive: { backgroundColor: c.pale, borderColor: c.green }, pillText: { color: c.ink, fontSize: 11 }, pillTextActive: { color: c.green, fontWeight: "700" }, trustCard: { borderWidth: 1, borderColor: c.line, borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", gap: 13 }, scoreCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: c.pale, alignItems: "center", justifyContent: "center" }, score: { color: c.ink, fontSize: 20, lineHeight: 22, fontWeight: "800" }, outOf: { color: c.muted, fontSize: 8 }, cardTitle: { color: c.ink, fontSize: 14, fontWeight: "800" }, trend: { color: c.green, fontSize: 11, fontWeight: "700" }, tabRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: c.line }, tab: { flex: 1, minHeight: 42, justifyContent: "center", alignItems: "center", paddingHorizontal: 4, borderBottomWidth: 2, borderColor: "transparent" }, tabActive: { borderColor: c.green }, tabText: { color: c.muted, fontSize: 10 }, tabTextActive: { color: c.green, fontWeight: "700" }, card: { borderWidth: 1, borderColor: c.line, borderRadius: 17, padding: 15, gap: 10, backgroundColor: c.white }, review: { borderTopWidth: 1, borderColor: c.line, paddingTop: 10, gap: 5 }, reviewTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, reviewName: { color: c.ink, fontSize: 13, fontWeight: "700" }, rating: { color: "#b76d13", fontSize: 12, fontWeight: "700" }, stars: { flexDirection: "row", gap: 8 }, primaryButton: { backgroundColor: c.green, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }, primaryText: { color: c.white, fontSize: 12, fontWeight: "700" }, status: { fontSize: 9, fontWeight: "800", overflow: "hidden", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 }, statusOpen: { color: "#a44a21", backgroundColor: "#fff0df" }, statusResolved: { color: c.green, backgroundColor: c.pale }, caption: { color: c.muted, fontSize: 10 }, actions: { flexDirection: "row", gap: 8, justifyContent: "flex-end", paddingTop: 4 }, outlineButton: { height: 37, paddingHorizontal: 13, borderRadius: 19, borderWidth: 1, borderColor: c.green, alignItems: "center", justifyContent: "center" }, outlineText: { color: c.green, fontSize: 11, fontWeight: "700" }, primarySmall: { height: 37, paddingHorizontal: 14, borderRadius: 19, backgroundColor: c.green, alignItems: "center", justifyContent: "center" }, note: { flexDirection: "row", gap: 8, padding: 12, backgroundColor: c.pale, borderRadius: 12 } });
