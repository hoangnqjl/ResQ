import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommunityHeader, communityColors as c } from "../../components/CommunityLayout";
import { getCommunityFoods, type CommunityFood } from "../../services/communityApi";
import { API_URL } from "../../api";

type Props = { userId: string; onBack: () => void };
const presets = ["Combo sushi", "Bánh mì", "Cơm gà", "Salad rau củ"];
type PricingTier = { minutesBeforeClose: number; discountPercent: number };

export default function SellerStudioScreen({ userId, onBack }: Props) {
  const [items, setItems] = useState<CommunityFood[]>([]);
  const [shops, setShops] = useState<{ id: string; name: string; address: string }[]>([]);
  const [shopId, setShopId] = useState("");
  const [name, setName] = useState(presets[0]);
  const [quantity, setQuantity] = useState("10");
  const [originalPrice, setOriginalPrice] = useState("55000");
  const [price, setPrice] = useState("27500");
  const [discountEnabled, setDiscountEnabled] = useState(true);
  const [cutoffMinutes, setCutoffMinutes] = useState(30);
  const [tiers, setTiers] = useState<PricingTier[]>([{ minutesBeforeClose: 120, discountPercent: 20 }, { minutesBeforeClose: 60, discountPercent: 40 }, { minutesBeforeClose: 30, discountPercent: 70 }]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [foodRows, shopResponse] = await Promise.all([
        getCommunityFoods(),
        fetch(`${API_URL}/api/shops?ownerId=${encodeURIComponent(userId)}`).then(async (response) => {
          if (!response.ok) throw new Error("Unable to load seller stores.");
          return response.json() as Promise<{ items: { id: string; name: string; address: string }[] }>;
        }),
      ]);
      setItems(foodRows);
      setShops(shopResponse.items ?? []);
      setShopId((current) => current || shopResponse.items?.[0]?.id || "");
    } catch (error) {
      Alert.alert("Seller studio", error instanceof Error ? error.message : "Unable to load your seller data.");
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [userId]);

  useEffect(() => {
    if (!shopId) return;
    void fetch(`${API_URL}/api/seller/${encodeURIComponent(userId)}/pricing?shopId=${encodeURIComponent(shopId)}`).then((response) => response.json()).then((result) => {
      setDiscountEnabled(Boolean(result.enabled));
      setCutoffMinutes(Number(result.cutoffMinutes) || 30);
      if (Array.isArray(result.tiers)) setTiers(result.tiers);
    }).catch(() => {});
  }, [shopId, userId]);

  const selectedShop = shops.find((shop) => shop.id === shopId);
  const activeItems = useMemo(() => items.filter((item) => item.shop_id === shopId), [items, shopId]);
  const savePost = async () => {
    if (!shopId || !name.trim() || Number(quantity) < 1 || Number(price) < 0) {
      Alert.alert("Missing information", "Choose your store and enter a food name, quantity, and valid price."); return;
    }
    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/api/foods`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sellerId: userId, shopId, name: name.trim(), description: "Fresh surplus food available for pickup today.", originalPrice: Number(originalPrice), price: Number(price), quantity: Number(quantity) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to publish this listing.");
      Alert.alert("Post published", `${name} is now visible in Explore and Maps.`);
      await load();
    } catch (error) { Alert.alert("Unable to publish", error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  };

  const savePricing = async () => {
    if (!shopId) return;
    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/api/seller/${encodeURIComponent(userId)}/pricing`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shopId, enabled: discountEnabled, tiers, cutoffMinutes }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save pricing rules.");
      Alert.alert("Pricing saved", "Dynamic pricing tiers are saved for this store.");
    } catch (error) { Alert.alert("Unable to save", error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  };

  const applyEmergencyGift = async (food: CommunityFood) => {
    try {
      const response = await fetch(`${API_URL}/api/foods/${encodeURIComponent(food.id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sellerId: userId, currentPrice: 0 }) });
      if (!response.ok) throw new Error("This listing cannot be changed yet.");
      Alert.alert("Emergency giveaway", `${food.name} is now free for nearby buyers.`);
      await load();
    } catch (error) { Alert.alert("Unable to update listing", error instanceof Error ? error.message : "Please try again."); }
  };

  return <View style={s.root}>
    <CommunityHeader title="Seller Studio" onBack={onBack} onMore={() => Alert.alert("Seller Studio", "Quick post · Dynamic pricing · Emergency giveaway")} />
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={s.intro}><Text style={s.eyebrow}>MODULE 6 · SELLER TOOLS</Text><Text style={s.title}>Rescue today’s surplus</Text><Text style={s.muted}>Create a pickup post in seconds and make every extra meal count.</Text></View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Create a quick post</Text>
        <Text style={s.label}>Store</Text>
        {shops.length ? <View style={s.pills}>{shops.map((shop) => <Pressable key={shop.id} onPress={() => setShopId(shop.id)} style={[s.pill, shopId === shop.id && s.pillActive]}><Text style={[s.pillText, shopId === shop.id && s.pillTextActive]}>{shop.name}</Text></Pressable>)}</View> : <Text style={s.muted}>No store profile found. Finish seller onboarding to publish food.</Text>}
        <Text style={s.label}>Popular surplus item</Text>
        <View style={s.pills}>{presets.map((item) => <Pressable key={item} onPress={() => setName(item)} style={[s.pill, name === item && s.pillActive]}><Text style={[s.pillText, name === item && s.pillTextActive]}>{item}</Text></Pressable>)}</View>
        <Text style={s.label}>Post title</Text><TextInput value={name} onChangeText={setName} placeholder="Food name" style={s.input} />
        <View style={s.row}>
          <View style={s.flex}><Text style={s.label}>Quantity</Text><TextInput value={quantity} onChangeText={setQuantity} keyboardType="number-pad" style={s.input} /></View>
          <View style={s.flex}><Text style={s.label}>Original price (₫)</Text><TextInput value={originalPrice} onChangeText={setOriginalPrice} keyboardType="number-pad" style={s.input} /></View>
        </View>
        <View style={s.row}>
          <View style={s.flex}><Text style={s.label}>Rescue price (₫)</Text><TextInput value={price} onChangeText={setPrice} keyboardType="number-pad" style={s.input} /></View>
          <Pressable onPress={() => { setDiscountEnabled((value) => !value); if (!discountEnabled) setPrice(String(Math.floor(Number(originalPrice) * 0.5))); }} style={[s.toggle, discountEnabled && s.toggleOn]}><Ionicons name={discountEnabled ? "checkmark-circle" : "ellipse-outline"} size={18} color={discountEnabled ? c.green : c.muted} /><Text style={s.pillText}>{discountEnabled ? "50% rescue" : "Set discount"}</Text></Pressable>
        </View>
        <View style={s.notice}><Ionicons name="time-outline" size={18} color={c.green} /><Text style={s.muted}>Pickup today · {selectedShop?.address || "Store counter"}</Text></View>
        <Pressable disabled={busy || !shops.length} onPress={() => void savePost()} style={[s.primaryButton, (busy || !shops.length) && s.disabled]}>{busy ? <ActivityIndicator color={c.white} /> : <Text style={s.primaryText}>Publish post</Text>}</Pressable>
      </View>
      <View style={s.card}>
        <View style={s.rowBetween}><Text style={s.cardTitle}>Dynamic pricing</Text><Text style={s.tag}>AUTO</Text></View>
        <Pressable onPress={() => setDiscountEnabled((value) => !value)} style={s.rowBetween}><Text style={s.muted}>Gradual discounts near store closing</Text><Ionicons name={discountEnabled ? "toggle" : "toggle-outline"} size={29} color={discountEnabled ? c.green : c.muted} /></Pressable>
        <View style={s.rowBetween}><Text style={s.muted}>Stop pickup registrations before close</Text><View style={s.cutoffChoices}>{([15, 30] as const).map((minutes) => <Pressable key={minutes} onPress={() => setCutoffMinutes(minutes)} style={[s.cutoffChoice, cutoffMinutes === minutes && s.cutoffChoiceActive]}><Text style={[s.pillText, cutoffMinutes === minutes && s.pillTextActive]}>{minutes}m</Text></Pressable>)}</View></View>
        {tiers.map((tier, index) => <View key={`${tier.minutesBeforeClose}-${index}`} style={s.tier}><Text style={s.pillText}>{tier.minutesBeforeClose >= 60 ? `${tier.minutesBeforeClose / 60} hour${tier.minutesBeforeClose > 60 ? "s" : ""} before close` : `${tier.minutesBeforeClose} minutes before close`}</Text><Pressable onPress={() => setTiers((current) => current.map((entry, tierIndex) => tierIndex === index ? { ...entry, discountPercent: entry.discountPercent >= 90 ? 0 : entry.discountPercent + 10 } : entry))}><Text style={s.tierDiscount}>{tier.discountPercent}% off　›</Text></Pressable></View>)}
        <Text style={s.caption}>Pickup registration closes {cutoffMinutes} minutes before the listing’s pickup end time. Discount tiers are saved as rules; automatic repricing is not yet scheduled.</Text>
        <Pressable disabled={busy} onPress={() => void savePricing()} style={s.outlineAction}><Text style={s.outlineActionText}>Save pricing tiers</Text></Pressable>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Active listings · {activeItems.length}</Text>
        {loading ? <ActivityIndicator color={c.green} /> : activeItems.slice(0, 8).map((item) => <View key={item.id} style={s.listing}>
          <View style={s.flex}><Text style={s.listingName}>{item.name}</Text><Text style={s.muted}>{item.quantity_available} portions · {Number(item.current_price).toLocaleString("vi-VN")}₫</Text></View>
          {Number(item.current_price) > 0 ? <Pressable onPress={() => void applyEmergencyGift(item)} style={s.giftButton}><Text style={s.giftText}>Gift 0₫</Text></Pressable> : <Text style={s.tag}>FREE</Text>}
        </View>)}
        {!loading && !activeItems.length && <Text style={s.muted}>No active listings for this store yet.</Text>}
      </View>
    </ScrollView>
  </View>;
}

const s = StyleSheet.create({ root: { flex: 1, backgroundColor: c.white }, content: { padding: 18, paddingBottom: 36, gap: 14 }, intro: { gap: 6, marginBottom: 3 }, eyebrow: { color: c.green, fontSize: 10, fontWeight: "800", letterSpacing: 1 }, title: { color: c.ink, fontSize: 23, fontWeight: "800" }, muted: { color: c.muted, fontSize: 12, lineHeight: 18 }, card: { borderWidth: 1, borderColor: c.line, borderRadius: 18, backgroundColor: c.white, padding: 16, gap: 11 }, cardTitle: { color: c.ink, fontSize: 15, fontWeight: "800" }, label: { color: c.ink, fontSize: 11, fontWeight: "700", marginTop: 2 }, pills: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, pill: { borderWidth: 1, borderColor: c.line, borderRadius: 16, paddingHorizontal: 11, paddingVertical: 7 }, pillActive: { borderColor: c.green, backgroundColor: c.pale }, pillText: { color: c.ink, fontSize: 11 }, pillTextActive: { color: c.green, fontWeight: "700" }, input: { borderWidth: 1, borderColor: c.line, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: c.ink, backgroundColor: "#fbfcfa" }, row: { flexDirection: "row", gap: 10, alignItems: "flex-end" }, rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, flex: { flex: 1 }, toggle: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 11, paddingHorizontal: 8, borderWidth: 1, borderColor: c.line, borderRadius: 12 }, toggleOn: { backgroundColor: c.pale }, notice: { flexDirection: "row", alignItems: "center", gap: 8, padding: 11, backgroundColor: "#f4f8f3", borderRadius: 12 }, primaryButton: { height: 46, backgroundColor: c.green, borderRadius: 23, alignItems: "center", justifyContent: "center", marginTop: 2 }, primaryText: { color: c.white, fontSize: 13, fontWeight: "700" }, disabled: { opacity: 0.45 }, tier: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1, borderColor: c.line }, tierDiscount: { color: c.green, fontSize: 12, fontWeight: "700" }, caption: { color: c.muted, fontSize: 10 }, tag: { color: c.green, backgroundColor: c.pale, fontSize: 10, fontWeight: "800", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, overflow: "hidden" }, listing: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderColor: c.line }, listingName: { color: c.ink, fontSize: 13, fontWeight: "700" }, giftButton: { borderWidth: 1, borderColor: c.green, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14 }, giftText: { color: c.green, fontSize: 11, fontWeight: "700" }, outlineAction: { height: 42, borderRadius: 21, borderColor: c.green, borderWidth: 1, alignItems: "center", justifyContent: "center" }, outlineActionText: { color: c.green, fontSize: 12, fontWeight: "700" }, cutoffChoices: { flexDirection: "row", gap: 6 }, cutoffChoice: { borderWidth: 1, borderColor: c.line, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 }, cutoffChoiceActive: { borderColor: c.green, backgroundColor: c.pale } });
