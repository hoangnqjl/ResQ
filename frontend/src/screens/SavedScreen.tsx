import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommunityFilterIcon, CommunityHeader, communityColors } from "../components/CommunityLayout";
import { FallbackPhoto } from "../components/FallbackPhoto";
import { cornerKitchenPhoto, foodPhoto } from "../data/designPhotos";
import {
  getCommunityFoods,
  getFavoriteFoodIds,
  getSavedShops,
  imageUrl,
  toggleFavoriteFood,
  toggleSavedShop,
  type CommunityFood,
  type SavedShop,
} from "../services/communityApi";
import type { Food } from "./HomeScreen";

type Props = {
  userId: string;
  onOpenMenu: () => void;
  onOpenFood: (food: Food) => void;
  onOpenShop: (shopId: string) => void;
  onTabChange: (tab: string) => void;
};
type Collection = "Food" | "Shop";
const designFoodIds = {
  chicken: "44444444-4444-4444-8444-444444444446",
  salmon: "44444444-4444-4444-8444-444444444447",
};
const designShopId = "33333333-3333-4333-8333-333333333336";

const tabs = [
  ["Home", "home-outline"],
  ["Explore", "search-outline"],
  ["Maps", "map-outline"],
  ["Saved", "bookmark"],
  ["Profile", "person-outline"],
] as const;

function toFood(food: CommunityFood): Food {
  return {
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
}

function SavedPhoto({ uri, name, shop, style }: { uri?: string; name: string; shop?: boolean; style: object }) {
  return (
    <View style={style}>
      <FallbackPhoto
        uri={uri}
        fallback={shop ? cornerKitchenPhoto : foodPhoto(name)}
        style={styles.photoImage}
      />
    </View>
  );
}

export default function SavedScreen({ userId, onOpenMenu, onOpenFood, onOpenShop, onTabChange }: Props) {
  const [collection, setCollection] = useState<Collection>("Food");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [foodIds, setFoodIds] = useState<string[]>([]);
  const [shops, setShops] = useState<SavedShop[]>([]);
  const [designShop, setDesignShop] = useState<SavedShop | null>(null);
  const [dismissedFoodSamples, setDismissedFoodSamples] = useState<number[]>([]);
  const [dismissedShopSamples, setDismissedShopSamples] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [listings, designListings, savedFoods, savedShops, designShops] = await Promise.all([
        getCommunityFoods(),
        getCommunityFoods(undefined, { includeSearchDesignSamples: true }),
        getFavoriteFoodIds(userId),
        getSavedShops(userId),
        getSavedShops(userId, { includeDesignSamples: true }),
      ]);
      setFoods([...new Map([...listings, ...designListings].map((food) => [food.id, food])).values()]);
      setFoodIds(savedFoods);
      setShops(savedShops.items);
      setDesignShop(designShops.items.find((shop) => shop.id === designShopId) ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load saved items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [userId]);

  const savedFoods = useMemo(() => {
    const search = query.trim().toLowerCase();
    return foods.filter((food) =>
      foodIds.includes(food.id) &&
      (!search || `${food.name} ${food.shop_name} ${food.address}`.toLowerCase().includes(search)),
    );
  }, [foods, foodIds, query]);
  const filteredShops = useMemo(() => {
    const search = query.trim().toLowerCase();
    return shops.filter((shop) => !search || `${shop.name} ${shop.address}`.toLowerCase().includes(search));
  }, [shops, query]);
  const previewFoods = useMemo(() => {
    if (foodIds.length || savedFoods.length) return [];
    const chicken = foods.find((food) => food.id === designFoodIds.chicken);
    const salmon = foods.find((food) => food.id === designFoodIds.salmon);
    return [chicken, salmon, chicken]
      .flatMap((food, index) => food && !dismissedFoodSamples.includes(index) ? [{ food, index }] : [])
      .filter(({ food }) => !query.trim() || `${food.name} ${food.shop_name} ${food.address}`.toLowerCase().includes(query.trim().toLowerCase()));
  }, [foodIds.length, savedFoods.length, foods, dismissedFoodSamples, query]);
  const previewShops = useMemo(() => {
    if (shops.length || !designShop) return [];
    return Array.from({ length: 4 }, (_, index) => ({ shop: designShop, index }))
      .filter(({ index }) => !dismissedShopSamples.includes(index))
      .filter(({ shop }) => !query.trim() || `${shop.name} ${shop.address}`.toLowerCase().includes(query.trim().toLowerCase()));
  }, [shops.length, designShop, dismissedShopSamples, query]);

  const unsaveFood = async (id: string) => {
    setBusyId(id);
    try {
      await toggleFavoriteFood(userId, id);
      setFoodIds((items) => items.filter((item) => item !== id));
    } catch (reason) {
      Alert.alert("Saved food", reason instanceof Error ? reason.message : "Could not remove this food.");
    } finally {
      setBusyId("");
    }
  };

  const unsaveShop = async (id: string) => {
    setBusyId(id);
    try {
      await toggleSavedShop(userId, id);
      setShops((items) => items.filter((item) => item.id !== id));
    } catch (reason) {
      Alert.alert("Saved shop", reason instanceof Error ? reason.message : "Could not remove this shop.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Pressable onPress={onOpenMenu} style={styles.roundButton} accessibilityLabel="Profile and menu">
          <Ionicons name="person-outline" size={20} color={communityColors.ink} />
        </Pressable>
        <Pressable onPress={() => setPickerOpen((value) => !value)} style={styles.titleButton}>
          <Text style={styles.title}>Saved {collection}</Text>
          <Ionicons name="chevron-down" size={19} color={communityColors.ink} />
        </Pressable>
        <Pressable onPress={() => Alert.alert("Saved items", "Your saved food and shops are synced to this ResQ account.")} style={styles.roundButton} accessibilityLabel="More options">
          <Ionicons name="ellipsis-horizontal" size={21} color={communityColors.ink} />
        </Pressable>
        {pickerOpen ? (
          <View style={styles.picker}>
            {(["Food", "Shop"] as const).map((value) => (
              <Pressable key={value} onPress={() => { setCollection(value); setPickerOpen(false); }} style={styles.pickerItem}>
                <Text style={[styles.pickerText, collection === value && styles.pickerSelected]}>{value === "Food" ? "Saved Food" : "Saved Shop"}</Text>
                {collection === value ? <Ionicons name="checkmark" size={17} color={communityColors.green} /> : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={19} color={communityColors.ink} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search food or restaurants" placeholderTextColor={communityColors.ink} style={styles.searchInput} returnKeyType="search" />
        </View>
        <Pressable onPress={() => Alert.alert("Filter", "Saved items can be searched by food, shop, or address.")} style={styles.filterButton} accessibilityLabel="Filter saved items">
          <CommunityFilterIcon />
        </Pressable>
      </View>
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={communityColors.green} /></View>
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Could not load saved {collection.toLowerCase()}</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable onPress={() => void load()} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {collection === "Food" && savedFoods.length ? savedFoods.map((food, index) => (
            <View key={food.id} style={[styles.card, savedFoods.length > 1 && savedFoods.length % 2 === 1 && index === savedFoods.length - 1 && styles.orphanCard]}>
              <Pressable onPress={() => onOpenFood(toFood(food))}>
                <SavedPhoto uri={imageUrl(food.image_url)} name={food.name} style={styles.photo} />
              </Pressable>
              <View style={styles.cardTitleRow}>
                <Pressable onPress={() => onOpenFood(toFood(food))} style={styles.cardTitleHit}>
                  <Text numberOfLines={1} style={styles.cardTitle}>{food.name}</Text>
                </Pressable>
                <Pressable disabled={busyId === food.id} onPress={() => void unsaveFood(food.id)} style={styles.unsave}>
                  <Text style={styles.unsaveText}>{busyId === food.id ? "…" : "Unsave"}</Text>
                </Pressable>
              </View>
              <Text style={styles.meta}>${(Number(food.current_price) / 25000).toFixed(2)}</Text>
              <Text numberOfLines={1} style={styles.meta}>{food.address}</Text>
            </View>
          )) : null}
          {collection === "Food" && !savedFoods.length ? previewFoods.map(({ food, index }) => (
            <View key={`${food.id}-${index}`} style={[styles.card, previewFoods.length > 1 && previewFoods.length % 2 === 1 && index === previewFoods[previewFoods.length - 1].index && styles.orphanCard]}>
              <Pressable onPress={() => onOpenFood(toFood(food))}>
                <SavedPhoto uri={imageUrl(food.image_url)} name={food.name} style={styles.photo} />
              </Pressable>
              <View style={styles.cardTitleRow}>
                <Pressable onPress={() => onOpenFood(toFood(food))} style={styles.cardTitleHit}>
                  <Text numberOfLines={1} style={styles.cardTitle}>{food.name}</Text>
                </Pressable>
                <Pressable onPress={() => setDismissedFoodSamples((items) => [...items, index])} style={styles.unsave}>
                  <Text style={styles.unsaveText}>Unsave</Text>
                </Pressable>
              </View>
              <Text style={styles.meta}>${(Number(food.current_price) / 25000).toFixed(2)}</Text>
              <Text numberOfLines={1} style={styles.meta}>{food.address}</Text>
            </View>
          )) : null}
          {collection === "Shop" && filteredShops.length ? filteredShops.map((shop) => (
            <View key={shop.id} style={styles.card}>
              <Pressable onPress={() => onOpenShop(shop.id)}>
                <SavedPhoto name={shop.name} shop style={styles.photo} />
              </Pressable>
              <View style={styles.cardTitleRow}>
                <Text numberOfLines={1} style={styles.cardTitleShop}>{shop.name}</Text>
                <Pressable disabled={busyId === shop.id} onPress={() => void unsaveShop(shop.id)} style={styles.unsave}>
                  <Text style={styles.unsaveText}>{busyId === shop.id ? "…" : "Unsave"}</Text>
                </Pressable>
              </View>
              <Text numberOfLines={2} style={styles.meta}>{shop.address}</Text>
            </View>
          )) : null}
          {collection === "Shop" && !filteredShops.length ? previewShops.map(({ shop, index }) => {
            const previewCardStyles = [styles.card, previewShops.length > 1 && previewShops.length % 2 === 1 && index === previewShops[previewShops.length - 1].index && styles.orphanCard];
            return (
              <View key={`${shop.id}-${index}`} style={previewCardStyles}>
                <Pressable onPress={() => onOpenShop(shop.id)}>
                  <SavedPhoto name={shop.name} shop style={styles.photo} />
                </Pressable>
                <View style={styles.cardTitleRow}>
                  <Text numberOfLines={1} style={styles.cardTitleShop}>{shop.name}</Text>
                  <Pressable onPress={() => setDismissedShopSamples((items) => [...items, index])} style={styles.unsave}>
                    <Text style={styles.unsaveText}>Unsave</Text>
                  </Pressable>
                </View>
                <Text numberOfLines={2} style={styles.meta}>{shop.address}</Text>
              </View>
            );
          }) : null}
          {collection === "Food" && !savedFoods.length && !previewFoods.length ? <EmptySaved collection="food" /> : null}
          {collection === "Shop" && !filteredShops.length && !previewShops.length ? <EmptySaved collection="shop" /> : null}
        </ScrollView>
      )}
      <View style={styles.tabBar}>
        {tabs.map(([label, icon]) => (
          <Pressable key={label} onPress={() => onTabChange(label)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: label === "Saved" }}>
            <View style={[styles.tabIcon, label === "Saved" && styles.tabIconActive]}>
              <Ionicons name={icon} size={22} color={label === "Saved" ? communityColors.green : communityColors.ink} />
            </View>
            <Text style={[styles.tabLabel, label === "Saved" && styles.tabLabelActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function EmptySaved({ collection }: { collection: "food" | "shop" }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={collection === "food" ? "bookmark-outline" : "storefront-outline"} size={34} color={communityColors.green} />
      <Text style={styles.emptyTitle}>No saved {collection} yet</Text>
      <Text style={styles.emptyText}>Items you save will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  top: { height: 66, marginHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 },
  roundButton: { width: 46, height: 46, borderRadius: 24, borderWidth: 1.3, borderColor: communityColors.line, alignItems: "center", justifyContent: "center" },
  titleButton: { flex: 1, height: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  title: { color: communityColors.ink, fontSize: 16, fontWeight: "800" },
  picker: { position: "absolute", zIndex: 5, top: 57, left: 80, right: 56, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: communityColors.line, paddingHorizontal: 12, elevation: 7 },
  pickerItem: { height: 43, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: communityColors.line },
  pickerText: { color: communityColors.ink, fontSize: 13 },
  pickerSelected: { color: communityColors.green, fontWeight: "800" },
  searchRow: { flexDirection: "row", gap: 9, marginHorizontal: 18, marginTop: 13, marginBottom: 27 },
  searchBox: { flex: 1, height: 42, borderWidth: 1.3, borderColor: communityColors.line, borderRadius: 25, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 9 },
  searchInput: { flex: 1, color: communityColors.ink, fontSize: 13, paddingVertical: 0 },
  filterButton: { width: 66, height: 42, borderRadius: 24, backgroundColor: communityColors.pale, alignItems: "center", justifyContent: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 18, paddingBottom: 105, rowGap: 25 },
  card: { width: "48.5%" },
  orphanCard: { marginLeft: "51.5%" },
  photo: { width: "100%", aspectRatio: 1.22, borderRadius: 12, overflow: "hidden", backgroundColor: communityColors.pale, borderWidth: 1, borderColor: communityColors.line },
  photoImage: { width: "100%", height: "100%" },
  cardTitleRow: { minHeight: 31, flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  cardTitleHit: { flex: 1, minWidth: 0 },
  cardTitle: { color: communityColors.ink, fontSize: 12, fontWeight: "800" },
  cardTitleShop: { color: communityColors.ink, fontSize: 11, fontWeight: "800", flex: 1 },
  unsave: { borderWidth: 1, borderColor: "#f5d9d4", borderRadius: 15, paddingHorizontal: 7, paddingVertical: 5 },
  unsaveText: { color: "#cc6d60", fontSize: 9, fontWeight: "700" },
  meta: { color: communityColors.muted, fontSize: 9, marginTop: 5 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { width: "100%", minHeight: 190, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  emptyTitle: { color: communityColors.ink, fontSize: 14, fontWeight: "800", textAlign: "center", marginTop: 9 },
  emptyText: { color: communityColors.muted, fontSize: 12, textAlign: "center", marginTop: 5 },
  retry: { backgroundColor: communityColors.green, borderRadius: 22, paddingHorizontal: 18, paddingVertical: 9, marginTop: 14 },
  retryText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  tabBar: { position: "absolute", left: 18, right: 18, bottom: 9, height: 48, borderRadius: 26, borderWidth: 1, borderColor: communityColors.line, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", justifyContent: "space-around", elevation: 3 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", height: 46 },
  tabIcon: { width: 58, height: 30, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  tabIconActive: { backgroundColor: communityColors.pale },
  tabLabel: { color: communityColors.ink, fontSize: 10, marginTop: 1 },
  tabLabelActive: { color: communityColors.green, fontWeight: "800" },
});
