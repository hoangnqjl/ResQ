import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../api";
import { colors } from "../theme";

export type Food = {
  id: string; name: string; description?: string; image_url?: string;
  original_price: number | string; current_price: number | string; quantity_available: number;
  shop_id: string; shop_name: string; address: string; verified: number | boolean;
  reputation_score?: number | string; storage_instructions?: string;
};
type Props = {
  userId: string; userName: string; activeTab: string; onOpenMenu: () => void; onOpenAlerts: () => void;
  onTabChange: (tab: string) => void; onOpenFood: (food: Food) => void;
};

const tabs = [
  ["Home", "home-outline"], ["Explore", "search-outline"], ["Maps", "map-outline"], ["Saved", "bookmark-outline"], ["Profile", "person-outline"],
] as const;
const filters = ["Near me", "Under 30k", "Top rated", "Ready to eat"];
const money = (value: string | number) => `${Number(value).toLocaleString("vi-VN")}₫`;

export default function HomeScreen({ userId, userName, activeTab, onOpenMenu, onOpenAlerts, onTabChange, onOpenFood }: Props) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Near me");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/foods`).then(async (response) => {
        if (!response.ok) throw new Error("Could not load food from the database.");
        return response.json();
      }),
      fetch(`${API_URL}/api/favorites?userId=${encodeURIComponent(userId)}`).then((response) => response.ok ? response.json() : { items: [] }),
    ]).then(([foodResult, savedResult]) => {
      if (!mounted) return;
      setFoods(foodResult.items ?? []);
      setFavorites(savedResult.items ?? []);
      setError("");
    }).catch(() => { if (mounted) setError("Can't reach the ResQ server. Check that the API and MySQL are running."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [userId, refreshKey]);

  const filtered = useMemo(() => foods.filter((food) => {
    if (activeTab === "Saved" && !favorites.includes(food.id)) return false;
    if (query && !`${food.name} ${food.shop_name} ${food.description ?? ""}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "Under 30k" && Number(food.current_price) > 30000) return false;
    if (filter === "Top rated" && Number(food.reputation_score ?? 0) < 4.5) return false;
    if (filter === "Ready to eat" && /cook|nấu|hâm/i.test(food.storage_instructions ?? "")) return false;
    return true;
  }), [foods, favorites, activeTab, query, filter]);
  const featured = filtered[0];
  const title = activeTab === "Saved" ? "Your saved meals" : activeTab === "Maps" ? "Food near you" : activeTab === "Profile" ? "Your ResQ profile" : activeTab === "Home" ? "Good food. Less waste." : "Explore nearby food";

  const MealCard = ({ food }: { food: Food }) => <Pressable onPress={() => onOpenFood(food)} style={s.mealCard}>
    <View style={s.mealPhotoWrap}>{food.image_url ? <Image source={{ uri: food.image_url }} resizeMode="cover" style={s.mealPhoto} /> : <View style={s.photoFallback}><Text style={s.fallbackEmoji}>🥗</Text></View>}<Text style={s.timeBadge}>Pickup today</Text></View>
    <Text numberOfLines={1} style={s.mealTitle}>{food.name}</Text>
    <View style={s.priceRow}><Text style={s.mealPrice}>{money(food.current_price)}</Text><Text style={s.rating}>★ {Number(food.reputation_score ?? 0).toFixed(1)}</Text></View>
    <Text numberOfLines={1} style={s.mealMeta}>{food.shop_name} · {food.quantity_available} left</Text>
    <Text numberOfLines={1} style={s.mealMeta}>{food.address}</Text>
  </Pressable>;

  return <View style={s.root}>
    <View style={s.topBar}>
      <Pressable onPress={onOpenMenu} style={s.iconButton} accessibilityLabel="Open menu"><Ionicons name="menu-outline" size={19} color={colors.primary} /></Pressable>
      <Text style={s.logo}>ResQ</Text>
      <Pressable onPress={onOpenAlerts} style={s.iconButton} accessibilityLabel="Notifications"><Ionicons name="notifications-outline" size={17} color={colors.primary} /></Pressable>
    </View>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      {activeTab === "Profile" ? <View style={s.profilePanel}><View style={s.profileAvatar}><Text style={s.profileInitial}>{(userName || "R").slice(0, 1).toUpperCase()}</Text></View><Text style={s.pageTitle}>{userName || "ResQ member"}</Text><Text style={s.subtitle}>Your buyer profile and food preferences</Text><Pressable onPress={() => onTabChange("Explore")} style={s.primaryButton}><Text style={s.primaryText}>Explore meals</Text></Pressable></View> : <>
        <Text style={s.pageTitle}>{title}</Text>
        <Text style={s.subtitle}>{featured?.address || "Choose a pickup area to find meals nearby"}</Text>
        <View style={s.searchRow}>
          <View style={s.searchBox}><Text style={s.searchIcon}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="Search food or restaurants" placeholderTextColor="#819087" style={s.searchInput} returnKeyType="search" /></View>
          <Pressable onPress={() => setFiltersOpen(true)} style={s.filterButton}><Ionicons name="options-outline" size={18} color={colors.primary} /></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterList}>
          {filters.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[s.filterChip, filter === item && s.filterChipActive]}><Text style={[s.filterText, filter === item && s.filterTextActive]}>{item}</Text></Pressable>)}
        </ScrollView>
        <View style={s.sectionHeading}><Text style={s.sectionTitle}>Explore food near you</Text><Pressable onPress={() => onTabChange("Explore")}><Text style={s.seeAll}>See all</Text></Pressable></View>
        {loading ? <View style={s.loading}><ActivityIndicator color={colors.primary} /><Text style={s.mealMeta}>Loading live listings…</Text></View> : error ? <View style={s.emptyCard}><Text style={s.emptyTitle}>Server unavailable</Text><Text style={s.emptyText}>{error}</Text><Pressable onPress={() => setRefreshKey((key) => key + 1)} style={s.retry}><Text style={s.retryText}>Try again</Text></Pressable></View> : featured ? <Pressable onPress={() => onOpenFood(featured)} style={s.featuredCard}>
          {featured.image_url ? <Image source={{ uri: featured.image_url }} style={s.featuredImage} resizeMode="cover" /> : <View style={[s.featuredImage, s.photoFallback]}><Text style={s.fallbackEmoji}>🥗</Text></View>}
          <View style={s.featuredTag}><Text style={s.featuredKicker}>FROM THE DATABASE</Text><Text style={s.featuredName}>{featured.name}</Text><Text style={s.featuredPrice}>{money(featured.current_price)} · {featured.quantity_available} portions</Text></View>
        </Pressable> : <View style={s.emptyCard}><Text style={s.emptyTitle}>{activeTab === "Saved" ? "No saved meals yet" : "No meals available right now"}</Text><Text style={s.emptyText}>This list comes from MySQL. New store listings will appear here as soon as they are published.</Text></View>}
        <View style={s.dots}><View style={[s.dot, s.dotActive]} /><View style={s.dot} /><View style={s.dot} /></View>
        <View style={s.sectionHeading}><Text style={s.sectionTitle}>{activeTab === "Saved" ? "Saved meals" : "Food flash sales"}</Text><Pressable onPress={() => setRefreshKey((key) => key + 1)}><Text style={s.seeAll}>See all</Text></Pressable></View>
        {loading || filtered.length < 2 ? null : <View style={s.grid}>{filtered.slice(1, 12).map((food) => <MealCard key={food.id} food={food} />)}</View>}
      </>}
    </ScrollView>
    <View style={s.tabBar}>{tabs.map(([label, icon]) => <Pressable key={label} onPress={() => onTabChange(label)} style={s.tab} accessibilityRole="tab" accessibilityState={{ selected: activeTab === label }}><View style={[s.tabIcon, activeTab === label && s.tabIconActive]}><Ionicons name={icon} size={15} color={activeTab === label ? colors.primary : "#456051"} /></View><Text style={[s.tabLabel, activeTab === label && s.tabLabelActive]}>{label}</Text></Pressable>)}</View>
    <Modal visible={filtersOpen} transparent animationType="slide" onRequestClose={() => setFiltersOpen(false)}><View style={s.modalScrim}><Pressable style={StyleSheet.absoluteFill} onPress={() => setFiltersOpen(false)} /><View style={s.filterSheet}><View style={s.sheetHandle} /><Text style={s.sheetTitle}>Filter meals</Text><Text style={s.sheetCaption}>Choose what works for you</Text><View style={s.sheetFilters}>{filters.map((item) => <Pressable key={item} onPress={() => { setFilter(item); setFiltersOpen(false); }} style={[s.filterChip, filter === item && s.filterChipActive]}><Text style={[s.filterText, filter === item && s.filterTextActive]}>{item}</Text></Pressable>)}</View><Pressable onPress={() => { setFilter("Near me"); setFiltersOpen(false); }} style={s.clearButton}><Text style={s.clearText}>Clear filters</Text></Pressable></View></View></Modal>
  </View>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white }, topBar: { height: 45, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 17 }, iconButton: { height: 34, width: 34, borderRadius: 17, borderColor: colors.line, borderWidth: 1, alignItems: "center", justifyContent: "center" }, menuGlyph: { color: colors.primary, fontSize: 16 }, bell: { color: colors.primary, fontSize: 17 }, logo: { color: colors.ink, fontSize: 14, fontWeight: "900" }, content: { paddingHorizontal: 17, paddingTop: 7, paddingBottom: 20 }, pageTitle: { color: colors.ink, fontSize: 17, fontWeight: "800", marginTop: 1 }, subtitle: { color: "#54685b", fontSize: 9, marginTop: 5 }, searchRow: { flexDirection: "row", gap: 8, marginTop: 14 }, searchBox: { height: 38, borderWidth: 1, borderColor: colors.line, borderRadius: 22, flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 11 }, searchIcon: { color: colors.ink, fontSize: 17, marginRight: 8 }, searchInput: { color: colors.ink, fontSize: 9, flex: 1 }, filterButton: { height: 38, width: 45, backgroundColor: colors.pale, borderRadius: 21, alignItems: "center", justifyContent: "center" }, filterIcon: { color: colors.primary, fontSize: 20 }, filterList: { paddingVertical: 10, gap: 7 }, filterChip: { minHeight: 25, borderColor: colors.line, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" }, filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary }, filterText: { color: "#59695e", fontSize: 8 }, filterTextActive: { color: colors.white, fontWeight: "700" },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 7, marginBottom: 8 }, sectionTitle: { color: colors.ink, fontSize: 9, fontWeight: "700" }, seeAll: { color: colors.muted, fontSize: 7 }, featuredCard: { height: 124, borderRadius: 15, overflow: "hidden", backgroundColor: colors.pale }, featuredImage: { width: "100%", height: "100%", position: "absolute" }, featuredTag: { position: "absolute", left: 10, bottom: 9, backgroundColor: "rgba(255,255,255,0.96)", borderRadius: 8, paddingHorizontal: 9, paddingVertical: 7, maxWidth: "75%" }, featuredKicker: { color: colors.primary, fontSize: 6, fontWeight: "800", letterSpacing: 0.5 }, featuredName: { color: colors.ink, fontSize: 9, fontWeight: "800", marginTop: 3 }, featuredPrice: { color: "#52665a", fontSize: 7, marginTop: 2 }, dots: { flexDirection: "row", justifyContent: "center", gap: 5, height: 22, alignItems: "center" }, dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#d8e2d8" }, dotActive: { backgroundColor: "#678374" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 }, mealCard: { width: "48.5%", marginBottom: 4 }, mealPhotoWrap: { height: 96, borderRadius: 12, overflow: "hidden", backgroundColor: colors.pale, marginBottom: 5 }, mealPhoto: { width: "100%", height: "100%" }, photoFallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.pale }, fallbackEmoji: { fontSize: 35 }, timeBadge: { position: "absolute", bottom: 5, left: 5, overflow: "hidden", borderRadius: 10, backgroundColor: "rgba(35,54,42,0.72)", color: colors.white, paddingHorizontal: 6, paddingVertical: 3, fontSize: 6 }, mealTitle: { color: colors.ink, fontSize: 8, fontWeight: "800" }, priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 }, mealPrice: { color: colors.ink, fontSize: 8, fontWeight: "700" }, rating: { color: "#db873a", fontSize: 7 }, mealMeta: { color: colors.muted, fontSize: 6, marginTop: 2 }, loading: { minHeight: 98, alignItems: "center", justifyContent: "center", gap: 7 }, emptyCard: { minHeight: 104, backgroundColor: colors.pale2, borderRadius: 14, padding: 15, justifyContent: "center", gap: 6 }, emptyTitle: { color: colors.ink, fontSize: 11, fontWeight: "800" }, emptyText: { color: colors.muted, fontSize: 8, lineHeight: 12 }, retry: { alignSelf: "flex-start", paddingVertical: 7, paddingHorizontal: 12, backgroundColor: colors.primary, borderRadius: 16, marginTop: 3 }, retryText: { color: colors.white, fontSize: 8, fontWeight: "700" },
  tabBar: { height: 49, marginHorizontal: 15, marginBottom: 4, flexDirection: "row", borderColor: colors.line, borderWidth: 1, borderRadius: 25, backgroundColor: colors.white, alignItems: "center", justifyContent: "space-around" }, tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 1 }, tabIcon: { width: 30, height: 24, borderRadius: 14, alignItems: "center", justifyContent: "center" }, tabIconActive: { backgroundColor: colors.pale }, tabLabel: { color: "#64756a", fontSize: 6 }, tabLabelActive: { color: colors.primary, fontWeight: "800" }, profilePanel: { paddingVertical: 40, alignItems: "center", gap: 10 }, profileAvatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.pale, alignItems: "center", justifyContent: "center" }, profileInitial: { color: colors.primary, fontSize: 24, fontWeight: "800" }, primaryButton: { marginTop: 15, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 22 }, primaryText: { color: colors.white, fontSize: 9, fontWeight: "800" }, modalScrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(20,33,25,0.28)" }, filterSheet: { backgroundColor: colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 26 }, sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "#d9e1d9", alignSelf: "center", marginBottom: 14 }, sheetTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" }, sheetCaption: { color: colors.muted, fontSize: 9, marginTop: 4, marginBottom: 14 }, sheetFilters: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, clearButton: { height: 38, alignItems: "center", justifyContent: "center", marginTop: 8 }, clearText: { color: colors.primary, fontSize: 9, fontWeight: "800" },
});
