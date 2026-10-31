import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { FallbackPhoto } from "../components/FallbackPhoto";
import { CommunityOfferCard } from "../components/CommunityOfferCard";
import { CommunityHeader, communityColors, FilterPill } from "../components/CommunityLayout";
import { hasDiscount, toCommunityListing } from "../data/communityListings";
import { foodPhoto } from "../data/designPhotos";
import { getCommunityFoods, imageUrl, reserveCommunityFood, type CommunityFood } from "../services/communityApi";

export default function BudgetMysteryBagsScreen({ onBack, onOpenGuide, userId }: { onBack: () => void; onOpenGuide: () => void; userId: string }) {
  const [filter, setFilter] = useState("Under $3");
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getCommunityFoods()
      .then((items) => { if (active) setFoods(items.filter(hasDiscount)); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load discounted food."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const listings = useMemo(() => foods.filter((food) => {
    const discount = Number(food.original_price) > 0
      ? (1 - Number(food.current_price) / Number(food.original_price)) * 100
      : 0;
    if (filter === "Under $3") return Number(food.current_price) <= 75000;
    if (filter === "50% off") return discount >= 50 && discount < 70;
    if (filter === "70% off") return discount >= 70;
    return true;
  }).map(toCommunityListing), [foods, filter]);

  const handleReserve = async (food: CommunityFood) => {
    try {
      const result = await reserveCommunityFood(food.id, userId);
      Alert.alert("Đã đặt giữ món", `Giữ trong ${result.holdMinutes} phút.`);
    } catch (reason) {
      Alert.alert("Không thể đặt món", reason instanceof Error ? reason.message : "Vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.root}>
      <CommunityHeader title="Budget Mystery Bags" onBack={onBack} onMore={onOpenGuide} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <FallbackPhoto uri={imageUrl(foods[0]?.image_url)} fallback={foodPhoto(foods[0]?.name ?? "")} style={styles.heroImage} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>SAVE 50%–70%</Text>
            <Text style={styles.heroTitle}>Save food. Spend less.</Text>
            <Text style={styles.heroDescription}>Reserve a surprise selection of unsold food at a lower price.</Text>
          </View>
        </View>
        <View style={styles.filters}>
          {["Under $3", "50% off", "70% off"].map((item) => (
            <FilterPill
              key={item}
              label={item}
              selected={filter === item}
              warm={item !== "All"}
              onPress={() => setFilter(item)}
            />
          ))}
        </View>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Today's mystery bags</Text>
          <Text style={styles.offerCount}>{listings.length} offers</Text>
        </View>
        {loading ? <ActivityIndicator color={communityColors.green} /> : error ? <Text style={styles.empty}>{error}</Text> : listings.length ? (
          <View style={styles.grid}>
            {listings.map((listing) => (
              <CommunityOfferCard key={listing.id} listing={listing} onPress={(item) => void handleReserve(item)} />
            ))}
          </View>
        ) : <Text style={styles.empty}>Chưa có món ăn giảm giá.</Text>}
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
  heroEyebrow: { color: communityColors.ink, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
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
});
