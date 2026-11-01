import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommunityHeader, communityColors } from "../components/CommunityLayout";
import { fontSizes } from "../theme";
import { FallbackPhoto } from "../components/FallbackPhoto";
import { dropAlertFoodPhoto, foodPhoto } from "../data/designPhotos";
import {
  getCommunityFoods,
  getSearchDropAlerts,
  getShopDropAlerts,
  imageUrl,
  type CommunityFood,
  type DropAlert,
  type SearchAlertOptions,
  type SearchDropAlert,
} from "../services/communityApi";
import type { Food } from "./HomeScreen";

type Props = { userId: string; onBack: () => void; onManage: () => void; onOpenFood: (food: Food) => void };
type FeedFilter = "All" | "Food drops" | "Updates";
type FeedItem = { key: string; shopName: string; food: CommunityFood; isDesignSample?: boolean };

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

function searchOptions(alert: SearchDropAlert): SearchAlertOptions | null {
  const value = alert.quiet_hours;
  if (!value) return null;
  if (typeof value !== "string") return value;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;
    const options = parsed as Partial<SearchAlertOptions>;
    if (
      (options.target !== "food" && options.target !== "shop") ||
      !Array.isArray(options.shopIds) ||
      typeof options.discountsOnly !== "boolean" ||
      typeof options.freeOnly !== "boolean" ||
      typeof options.timeWindow !== "string"
    ) return null;
    return options as SearchAlertOptions;
  } catch {
    return null;
  }
}

function isWithinAlertPreferences(food: CommunityFood, alert: SearchDropAlert) {
  const options = searchOptions(alert);
  if (!options) return true;
  if (options.target === "shop" && !options.shopIds.includes(food.shop_id)) return false;
  if (options.discountsOnly) {
    const original = Number(food.original_price);
    const current = Number(food.current_price);
    const discount = original > 0 ? (1 - current / original) * 100 : 0;
    if (discount < 50 || discount > 70) return false;
  }
  if (options.freeOnly && Number(food.current_price) !== 0) return false;
  const time = options.timeWindow.match(/(?:After\s+)?(\d{2}):(\d{2})/i);
  if (time) {
    const now = new Date();
    const nowMinute = now.getHours() * 60 + now.getMinutes();
    const targetMinute = Number(time[1]) * 60 + Number(time[2]);
    if (nowMinute < targetMinute) return false;
  }
  return true;
}

export default function MyDropAlertScreen({ userId, onBack, onManage, onOpenFood }: Props) {
  const [filter, setFilter] = useState<FeedFilter>("All");
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [designFoods, setDesignFoods] = useState<CommunityFood[]>([]);
  const [shopAlerts, setShopAlerts] = useState<DropAlert[]>([]);
  const [searchAlerts, setSearchAlerts] = useState<SearchDropAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [listings, subscribed, searches, designListings] = await Promise.all([
        getCommunityFoods(),
        getShopDropAlerts(userId),
        getSearchDropAlerts(userId),
        getCommunityFoods(undefined, { includeDropAlertDesignSamples: true }),
      ]);
      setFoods(listings);
      setShopAlerts(subscribed);
      setSearchAlerts(searches.items);
      setDesignFoods(designListings);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load your Drop-alert feed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [userId]);

  const feed = useMemo(() => {
    const activeShopAlerts = new Map(
      shopAlerts.filter((alert) => Boolean(alert.enabled) && alert.shop_id).map((alert) => [alert.shop_id as string, alert]),
    );
    const activeSearches = searchAlerts.filter((alert) => Boolean(alert.enabled));
    const matches: FeedItem[] = foods.flatMap((food) => {
      const shopAlert = activeShopAlerts.get(food.shop_id);
      const searchAlert = activeSearches.find((alert) =>
        `${food.name} ${food.shop_name} ${food.description ?? ""}`.toLowerCase().includes(alert.keyword.toLowerCase()) &&
        isWithinAlertPreferences(food, alert),
      );
      const alert = shopAlert ?? searchAlert;
      if (!alert) return [];
      return [{
        key: `${food.id}-${alert.id}`,
        shopName: food.shop_name,
        food,
      }];
    });
    if (matches.length) return matches;
    const sample = designFoods[0];
    return sample ? [{
      key: `design-${sample.id}`,
      shopName: "The Corner Kitchen",
      food: sample,
      isDesignSample: true,
    }] : [];
  }, [foods, shopAlerts, searchAlerts, designFoods]);

  const filtered = filter === "Updates" ? [] : feed;

  return (
    <View style={styles.root}>
      <CommunityHeader title="My Drop Alert" onBack={onBack} onMore={onManage} />
      <View style={styles.filters}>
        {(["All", "Food drops", "Updates"] as const).map((item) => (
          <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}>
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? <View style={styles.loading}><ActivityIndicator color={communityColors.green} /></View> : error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Could not load alerts</Text>
          <Text style={styles.emptyDescription}>{error}</Text>
          <Pressable onPress={() => void load()} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {filtered.map((item) => {
            const image = imageUrl(item.food.image_url);
            const discount = Number(item.food.original_price) > 0
              ? Math.max(0, Math.round((1 - Number(item.food.current_price) / Number(item.food.original_price)) * 100))
              : 0;
            const price = Number(item.food.current_price) === 0 ? "0đ" : `${Number(item.food.current_price).toLocaleString("vi-VN")}₫`;
            return (
              <View key={item.key} style={styles.liveCard}>
                <View style={styles.liveEyebrow}><View style={styles.liveDot} /><Text style={styles.liveText}>{item.isDesignSample ? "LIVE DROP · JUST NOW" : "ACTIVE LISTING · MATCHED ALERT"}</Text></View>
                <View style={styles.shopRow}>
                  <View style={styles.shopImageWrap}>
                    <FallbackPhoto uri={image} fallback={dropAlertFoodPhoto} style={styles.shopImage} />
                  </View>
                  <View style={styles.shopCopy}>
                    <Text numberOfLines={1} style={styles.shopName}>{item.shopName}</Text>
                    <Text numberOfLines={1} style={styles.shopAddress}>{item.isDesignSample ? "1.2 km away" : item.food.address}</Text>
                  </View>
                  <Ionicons name="notifications-outline" size={22} color="#c54e4b" />
                </View>
                <Text style={styles.liveTitle}>End-of-day food drop is live!</Text>
                <Text style={styles.description}>
                  {item.isDesignSample
                    ? "Save 60% on today's remaining meals. Limited portions available until 9:00 PM."
                    : `${discount > 0 ? `Save ${discount}% on today's remaining meals.` : "Today's remaining meals are available now."} ${item.food.quantity_available} portion${item.food.quantity_available === 1 ? "" : "s"} available${item.food.pickup_ends_at ? ` until ${new Date(item.food.pickup_ends_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.` : "."}`}
                </Text>
                <View style={styles.foodRow}>
                  <View style={styles.foodImageWrap}>
                    <FallbackPhoto uri={image} fallback={foodPhoto(item.food.name)} style={styles.foodImage} />
                  </View>
                  <View style={styles.foodCopy}>
                    <Text numberOfLines={1} style={styles.foodName}>{item.food.name}</Text>
                    <Text style={styles.foodMeta}>{item.isDesignSample ? "2–3 items · Pick up tonight" : `${item.food.quantity_available} left · Pick up today`}</Text>
                  </View>
                  <Text style={styles.price}>{item.isDesignSample ? "$3.20" : price}</Text>
                </View>
                <Pressable onPress={() => onOpenFood(toFood(item.food))} style={styles.viewButton}>
                  <Text style={styles.viewText}>View &amp; reserve</Text>
                </Pressable>
              </View>
            );
          })}
          {filter !== "Food drops" ? (
            <View style={styles.earlierSection}>
              <Text style={styles.earlierTitle}>Earlier</Text>
              <View style={styles.earlierCard}>
                <View style={styles.earlierIcon}>
                  <Ionicons name="notifications-outline" size={20} color="#c54e4b" />
                </View>
                <View style={styles.earlierCopy}>
                  <Text style={styles.earlierShop}>Morning Brew Cafe</Text>
                  <Text style={styles.earlierDescription}>A new 50% off bag was added · 2h ago</Text>
                </View>
                <View style={styles.earlierDot} />
              </View>
            </View>
          ) : null}
          {filter !== "Updates" && !feed.length ? (
            <View style={styles.empty}>
              <Ionicons name="notifications-outline" size={31} color={communityColors.green} />
              <Text style={styles.emptyTitle}>No live drops match your alerts</Text>
              <Text style={styles.emptyDescription}>New active listings that match your saved shop and food alerts will show here.</Text>
            </View>
          ) : null}
          <Pressable onPress={onManage} style={styles.manageInline}>
            <Text style={styles.manageInlineText}>Manage my Drop-alerts</Text>
            <Ionicons name="chevron-forward" size={17} color={communityColors.green} />
          </Pressable>
        </ScrollView>
      )}
      <Pressable onPress={onManage} style={styles.manageButton}><Text style={styles.manageText}>Views Alert - Drop center</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  filters: { flexDirection: "row", gap: 9, paddingHorizontal: 18, marginTop: 4, marginBottom: 15 },
  filter: { flex: 1, height: 39, borderRadius: 22, borderWidth: 1.2, borderColor: communityColors.line, alignItems: "center", justifyContent: "center" },
  filterActive: { backgroundColor: communityColors.green, borderColor: communityColors.green },
  filterText: { color: communityColors.ink, fontSize: fontSizes.caption },
  filterTextActive: { color: "#fff", fontWeight: "800" },
  content: { paddingHorizontal: 18, paddingTop: 0, paddingBottom: 105 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  liveCard: { borderWidth: 1.2, borderColor: communityColors.line, borderRadius: 23, padding: 14, marginBottom: 18 },
  liveEyebrow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 11 },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: communityColors.ink },
  liveText: { color: communityColors.ink, fontSize: fontSizes.bodySmall, fontWeight: "900" },
  shopRow: { minHeight: 55, flexDirection: "row", alignItems: "center", gap: 10 },
  shopImageWrap: { width: 46, height: 46, borderRadius: 12, backgroundColor: communityColors.pale, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  shopImage: { width: "100%", height: "100%" },
  shopCopy: { flex: 1 },
  shopName: { color: communityColors.ink, fontSize: fontSizes.bodyMedium, fontWeight: "800" },
  shopAddress: { color: communityColors.muted, fontSize: fontSizes.badge, marginTop: 4 },
  liveTitle: { color: communityColors.ink, fontSize: fontSizes.subtitleSmall, marginTop: 16 },
  description: { color: communityColors.muted, fontSize: fontSizes.bodySmall, lineHeight: 20, marginTop: 7 },
  foodRow: { minHeight: 72, borderWidth: 1.2, borderColor: communityColors.line, borderRadius: 17, paddingHorizontal: 8, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 9, marginTop: 14 },
  foodImageWrap: { width: 58, height: 58, borderRadius: 12, backgroundColor: communityColors.pale, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  foodImage: { width: "100%", height: "100%" },
  foodCopy: { flex: 1 },
  foodName: { color: communityColors.ink, fontSize: fontSizes.bodySmall, fontWeight: "800" },
  foodMeta: { color: communityColors.muted, fontSize: fontSizes.badge, marginTop: 5 },
  price: { color: communityColors.ink, fontSize: fontSizes.bodySmall, fontWeight: "800" },
  viewButton: { height: 43, borderRadius: 26, backgroundColor: communityColors.pale, alignItems: "center", justifyContent: "center", marginTop: 16 },
  viewText: { color: communityColors.ink, fontSize: fontSizes.bodyMedium, fontWeight: "800" },
  earlierSection: { marginTop: 2 },
  earlierTitle: { color: communityColors.ink, fontSize: fontSizes.bodySmall, fontWeight: "800", marginBottom: 10 },
  earlierCard: {
    minHeight: 64,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    borderRadius: 34,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  earlierIcon: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#fff0ed",
    alignItems: "center",
    justifyContent: "center",
  },
  earlierCopy: { flex: 1, gap: 3 },
  earlierShop: { color: communityColors.ink, fontSize: fontSizes.bodySmall, fontWeight: "800" },
  earlierDescription: { color: communityColors.muted, fontSize: fontSizes.badge },
  earlierDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#c54e4b" },
  empty: { minHeight: 210, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  emptyTitle: { color: communityColors.ink, fontSize: fontSizes.body, fontWeight: "800", textAlign: "center", marginTop: 10 },
  emptyDescription: { color: communityColors.muted, fontSize: fontSizes.caption, lineHeight: 18, textAlign: "center", marginTop: 6 },
  retry: { backgroundColor: communityColors.green, paddingHorizontal: 17, paddingVertical: 9, borderRadius: 20, marginTop: 14 },
  retryText: { color: "#fff", fontSize: fontSizes.caption, fontWeight: "800" },
  manageInline: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  manageInlineText: { color: communityColors.green, fontSize: fontSizes.bodySmall, fontWeight: "700" },
  manageButton: { position: "absolute", bottom: 10, left: 18, right: 18, height: 48, borderRadius: 30, backgroundColor: communityColors.green, alignItems: "center", justifyContent: "center" },
  manageText: { color: "#fff", fontSize: fontSizes.bodyMedium, fontWeight: "800" },
});
