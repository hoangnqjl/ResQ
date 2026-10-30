import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CommunityOfferCard } from "../components/CommunityOfferCard";
import { CommunityHeader, communityColors, FilterPill } from "../components/CommunityLayout";
import { isAvailableNow, toCommunityListing, type CommunityListing } from "../data/communityListings";
import { getCommunityFoods, imageUrl, reserveCommunityFood, type CommunityFood } from "../services/communityApi";

export default function SharingCornerScreen({
  onBack,
  onOpenMap,
  userId,
}: {
  onBack: () => void;
  onOpenMap: () => void;
  userId: string;
}) {
  const [filter, setFilter] = useState("All");
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getCommunityFoods()
      .then((items) => { if (active) setFoods(items.filter((item) => Number(item.current_price) === 0)); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load free food."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const listings = useMemo(() => foods.filter((food) => {
    if (filter === "Available now") return isAvailableNow(food);
    if (filter === "With photo") return Boolean(food.image_url);
    return true;
  }).map(toCommunityListing), [foods, filter]);

  const handleClaim = async (listing: CommunityListing) => {
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
          {imageUrl(foods[0]?.image_url)
            ? <Image source={{ uri: imageUrl(foods[0]?.image_url) }} style={styles.heroImage} resizeMode="cover" />
            : <View style={styles.heroImage} />}
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>COMMUNITY SHARING MAPS</Text>
            <Text style={styles.heroTitle}>Good food, shared free</Text>
            <Text style={styles.heroDescription}>Claim a free meal donated by nearby shops and community partners.</Text>
          </View>
        </View>
        <View style={styles.filters}>
          {["All", "Available now", "With photo"].map((item) => (
            <FilterPill key={item} label={item} selected={filter === item} onPress={() => setFilter(item)} />
          ))}
        </View>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Available near you</Text>
          <Text style={styles.offerCount}>{listings.length} offers</Text>
        </View>
        {loading ? <ActivityIndicator color={communityColors.green} /> : error ? <Text style={styles.empty}>{error}</Text> : listings.length ? (
          <View style={styles.grid}>
            {listings.map((listing) => (
              <CommunityOfferCard key={listing.id} listing={listing} onPress={(item) => void handleClaim(item)} />
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
    minHeight: 126,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    borderRadius: 21,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  heroImage: { width: 102, height: 96, borderRadius: 12, backgroundColor: communityColors.pale },
  heroCopy: { flex: 1, gap: 6 },
  heroEyebrow: { color: communityColors.green, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  heroTitle: { color: communityColors.ink, fontSize: 16, fontWeight: "400" },
  heroDescription: { color: communityColors.muted, fontSize: 10, lineHeight: 14 },
  filters: { flexDirection: "row", gap: 8, marginTop: 14 },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 11,
  },
  sectionTitle: { color: communityColors.ink, fontSize: 13, fontWeight: "800" },
  offerCount: { color: communityColors.muted, fontSize: 11 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 },
  empty: { color: communityColors.muted, fontSize: 12, paddingVertical: 18, textAlign: "center" },
  mapLink: {
    color: communityColors.green,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 18,
  },
});
