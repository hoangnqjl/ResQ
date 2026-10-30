import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import type { Food } from "./HomeScreen";
import { communityColors } from "../components/CommunityLayout";
import { getCommunityFoods, imageUrl, type CommunityFood } from "../services/communityApi";

type Mode = "explore" | "results" | "history";
type Props = {
  userId: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenFood: (food: Food) => void;
};

const historyKey = (userId: string) => `resq.search-history.${userId}`;
const defaultHistory = [
  "Popular food",
  "Food under $10",
  "Vietnamese food near me",
  "Top rated restaurants",
];
const quickCategories = [
  { title: "Bakery", icon: "fast-food-outline", search: "bread bakery" },
  { title: "Meals", icon: "grid-outline", search: "meal" },
  { title: "Drinks", icon: "cafe-outline", search: "drink" },
  { title: "Plant-based", icon: "leaf-outline", search: "vegetarian" },
  { title: "Noodles", icon: "restaurant-outline", search: "noodles" },
] as const;
const browseCategories = [
  {
    title: "Bakery & Sweets",
    category: "bakery",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Prepared Hot Meals",
    category: "meal",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "0đ Sharing Corner",
    category: "free",
    image: "https://images.unsplash.com/photo-1584466977773-e625c37cdd50?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Fresh Produce & Greens",
    category: "produce",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=85",
  },
] as const;
const filters = ["Fast delivery", "Near me", "Under $10", "Top rated"] as const;

const categoryMatch = (food: CommunityFood, category: string) => {
  if (category === "free") return Number(food.current_price) === 0;
  const text = `${food.name} ${food.description ?? ""}`.toLowerCase();
  if (category === "meal") return /meal|rice|chicken|salmon|pho|pasta|noodle|food/i.test(text);
  if (category === "bakery") return /bread|bakery|cake|pastry|pancake|croissant/i.test(text);
  if (category === "produce") return /vegetable|produce|fruit|salad|green|vegan/i.test(text);
  return text.includes(category.toLowerCase());
};

const money = (value: string | number) => `$${(Number(value) / 25000).toFixed(2)}`;

function BackCircle({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.headerButton} accessibilityLabel="Back">
      <Ionicons name="chevron-back" size={20} color={communityColors.ink} />
    </Pressable>
  );
}

function MoreMenu({
  visible,
  onHistory,
  onSettings,
}: {
  visible: boolean;
  onHistory: () => void;
  onSettings: () => void;
}) {
  if (!visible) return null;
  return (
    <View style={styles.moreMenu}>
      <Pressable onPress={onHistory} style={styles.moreMenuRow}>
        <Text style={styles.moreMenuText}>Search history</Text>
      </Pressable>
      <Pressable onPress={onSettings} style={styles.moreMenuRow}>
        <Text style={styles.moreMenuText}>Search settings</Text>
      </Pressable>
    </View>
  );
}

function FoodCard({ food, onPress }: { food: CommunityFood; onPress: (food: Food) => void }) {
  const uri = imageUrl(food.image_url);
  const minutes = food.pickup_ends_at
    ? Math.max(1, Math.ceil((new Date(food.pickup_ends_at).getTime() - Date.now()) / 60000))
    : undefined;
  const selectedFood: Food = {
    id: food.id,
    name: food.name,
    description: food.description ?? undefined,
    image_url: food.image_url ?? undefined,
    original_price: food.original_price,
    current_price: food.current_price,
    quantity_available: food.quantity_available,
    shop_id: food.shop_id,
    shop_name: food.shop_name,
    address: food.address,
    verified: food.verified ?? false,
    reputation_score: food.reputation_score,
    storage_instructions: food.storage_instructions ?? undefined,
  };
  return (
    <Pressable onPress={() => onPress(selectedFood)} style={styles.foodCard}>
      <View style={styles.foodPhotoWrap}>
        {uri ? <Image source={{ uri }} style={styles.foodPhoto} resizeMode="cover" /> : <View style={styles.photoFallback} />}
        {minutes !== undefined && <Text style={styles.timeBadge}>{minutes} min</Text>}
      </View>
      <Text numberOfLines={1} style={styles.foodName}>{food.name}</Text>
      <View style={styles.priceLine}>
        <Text style={styles.foodPrice}>{money(food.current_price)}</Text>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingStar}>★</Text>
          <Text style={styles.ratingText}>{Number(food.reputation_score ?? 0).toFixed(1)}</Text>
        </View>
      </View>
      <Text numberOfLines={1} style={styles.foodLocation}>{food.address}</Text>
    </Pressable>
  );
}

function BottomTabs({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabs = [
    ["Home", "home-outline"],
    ["Explore", "search-outline"],
    ["Maps", "map-outline"],
    ["Saved", "bookmark-outline"],
    ["Profile", "person-outline"],
  ] as const;
  return (
    <View style={styles.tabBar}>
      {tabs.map(([label, icon]) => (
        <Pressable key={label} onPress={() => onTabChange(label)} style={styles.tab}>
          <View style={[styles.tabIcon, activeTab === label && styles.tabIconActive]}>
            <Ionicons name={icon} size={19} color={activeTab === label ? communityColors.green : communityColors.ink} />
          </View>
          <Text style={[styles.tabLabel, activeTab === label && styles.tabLabelActive]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function ExploreScreen({
  userId,
  activeTab,
  onTabChange,
  onOpenFood,
}: Props) {
  const [mode, setMode] = useState<Mode>("explore");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [history, setHistory] = useState(defaultHistory);
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [allFoods, setAllFoods] = useState<CommunityFood[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof filters)[number]>("Fast delivery");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(historyKey(userId)).then((stored) => {
      if (!active || !stored) return;
      try {
        const saved = JSON.parse(stored) as unknown;
        if (Array.isArray(saved) && saved.every((item) => typeof item === "string")) {
          setHistory(saved.slice(0, 20));
        }
      } catch {
        Alert.alert("Search history", "Saved search history could not be read.");
      }
    }).catch(() => {
      if (active) Alert.alert("Search history", "Could not load saved searches.");
    });
    return () => { active = false; };
  }, [userId]);

  useEffect(() => {
    let active = true;
    void getCommunityFoods()
      .then((items) => { if (active) setAllFoods(items); })
      .catch(() => { if (active) setError("Không thể tải danh mục từ máy chủ."); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (mode !== "results") return;
    let active = true;
    setLoading(true);
    setError("");
    void getCommunityFoods(categoryFilter === "free" ? undefined : submittedQuery)
      .then((items) => { if (active) setFoods(items); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Không thể tải kết quả.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [mode, submittedQuery, categoryFilter]);

  const categoryCounts = useMemo(() => browseCategories.map((category) => ({
    ...category,
    count: allFoods.filter((food) => categoryMatch(food, category.category)).length,
  })), [allFoods]);

  const resultFoods = useMemo(() => {
    let items = [...foods];
    if (filter === "Under $10") items = items.filter((food) => Number(food.current_price) <= 250000);
    if (filter === "Top rated") items = items.filter((food) => Number(food.reputation_score ?? 0) >= 4.5);
    if (categoryFilter) items = items.filter((food) => categoryMatch(food, categoryFilter));
    if (filter === "Fast delivery") {
      items.sort((a, b) => new Date(a.pickup_ends_at ?? "9999-12-31").getTime() - new Date(b.pickup_ends_at ?? "9999-12-31").getTime());
    }
    return items;
  }, [foods, filter, categoryFilter]);

  const saveHistory = async (value: string) => {
    const updated = [value, ...history.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 20);
    setHistory(updated);
    try {
      await AsyncStorage.setItem(historyKey(userId), JSON.stringify(updated));
    } catch {
      Alert.alert("Search history", "Could not save this search.");
    }
  };

  const search = (value = query) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    setQuery(trimmed);
    setSubmittedQuery(trimmed);
    setCategoryFilter(null);
    setMode("results");
    setMenuOpen(false);
    void saveHistory(trimmed);
  };

  const searchCategory = (category: string) => {
    setQuery(category);
    setSubmittedQuery(category);
    setCategoryFilter(category);
    setMode("results");
    setFilter("Fast delivery");
  };

  const removeHistoryItem = async (value: string) => {
    const updated = history.filter((item) => item !== value);
    setHistory(updated);
    try {
      await AsyncStorage.setItem(historyKey(userId), JSON.stringify(updated));
    } catch {
      Alert.alert("Search history", "Could not update saved searches.");
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    try {
      await AsyncStorage.setItem(historyKey(userId), "[]");
    } catch {
      Alert.alert("Search history", "Could not clear saved searches.");
    }
  };

  const title = mode === "explore" ? "Explore" : mode === "results" ? "Search result" : "Search history";

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <BackCircle onPress={() => {
          if (mode === "results") setMode("explore");
          else if (mode === "history") setMode("results");
          else onTabChange("Home");
        }} />
        <Text style={styles.headerTitle}>{title}</Text>
        {mode === "history" ? <View style={styles.headerSpacer} /> : (
          <Pressable
            onPress={() => {
              setMenuOpen((open) => !open);
            }}
            style={styles.headerButton}
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-horizontal" size={22} color={communityColors.ink} />
          </Pressable>
        )}
        {mode !== "history" && <MoreMenu
          visible={menuOpen}
          onHistory={() => { setMode("history"); setMenuOpen(false); }}
          onSettings={() => { setMenuOpen(false); Alert.alert("Search settings", "Cài đặt tìm kiếm"); }}
        />}
      </View>

      {mode === "history" ? (
        <ScrollView contentContainerStyle={styles.historyContent}>
          <View style={styles.historyHeading}>
            <View>
              <Text style={styles.historyTitle}>Recent searches</Text>
              <Text style={styles.historyCount}>{history.length} saved searches</Text>
            </View>
            <Pressable onPress={() => void clearHistory()}>
              <Text style={styles.clearAll}>Clear all</Text>
            </Pressable>
          </View>
          {history.map((item, index) => (
            <View key={`${item}-${index}`} style={styles.historyRow}>
              <Pressable onPress={() => search(item)} style={styles.historyMain}>
                <View style={styles.historyIcon}>
                  <Ionicons name="time-outline" size={20} color={communityColors.ink} />
                </View>
                <View style={styles.historyCopy}>
                  <Text style={styles.historyItem}>{item}</Text>
                  <Text style={styles.historyWhen}>{index < 2 ? "Today" : "Yesterday"} · {index === 0 ? "9:41 AM" : "8:15 AM"}</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => void removeHistoryItem(item)} style={styles.removeHistory} accessibilityLabel={`Remove ${item}`}>
                <Ionicons name="close" size={20} color={communityColors.ink} />
              </Pressable>
            </View>
          ))}
          <Text style={styles.searchAgain}>SEARCH AGAIN</Text>
          <View style={styles.historyChips}>
            {["Near me", "Under $10", "Top rated"].map((item) => (
              <Pressable key={item} onPress={() => search(item)} style={styles.historyChip}>
                <Text style={styles.historyChipText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={19} color={communityColors.ink} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={() => search()}
                  placeholder={mode === "explore" ? "Search food, restaurant, ..." : "Popular food"}
                  placeholderTextColor="#3d5548"
                  returnKeyType="search"
                  style={styles.searchInput}
                />
              </View>
              {mode === "results" && (
                <Pressable onPress={() => setFilter(filter === "Near me" ? "Fast delivery" : "Near me")} style={styles.filterButton} accessibilityLabel="Search filters">
                  <Ionicons name="options-outline" size={20} color={communityColors.ink} />
                </Pressable>
              )}
            </View>

            {mode === "explore" ? (
              <>
                <Text style={styles.sectionTitle}>Quick explore</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickList}>
                  {quickCategories.map((category) => (
                    <Pressable key={category.title} onPress={() => searchCategory(category.search)} style={styles.quickItem}>
                      <View style={styles.quickIcon}>
                        <Ionicons name={category.icon} size={28} color={communityColors.ink} />
                      </View>
                      <Text style={styles.quickLabel}>{category.title}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Text style={styles.sectionTitle}>Browse All Categories</Text>
                <Text style={styles.categorySubtitle}>Surplus &amp; rescue food from nearby shops</Text>
                <View style={styles.categoryGrid}>
                  {categoryCounts.map((category) => (
                    <Pressable key={category.title} onPress={() => searchCategory(category.category)} style={styles.categoryCard}>
                      <Image source={{ uri: category.image }} style={styles.categoryImage} resizeMode="cover" />
                      <Text numberOfLines={1} style={styles.categoryTitle}>{category.title}</Text>
                      <View style={styles.categoryMeta}>
                        <Text style={styles.categoryCount}>{category.count} {category.category === "free" ? "deals" : "meals"}</Text>
                        <Ionicons name="chevron-forward" size={16} color={communityColors.muted} />
                      </View>
                    </Pressable>
                  ))}
                </View>
                {error ? <Text style={styles.inlineError}>{error}</Text> : null}
              </>
            ) : (
              <>
                <View style={styles.filterRow}>
                  {filters.map((item) => (
                    <Pressable key={item} onPress={() => setFilter(item)} style={[styles.resultFilter, filter === item && styles.resultFilterActive]}>
                      <Text style={[styles.resultFilterText, filter === item && styles.resultFilterTextActive]}>{item}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.resultsHeading}>
                  <Text style={styles.sectionTitle}>Food near you</Text>
                  <Text style={styles.resultsCount}>{resultFoods.length} results</Text>
                </View>
                {loading ? <ActivityIndicator style={styles.loading} color={communityColors.green} /> : error ? (
                  <Text style={styles.inlineError}>{error}</Text>
                ) : resultFoods.length ? (
                  <View style={styles.foodGrid}>
                    {resultFoods.map((food) => (
                      <FoodCard key={food.id} food={food} onPress={onOpenFood} />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyState}>Không tìm thấy món phù hợp trong dữ liệu cửa hàng.</Text>
                )}
              </>
            )}
          </ScrollView>
          {mode === "explore" && <BottomTabs activeTab={activeTab} onTabChange={onTabChange} />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    height: 58,
    marginHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 2,
  },
  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 24,
    borderWidth: 1.3,
    borderColor: communityColors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  headerTitle: { flex: 1, textAlign: "center", color: communityColors.ink, fontSize: 16, fontWeight: "700" },
  headerSpacer: { width: 46 },
  moreMenu: {
    position: "absolute",
    zIndex: 4,
    top: 57,
    right: 0,
    width: 136,
    borderWidth: 1,
    borderColor: communityColors.line,
    borderRadius: 17,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    elevation: 5,
  },
  moreMenuRow: { minHeight: 34, justifyContent: "center" },
  moreMenuText: { color: communityColors.ink, fontSize: 12 },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 22 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  searchBar: {
    flex: 1,
    height: 43,
    borderWidth: 1.3,
    borderColor: communityColors.line,
    borderRadius: 25,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: { flex: 1, color: communityColors.ink, fontSize: 13, paddingVertical: 0 },
  filterButton: {
    width: 66,
    height: 43,
    borderWidth: 1.3,
    borderColor: communityColors.line,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { color: communityColors.ink, fontSize: 16, fontWeight: "800" },
  quickList: { gap: 15, paddingVertical: 15 },
  quickItem: { width: 58, alignItems: "center", gap: 7 },
  quickIcon: {
    width: 55,
    height: 55,
    borderRadius: 29,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { color: communityColors.ink, fontSize: 11 },
  categorySubtitle: { color: communityColors.muted, fontSize: 12, marginTop: 3, marginBottom: 13 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  categoryCard: {
    width: "48.5%",
    borderWidth: 1.2,
    borderColor: communityColors.line,
    borderRadius: 19,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  categoryImage: { width: "100%", height: 106, borderRadius: 13, backgroundColor: communityColors.pale },
  categoryTitle: { color: communityColors.ink, fontSize: 13, fontWeight: "800", marginTop: 9 },
  categoryMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  categoryCount: { color: communityColors.muted, fontSize: 12 },
  filterRow: { flexDirection: "row", gap: 7, marginTop: 12 },
  resultFilter: {
    flex: 1,
    height: 29,
    paddingHorizontal: 3,
    borderWidth: 1.1,
    borderColor: communityColors.line,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  resultFilterActive: { backgroundColor: communityColors.green, borderColor: communityColors.green },
  resultFilterText: { color: "#40584b", fontSize: 9, fontWeight: "500" },
  resultFilterTextActive: { color: "#ffffff", fontWeight: "700" },
  resultsHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18, marginBottom: 10 },
  resultsCount: { color: communityColors.muted, fontSize: 10 },
  foodGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 13 },
  foodCard: { width: "48.5%" },
  foodPhotoWrap: {
    width: "100%",
    aspectRatio: 1.43,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: communityColors.line,
    overflow: "hidden",
    backgroundColor: communityColors.pale,
  },
  foodPhoto: { width: "100%", height: "100%" },
  photoFallback: { flex: 1, backgroundColor: communityColors.pale },
  timeBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    color: "#ffffff",
    backgroundColor: communityColors.green,
    overflow: "hidden",
    borderRadius: 14,
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 9,
  },
  foodName: { color: communityColors.ink, fontSize: 12, fontWeight: "700", marginTop: 7 },
  priceLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5 },
  foodPrice: { color: "#43594b", fontSize: 10 },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#fff1df",
  },
  ratingStar: { color: "#dc812c", fontSize: 10 },
  ratingText: { color: "#43594b", fontSize: 9 },
  foodLocation: { color: communityColors.muted, fontSize: 9, marginTop: 5 },
  loading: { padding: 30 },
  emptyState: { textAlign: "center", color: communityColors.muted, fontSize: 12, paddingVertical: 26 },
  inlineError: { color: "#a54232", fontSize: 11, paddingVertical: 12 },
  tabBar: {
    minHeight: 58,
    marginHorizontal: 18,
    marginBottom: 3,
    borderRadius: 32,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 1 },
  tabIcon: { width: 58, height: 34, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  tabIconActive: { backgroundColor: communityColors.pale },
  tabLabel: { color: "#53665a", fontSize: 9 },
  tabLabelActive: { color: communityColors.green, fontWeight: "800" },
  historyContent: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 22 },
  historyHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },
  historyTitle: { color: communityColors.ink, fontSize: 17, fontWeight: "800" },
  historyCount: { color: communityColors.muted, fontSize: 13, marginTop: 7 },
  clearAll: { color: communityColors.ink, fontSize: 13, fontWeight: "700" },
  historyRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: communityColors.line,
  },
  historyMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 11 },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: communityColors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  historyCopy: { flex: 1, gap: 5 },
  historyItem: { color: communityColors.ink, fontSize: 13, fontWeight: "700" },
  historyWhen: { color: communityColors.muted, fontSize: 12 },
  removeHistory: { width: 35, height: 42, alignItems: "center", justifyContent: "center" },
  searchAgain: { color: communityColors.muted, fontSize: 12, fontWeight: "800", letterSpacing: 0.6, marginTop: 18 },
  historyChips: { flexDirection: "row", gap: 8, marginTop: 15 },
  historyChip: { paddingHorizontal: 12, minHeight: 35, borderRadius: 20, backgroundColor: communityColors.pale, justifyContent: "center" },
  historyChipText: { color: "#344e3e", fontSize: 12 },
});
