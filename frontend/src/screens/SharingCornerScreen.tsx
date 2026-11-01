import { fontSizes } from "../theme";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { FallbackPhoto } from "../components/FallbackPhoto";
import { CommunityHeader, communityColors, FilterPill } from "../components/CommunityLayout";
import { isAvailableNow } from "../data/communityListings";
import { foodPhoto, sharingStationPhoto } from "../data/designPhotos";
import { getCommunityFoods, imageUrl, reserveCommunityFood, type CommunityFood } from "../services/communityApi";

const pickupLabels: Record<string, string> = {
  "44444444-4444-4444-8444-444444444452": "Pick up by 8:30 PM",
  "44444444-4444-4444-8444-444444444453": "Pick up by 9:00 PM",
  "44444444-4444-4444-8444-444444444454": "Pick up by 6:30 PM",
  "44444444-4444-4444-8444-444444444455": "Pick up by 9:30 PM",
};

export default function SharingCornerScreen({
  onBack,
  onOpenMap,
  userId,
}: {
  onBack: () => void;
  onOpenMap: () => void;
  userId: string;
}) {
  const [filter, setFilter] = useState("Nearest");
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getCommunityFoods(undefined, { includeSharingDesignSamples: true })
      .then((items) => { if (active) setFoods(items); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load free food."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const listings = useMemo(() => foods.filter((food) => {
    if (filter === "Available now") return isAvailableNow(food);
    if (filter === "Vegetarian") return /vegetarian|vegan|plant[- ]based/i.test(`${food.name} ${food.description ?? ""} ${food.storage_instructions ?? ""}`);
    return true;
  }), [foods, filter]);

  const handleClaim = async (listing: CommunityFood) => {
    try {
      const result = await reserveCommunityFood(listing.id, userId);
      Alert.alert("Đã giữ món", `${listing.name} · Giữ trong ${result.holdMinutes} phút.`);
    } catch (reason) {
      Alert.alert("Không thể nhận món", reason instanceof Error ? reason.message : "Vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.root}>
      <CommunityHeader title="0đ Sharing Corner" onBack={onBack} onMore={() => {}} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <FallbackPhoto fallback={sharingStationPhoto} style={styles.heroImage} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>COMMUNITY SHARING MAPS</Text>
            <Text style={styles.heroTitle}>Good food, shared free</Text>
            <Text style={styles.heroDescription}>Claim a free meal donated by nearby shops and community partners.</Text>
          </View>
        </View>
        <View style={styles.filters}>
          {["Nearest", "Available now", "Vegetarian"].map((item) => (
            <FilterPill key={item} label={item} selected={filter === item} onPress={() => setFilter(item)} />
          ))}
        </View>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Available near you</Text>
          <Text style={styles.offerCount}>{listings.length} offers</Text>
        </View>
        {loading ? <ActivityIndicator color={communityColors.green} /> : error ? <Text style={styles.empty}>{error}</Text> : listings.length ? (
          <View style={styles.grid}>
            {listings.map((food) => (
              <View key={food.id} style={styles.card}>
                <Pressable onPress={() => void handleClaim(food)} style={styles.photoWrap}>
                  <FallbackPhoto uri={imageUrl(food.image_url)} fallback={foodPhoto(food.name)} style={styles.photo} />
                  <View style={styles.badge}><Text style={styles.badgeText}>FREE</Text></View>
                </Pressable>
                <Text numberOfLines={1} style={styles.foodName}>{food.name}</Text>
                <Text numberOfLines={1} style={styles.pickupTime}>{pickupLabels[food.id] ?? "Pick up today"}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.price}>0đ</Text>
                  <Pressable onPress={() => void handleClaim(food)} style={styles.claimButton}>
                    <Text style={styles.claimText}>Claim</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : <Text style={styles.empty}>Chưa có món ăn miễn phí gần bạn.</Text>}
        <Pressable onPress={onOpenMap}>
          <Text style={styles.mapLink}>Find a 0đ sharing station</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: communityColors.white },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24 },
  hero: {
    minHeight: 130,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    borderRadius: 21,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  heroImage: { width: 104, height: 104, borderRadius: 13, backgroundColor: communityColors.pale },
  heroCopy: { flex: 1, gap: 7 },
  heroEyebrow: { color: communityColors.green, fontSize: fontSizes.mini, fontWeight: "800", letterSpacing: 0.65 },
  heroTitle: { color: communityColors.ink, fontSize: fontSizes.subtitleSmall, fontWeight: "400" },
  heroDescription: { color: communityColors.muted, fontSize: fontSizes.micro, lineHeight: 15 },
  filters: { flexDirection: "row", gap: 8, marginTop: 14 },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { color: communityColors.ink, fontSize: fontSizes.bodyMedium, fontWeight: "800" },
  offerCount: { color: communityColors.muted, fontSize: fontSizes.badge },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 },
  card: {
    width: "48.5%",
    borderWidth: 1,
    borderColor: communityColors.line,
    borderRadius: 17,
    padding: 8,
    backgroundColor: communityColors.white,
  },
  photoWrap: {
    height: 116,
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: communityColors.pale,
  },
  photo: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    top: 7,
    right: 7,
    minHeight: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: "#e5f3e8",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: communityColors.green, fontSize: fontSizes.mini, fontWeight: "800", letterSpacing: 0.2 },
  foodName: { color: communityColors.ink, fontSize: fontSizes.caption, fontWeight: "800", marginTop: 9 },
  pickupTime: { color: "#52675a", fontSize: fontSizes.mini, marginTop: 5 },
  cardFooter: {
    minHeight: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 3,
  },
  price: { color: communityColors.ink, fontSize: fontSizes.caption, fontWeight: "800" },
  claimButton: {
    minWidth: 61,
    height: 29,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: communityColors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  claimText: { color: communityColors.white, fontSize: fontSizes.badge, fontWeight: "800" },
  empty: { color: communityColors.muted, fontSize: fontSizes.caption, paddingVertical: 18, textAlign: "center" },
  mapLink: {
    color: communityColors.green,
    fontSize: fontSizes.badge,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 18,
  },
});
