import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../api";
<<<<<<< HEAD
import { colors, fontSizes } from "../theme";
=======
import { colors } from "../theme";
import { FallbackPhoto } from "../components/FallbackPhoto";
import { foodPhoto } from "../data/designPhotos";
import { imageUrl } from "../services/communityApi";
>>>>>>> 602a686 (Update ResQ Food project)

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
    <View style={s.mealPhotoWrap}><FallbackPhoto uri={imageUrl(food.image_url)} fallback={foodPhoto(food.name)} style={s.mealPhoto} /><Text style={s.timeBadge}>Pickup today</Text></View>
    <Text numberOfLines={1} style={s.mealTitle}>{food.name}</Text>
    <View style={s.priceRow}><Text style={s.mealPrice}>{money(food.current_price)}</Text><Text style={s.rating}>★ {Number(food.reputation_score ?? 0).toFixed(1)}</Text></View>
    <Text numberOfLines={1} style={s.mealMeta}>{food.shop_name} · {food.quantity_available} left</Text>
    <Text numberOfLines={1} style={s.mealMeta}>{food.address}</Text>
  </Pressable>;

  return <View style={s.root}>
    <View style={s.topBar}>
      <Pressable onPress={onOpenMenu} style={s.iconButton} accessibilityLabel="Open menu"><Ionicons name="menu-outline" size={20} color={colors.primary} /></Pressable>
      <Text style={s.logo}>ResQ</Text>
      <Pressable onPress={onOpenAlerts} style={s.iconButton} accessibilityLabel="Notifications"><Ionicons name="notifications-outline" size={20} color={colors.primary} /></Pressable>
    </View>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      {activeTab === "Profile" ? <View style={s.profilePanel}><View style={s.profileAvatar}><Text style={s.profileInitial}>{(userName || "R").slice(0, 1).toUpperCase()}</Text></View><Text style={s.pageTitle}>{userName || "ResQ member"}</Text><Text style={s.subtitle}>Your buyer profile and food preferences</Text><Pressable onPress={() => onTabChange("Explore")} style={s.primaryButton}><Text style={s.primaryText}>Explore meals</Text></Pressable></View> : <>
        <Text style={s.pageTitle}>{title}</Text>
        <Text style={s.subtitle}>{featured?.address || "Choose a pickup area to find meals nearby"}</Text>
        <View style={s.searchRow}>
          <View style={s.searchBox}><Text style={s.searchIcon}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="Search food or restaurants" placeholderTextColor="#819087" style={s.searchInput} returnKeyType="search" /></View>
          <Pressable onPress={() => setFiltersOpen(true)} style={s.filterButton}><Ionicons name="options-outline" size={20} color={colors.primary} /></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterList}>
          {filters.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[s.filterChip, filter === item && s.filterChipActive]}><Text style={[s.filterText, filter === item && s.filterTextActive]}>{item}</Text></Pressable>)}
        </ScrollView>
        <View style={s.sectionHeading}><Text style={s.sectionTitle}>Explore food near you</Text><Pressable onPress={() => onTabChange("Explore")}><Text style={s.seeAll}>See all</Text></Pressable></View>
        {loading ? <View style={s.loading}><ActivityIndicator color={colors.primary} /><Text style={s.mealMeta}>Loading live listings…</Text></View> : error ? <View style={s.emptyCard}><Text style={s.emptyTitle}>Server unavailable</Text><Text style={s.emptyText}>{error}</Text><Pressable onPress={() => setRefreshKey((key) => key + 1)} style={s.retry}><Text style={s.retryText}>Try again</Text></Pressable></View> : featured ? <Pressable onPress={() => onOpenFood(featured)} style={s.featuredCard}>
          <FallbackPhoto uri={imageUrl(featured.image_url)} fallback={foodPhoto(featured.name)} style={s.featuredImage} />
          <View style={s.featuredTag}><Text style={s.featuredKicker}>FROM THE DATABASE</Text><Text style={s.featuredName}>{featured.name}</Text><Text style={s.featuredPrice}>{money(featured.current_price)} · {featured.quantity_available} portions</Text></View>
        </Pressable> : <View style={s.emptyCard}><Text style={s.emptyTitle}>{activeTab === "Saved" ? "No saved meals yet" : "No meals available right now"}</Text><Text style={s.emptyText}>This list comes from MySQL. New store listings will appear here as soon as they are published.</Text></View>}
        <View style={s.dots}><View style={[s.dot, s.dotActive]} /><View style={s.dot} /><View style={s.dot} /></View>
        <View style={s.sectionHeading}><Text style={s.sectionTitle}>{activeTab === "Saved" ? "Saved meals" : "Food flash sales"}</Text><Pressable onPress={() => setRefreshKey((key) => key + 1)}><Text style={s.seeAll}>See all</Text></Pressable></View>
        {loading || filtered.length < 2 ? null : <View style={s.grid}>{filtered.slice(1, 12).map((food) => <MealCard key={food.id} food={food} />)}</View>}
      </>}
    </ScrollView>
    <View style={s.tabBar}>{tabs.map(([label, icon]) => <Pressable key={label} onPress={() => onTabChange(label)} style={s.tab} accessibilityRole="tab" accessibilityState={{ selected: activeTab === label }}><View style={[s.tabIcon, activeTab === label && s.tabIconActive]}><Ionicons name={icon} size={18} color={activeTab === label ? colors.primary : "#456051"} /></View><Text style={[s.tabLabel, activeTab === label && s.tabLabelActive]}>{label}</Text></Pressable>)}</View>
    <Modal visible={filtersOpen} transparent animationType="slide" onRequestClose={() => setFiltersOpen(false)}><View style={s.modalScrim}><Pressable style={StyleSheet.absoluteFill} onPress={() => setFiltersOpen(false)} /><View style={s.filterSheet}><View style={s.sheetHandle} /><Text style={s.sheetTitle}>Filter meals</Text><Text style={s.sheetCaption}>Choose what works for you</Text><View style={s.sheetFilters}>{filters.map((item) => <Pressable key={item} onPress={() => { setFilter(item); setFiltersOpen(false); }} style={[s.filterChip, filter === item && s.filterChipActive]}><Text style={[s.filterText, filter === item && s.filterTextActive]}>{item}</Text></Pressable>)}</View><Pressable onPress={() => { setFilter("Near me"); setFiltersOpen(false); }} style={s.clearButton}><Text style={s.clearText}>Clear filters</Text></Pressable></View></View></Modal>
  </View>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  topBar: { height: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 17 },
  iconButton: { height: 38, width: 38, borderRadius: 19, borderColor: colors.line, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  menuGlyph: { color: colors.primary, fontSize: 18 },
  bell: { color: colors.primary, fontSize: 18 },
  logo: { color: colors.ink, fontSize: fontSizes.title, fontWeight: "900" },
  content: { paddingHorizontal: 17, paddingTop: 10, paddingBottom: 24 },
  pageTitle: { color: colors.ink, fontSize: fontSizes.header, fontWeight: "800", marginTop: 2 },
  subtitle: { color: "#54685b", fontSize: fontSizes.bodySmall, marginTop: 5, lineHeight: 18 },
  searchRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  searchBox: { height: 44, borderWidth: 1, borderColor: colors.line, borderRadius: 22, flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 14 },
  searchIcon: { color: colors.ink, fontSize: 18, marginRight: 8 },
  searchInput: { color: colors.ink, fontSize: fontSizes.body, flex: 1 },
  filterButton: { height: 44, width: 48, backgroundColor: colors.pale, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  filterIcon: { color: colors.primary, fontSize: 22 },
  filterList: { paddingVertical: 10, gap: 8 },
  filterChip: { minHeight: 32, borderColor: colors.line, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: "#59695e", fontSize: fontSizes.bodySmall },
  filterTextActive: { color: colors.white, fontWeight: "700" },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 10 },
  sectionTitle: { color: colors.ink, fontSize: fontSizes.subtitle, fontWeight: "800" },
  seeAll: { color: colors.muted, fontSize: fontSizes.bodySmall, fontWeight: "600" },
  featuredCard: { height: 160, borderRadius: 16, overflow: "hidden", backgroundColor: colors.pale },
  featuredImage: { width: "100%", height: "100%", position: "absolute" },
  featuredTag: { position: "absolute", left: 12, bottom: 12, backgroundColor: "rgba(255,255,255,0.96)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, maxWidth: "80%" },
  featuredKicker: { color: colors.primary, fontSize: fontSizes.micro, fontWeight: "800", letterSpacing: 0.6 },
  featuredName: { color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "800", marginTop: 3 },
  featuredPrice: { color: "#52665a", fontSize: fontSizes.bodySmall, marginTop: 3 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, height: 24, alignItems: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#d8e2d8" },
  dotActive: { backgroundColor: "#678374", width: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 },
  mealCard: { width: "48%", marginBottom: 8 },
  mealPhotoWrap: { height: 116, borderRadius: 14, overflow: "hidden", backgroundColor: colors.pale, marginBottom: 7 },
  mealPhoto: { width: "100%", height: "100%" },
  photoFallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.pale },
  fallbackEmoji: { fontSize: 35 },
  timeBadge: { position: "absolute", bottom: 6, left: 6, overflow: "hidden", borderRadius: 8, backgroundColor: "rgba(35,54,42,0.78)", color: colors.white, paddingHorizontal: 8, paddingVertical: 4, fontSize: fontSizes.micro, fontWeight: "700" },
  mealTitle: { color: colors.ink, fontSize: fontSizes.body, fontWeight: "800" },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  mealPrice: { color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "800" },
  rating: { color: "#db873a", fontSize: fontSizes.caption, fontWeight: "700" },
  mealMeta: { color: colors.muted, fontSize: fontSizes.caption, marginTop: 3 },
  loading: { minHeight: 120, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyCard: { minHeight: 120, backgroundColor: colors.pale2, borderRadius: 16, padding: 18, justifyContent: "center", gap: 8 },
  emptyTitle: { color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: fontSizes.bodySmall, lineHeight: 19 },
  retry: { alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.primary, borderRadius: 18, marginTop: 4 },
  retryText: { color: colors.white, fontSize: fontSizes.bodySmall, fontWeight: "700" },
  tabBar: { height: 56, marginHorizontal: 14, marginBottom: 8, flexDirection: "row", borderColor: colors.line, borderWidth: 1, borderRadius: 28, backgroundColor: colors.white, alignItems: "center", justifyContent: "space-around" },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  tabIcon: { width: 34, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  tabIconActive: { backgroundColor: colors.pale },
  tabLabel: { color: "#64756a", fontSize: fontSizes.caption },
  tabLabelActive: { color: colors.primary, fontWeight: "800" },
  profilePanel: { paddingVertical: 40, alignItems: "center", gap: 12 },
  profileAvatar: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.pale, alignItems: "center", justifyContent: "center" },
  profileInitial: { color: colors.primary, fontSize: 28, fontWeight: "800" },
  primaryButton: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 14, backgroundColor: colors.primary, borderRadius: 24 },
  primaryText: { color: colors.white, fontSize: fontSizes.bodyLarge, fontWeight: "800" },
  modalScrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(20,33,25,0.28)" },
  filterSheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 32 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#d9e1d9", alignSelf: "center", marginBottom: 16 },
  sheetTitle: { color: colors.ink, fontSize: fontSizes.title, fontWeight: "800" },
  sheetCaption: { color: colors.muted, fontSize: fontSizes.bodySmall, marginTop: 4, marginBottom: 16 },
  sheetFilters: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  clearButton: { height: 42, alignItems: "center", justifyContent: "center", marginTop: 10 },
  clearText: { color: colors.primary, fontSize: fontSizes.body, fontWeight: "800" },
});
