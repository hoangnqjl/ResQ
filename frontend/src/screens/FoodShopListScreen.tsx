import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommunityHeader, communityColors } from "../components/CommunityLayout";
import { FallbackPhoto } from "../components/FallbackPhoto";
import { cornerKitchenPhoto, foodPhoto } from "../data/designPhotos";
import { getCommunityFoods, imageUrl, reserveCommunityFood, type CommunityFood } from "../services/communityApi";

type Props = {
  shopId: string | null;
  userId: string;
  onBack: () => void;
  onOpenFood: (food: CommunityFood) => void;
};

function pickupWindow(food: CommunityFood) {
  const starts = food.pickup_starts_at ? new Date(food.pickup_starts_at) : null;
  const ends = food.pickup_ends_at ? new Date(food.pickup_ends_at) : null;
  const format = (date: Date) => {
    const hour = date.getHours();
    const suffix = hour < 12 ? "AM" : "PM";
    return `${hour % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")} ${suffix}`;
  };
  if (starts && ends && !Number.isNaN(starts.getTime()) && !Number.isNaN(ends.getTime())) {
    const start = format(starts);
    const end = format(ends);
    const startWithoutSuffix = start.replace(/ (AM|PM)$/, "");
    const endSuffix = end.slice(-2);
    return `Pick up ${start.endsWith(endSuffix) ? startWithoutSuffix : start}–${end}`;
  }
  if (ends && !Number.isNaN(ends.getTime())) return `Pick up before ${format(ends)}`;
  return "Pickup time shown by the shop";
}

function pickupHeading(food: CommunityFood) {
  const date = food.pickup_starts_at ? new Date(food.pickup_starts_at) : null;
  if (!date || Number.isNaN(date.getTime())) return "Pickup details";
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? "Pickup tonight"
    : `Pickup ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function pickupDescription(food: CommunityFood) {
  const start = food.pickup_starts_at ? new Date(food.pickup_starts_at) : null;
  const end = food.pickup_ends_at ? new Date(food.pickup_ends_at) : null;
  const format = (date: Date) => {
    const hour = date.getHours();
    return `${hour % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
  };
  if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
    return `Reserve before ${format(start)} · Pickup ends at ${format(end)}`;
  }
  return "Check the pickup window on each food item";
}

function priceInDollars(value: number | string) {
  return `$${(Number(value) / 25000).toFixed(2)}`;
}

export default function FoodShopListScreen({ shopId, userId, onBack, onOpenFood }: Props) {
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [reservingId, setReservingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getCommunityFoods()
      .then((items) => {
        if (!active) return;
        const selectedShop = shopId ?? items[0]?.shop_id;
        setFoods(items.filter((item) => item.shop_id === selectedShop));
        if (!selectedShop) setError("No shop listings are available yet.");
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load this shop's food list.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [shopId]);

  const shop = foods[0];
  const visibleFoods = useMemo(
    () => showAll ? foods : foods.filter((food) => Number(food.quantity_available) > 0),
    [foods, showAll],
  );

  const reserve = async (food: CommunityFood) => {
    setReservingId(food.id);
    try {
      const result = await reserveCommunityFood(food.id, userId);
      Alert.alert("Reserved", `Your meal is held for ${result.holdMinutes} minutes.`);
    } catch (reason) {
      Alert.alert("Unable to reserve", reason instanceof Error ? reason.message : "Please try again.");
    } finally {
      setReservingId(null);
    }
  };

  return (
    <View style={styles.root}>
      <CommunityHeader title="Food’s list" onBack={onBack} onMore={() => {}} />
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={communityColors.green} /></View>
      ) : error ? (
        <View style={styles.stateWrap}>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : shop ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.shopCard}>
            <View style={styles.shopImageWrap}>
              <FallbackPhoto
                uri={imageUrl(shop.image_url)}
                fallback={cornerKitchenPhoto}
                style={styles.shopImage}
              />
            </View>
            <View style={styles.shopInfo}>
              <Text numberOfLines={1} style={styles.shopName}>{shop.shop_name}</Text>
              <View style={styles.shopRating}>
                <Text style={styles.star}>★</Text>
                <Text numberOfLines={1} style={styles.shopAddress}>
                  {shop.reputation_score != null ? `${Number(shop.reputation_score).toFixed(1)} · ` : ""}{shop.address}
                </Text>
              </View>
            </View>
            <Text style={styles.openLabel}>Open</Text>
          </View>

          <View style={styles.pickupInfo}>
            <View style={styles.clockBubble}><Ionicons name="time-outline" size={27} color={communityColors.ink} /></View>
            <View style={styles.pickupTextWrap}>
              <Text style={styles.pickupTitle}>{pickupHeading(shop)}</Text>
              <Text style={styles.pickupDescription}>{pickupDescription(shop)}</Text>
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterButtons}>
              <Pressable onPress={() => setShowAll(false)} style={[styles.filterButton, !showAll && styles.filterButtonActive]}>
                <Text style={[styles.filterButtonText, !showAll && styles.filterButtonTextActive]}>Available now</Text>
              </Pressable>
              <Pressable onPress={() => setShowAll(true)} style={[styles.filterButton, showAll && styles.filterButtonActive]}>
                <Text style={[styles.filterButtonText, showAll && styles.filterButtonTextActive]}>All food</Text>
              </Pressable>
            </View>
            <Text style={styles.itemCount}>{visibleFoods.length} {visibleFoods.length === 1 ? "item" : "items"}</Text>
          </View>

          {visibleFoods.map((food) => {
            const photo = imageUrl(food.image_url);
            const original = Number(food.original_price);
            const current = Number(food.current_price);
            const discount = original > 0 ? Math.max(0, Math.round((1 - current / original) * 100)) : 0;
            const quantity = Number(food.quantity_available);
            return (
              <View key={food.id} style={styles.foodCard}>
                <Pressable onPress={() => onOpenFood(food)} style={styles.foodPhotoWrap}>
                  <FallbackPhoto
                    uri={photo}
                    fallback={foodPhoto(food.name)}
                    style={styles.foodPhoto}
                  />
                  {discount > 0 ? <Text style={styles.discountBadge}>Save {discount}%</Text> : null}
                </Pressable>
                <View style={styles.foodInfo}>
                  <Pressable onPress={() => onOpenFood(food)}>
                    <Text numberOfLines={1} style={styles.foodName}>{food.name}</Text>
                  </Pressable>
                  <Text numberOfLines={1} style={styles.foodPickup}>{pickupWindow(food)}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{priceInDollars(food.current_price)}</Text>
                    <Text style={styles.quantity}>{quantity} left</Text>
                  </View>
                  <Pressable
                    disabled={quantity <= 0 || reservingId === food.id}
                    onPress={() => void reserve(food)}
                    style={[styles.reserveButton, quantity <= 0 && styles.reserveButtonDisabled]}
                  >
                    <Text style={styles.reserveText}>
                      {reservingId === food.id ? "Reserving…" : quantity === 1 ? "Last one · Reserve" : quantity <= 0 ? "Sold out" : "Reserve"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
          {!visibleFoods.length ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No food available right now</Text>
              <Text style={styles.emptyText}>Try All food to see every listing from this shop.</Text>
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  stateWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  stateText: { color: communityColors.muted, fontSize: 14, textAlign: "center" },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  shopCard: { minHeight: 101, borderRadius: 24, borderWidth: 1.3, borderColor: communityColors.line, padding: 11, flexDirection: "row", alignItems: "center", gap: 12 },
  shopImageWrap: { width: 61, height: 61, borderRadius: 16, overflow: "hidden", backgroundColor: communityColors.pale },
  shopImage: { width: "100%", height: "100%" },
  shopInfo: { flex: 1, minWidth: 0 },
  shopName: { color: communityColors.ink, fontSize: 14, fontWeight: "800" },
  shopRating: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7 },
  star: { color: "#e7842c", fontSize: 17, fontWeight: "700" },
  shopAddress: { flex: 1, color: communityColors.muted, fontSize: 12 },
  openLabel: { color: communityColors.ink, fontSize: 14, fontWeight: "800", paddingHorizontal: 5 },
  pickupInfo: { minHeight: 113, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 13 },
  clockBubble: { width: 58, height: 58, borderRadius: 31, backgroundColor: communityColors.pale, alignItems: "center", justifyContent: "center" },
  pickupTextWrap: { flex: 1 },
  pickupTitle: { color: communityColors.ink, fontSize: 14, fontWeight: "800" },
  pickupDescription: { color: communityColors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  filterRow: { minHeight: 53, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2, marginBottom: 7 },
  filterButtons: { flexDirection: "row", gap: 8 },
  filterButton: { height: 40, paddingHorizontal: 17, borderRadius: 23, borderWidth: 1.2, borderColor: communityColors.line, alignItems: "center", justifyContent: "center" },
  filterButtonActive: { backgroundColor: communityColors.green, borderColor: communityColors.green },
  filterButtonText: { color: "#43574b", fontSize: 12 },
  filterButtonTextActive: { color: "#fff", fontWeight: "700" },
  itemCount: { color: communityColors.muted, fontSize: 12 },
  foodCard: { height: 130, borderRadius: 18, borderWidth: 1.3, borderColor: communityColors.line, padding: 9, flexDirection: "row", alignItems: "stretch", gap: 7, marginBottom: 12, overflow: "hidden" },
  foodPhotoWrap: { width: "32%", height: 110, flexShrink: 0, borderRadius: 12, overflow: "hidden", backgroundColor: communityColors.pale },
  foodPhoto: { width: "100%", height: "100%" },
  discountBadge: { position: "absolute", right: 5, bottom: 5, color: "#fff", backgroundColor: "#667168", borderRadius: 7, paddingHorizontal: 6, paddingVertical: 6, fontSize: 11 },
  foodInfo: { flex: 1, minWidth: 0, justifyContent: "space-between", paddingVertical: 1 },
  foodName: { color: communityColors.ink, fontSize: 13, fontWeight: "800" },
  foodPickup: { color: communityColors.muted, fontSize: 11, marginTop: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 3 },
  price: { color: communityColors.ink, fontSize: 13, fontWeight: "800" },
  quantity: { color: communityColors.muted, fontSize: 11 },
  reserveButton: { height: 31, borderRadius: 18, backgroundColor: communityColors.pale, alignItems: "center", justifyContent: "center", marginTop: 4 },
  reserveButtonDisabled: { backgroundColor: "#f1f3f1" },
  reserveText: { color: communityColors.green, fontSize: 11, fontWeight: "800" },
  emptyCard: { alignItems: "center", padding: 22, borderRadius: 19, borderWidth: 1, borderColor: communityColors.line, marginTop: 12 },
  emptyTitle: { color: communityColors.ink, fontSize: 14, fontWeight: "800" },
  emptyText: { color: communityColors.muted, fontSize: 12, textAlign: "center", marginTop: 7 },
});
