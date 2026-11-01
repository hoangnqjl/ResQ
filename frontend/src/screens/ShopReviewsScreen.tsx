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
import { CommunityHeader, communityColors } from "../components/CommunityLayout";
import { FallbackPhoto } from "../components/FallbackPhoto";
import { getCommunityFoods, getCommunityShop, getShopReviews, imageUrl, submitShopReview, type CommunityFood, type CommunityShop, type EligibleReviewOrder, type ShopReview } from "../services/communityApi";
import { fontSizes } from "../theme";

type Props = { shopId: string; userId: string; onBack: () => void };

function reviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ShopReviewsScreen({ shopId, userId, onBack }: Props) {
  const [shop, setShop] = useState<CommunityShop | null>(null);
  const [food, setFood] = useState<CommunityFood | null>(null);
  const [reviews, setReviews] = useState<ShopReview[]>([]);
  const [eligibleOrder, setEligibleOrder] = useState<EligibleReviewOrder | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [shopDetails, reviewResult, foodItems] = await Promise.all([
        getCommunityShop(shopId),
        getShopReviews(shopId, userId),
        getCommunityFoods(),
      ]);
      setShop(shopDetails);
      setReviews(reviewResult.items);
      setEligibleOrder(reviewResult.eligibleOrder);
      setFood(foodItems.find((item) => item.shop_id === shopId) ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load shop reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [shopId, userId]);

  const average = useMemo(
    () => reviews.length ? reviews.reduce((sum, item) => sum + Number(item.rating), 0) / reviews.length : Number(shop?.average_rating ?? 0),
    [reviews, shop],
  );
  const distribution = useMemo(
    () => [5, 4, 3, 2, 1].map((score) => reviews.filter((item) => Number(item.rating) === score).length),
    [reviews],
  );
  const maxDistribution = Math.max(1, ...distribution);

  const submit = async () => {
    if (!eligibleOrder || rating < 1) return;
    setSaving(true);
    try {
      await submitShopReview(shopId, { authorId: userId, orderId: eligibleOrder.id, rating, comment });
      setComment("");
      setRating(0);
      await load();
    } catch (reason) {
      Alert.alert("Shop review", reason instanceof Error ? reason.message : "Could not submit your review.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <CommunityHeader title="Shop review" onBack={onBack} onMore={() => {}} />
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={communityColors.green} /></View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => void load()}><Text style={styles.retryText}>Try again</Text></Pressable>
        </View>
      ) : shop ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.shopCard}>
            <View style={styles.shopPhoto}>
              <FallbackPhoto
                uri={imageUrl(food?.image_url)}
                fallback={require("../../assets/heatmap-shop-photo.png")}
                style={styles.shopPhotoImage}
              />
            </View>
            <View style={styles.shopInfo}>
              <Text numberOfLines={1} style={styles.shopName}>{shop.name}</Text>
              <View style={styles.shopRating}>
                <Text style={styles.star}>★</Text>
                <Text numberOfLines={1} style={styles.shopSub}>
                  {average.toFixed(1)} · {shop.address}
                </Text>
              </View>
            </View>
            <Text style={styles.openText}>Open</Text>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Reviews &amp; ratings</Text>
            <Text style={styles.seeAll}>See all {reviews.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.averageColumn}>
              <Text style={styles.average}>{average.toFixed(1)}</Text>
              <Text style={styles.stars}>★★★★★</Text>
              <Text style={styles.reviewCount}>{reviews.length} reviews</Text>
            </View>
            <View style={styles.distribution}>
              {distribution.map((count, index) => {
                const score = 5 - index;
                return (
                  <View key={score} style={styles.ratingRow}>
                    <Text style={styles.score}>{score}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${(count / maxDistribution) * 100}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {reviews.length ? (
            <View style={styles.reviewList}>
              {reviews.map((item) => (
                <View key={item.id} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{item.author_name.slice(0, 1).toUpperCase()}</Text></View>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{item.author_name}</Text>
                      <Text style={styles.reviewMeta}>Verified order · {reviewDate(item.created_at)}</Text>
                    </View>
                    <Text style={styles.reviewStars}>{"★".repeat(Number(item.rating))}{"☆".repeat(5 - Number(item.rating))}</Text>
                  </View>
                  {item.comment ? <Text style={styles.reviewComment}>{item.comment}</Text> : null}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noReviews}>
              <Ionicons name="chatbubble-ellipses-outline" size={27} color={communityColors.green} />
              <Text style={styles.noReviewsTitle}>No reviews yet</Text>
              <Text style={styles.noReviewsText}>Completed order reviews will appear here.</Text>
            </View>
          )}

          <View style={styles.writeReview}>
            <Text style={styles.verifiedLabel}>VERIFIED PURCHASE</Text>
            <View style={styles.writeTitleRow}>
              <Text style={styles.writeTitle}>How was your order?</Text>
              <Text style={styles.orderId}>{eligibleOrder ? `Order #${eligibleOrder.id.slice(0, 8)}` : "No eligible order"}</Text>
            </View>
            {eligibleOrder ? (
              <>
                <View style={styles.rateRow}>
                  {[1, 2, 3, 4, 5].map((score) => (
                    <Pressable key={score} onPress={() => setRating(score)} style={styles.rateButton} accessibilityLabel={`Rate ${score} stars`}>
                      <Text style={[styles.rateStar, score <= rating && styles.rateStarActive]}>{score <= rating ? "★" : "☆"}</Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Share your experience"
                  placeholderTextColor={communityColors.muted}
                  style={styles.commentInput}
                  multiline
                />
                <Pressable disabled={saving || rating < 1} onPress={() => void submit()} style={[styles.submitButton, (saving || rating < 1) && styles.submitDisabled]}>
                  <Text style={styles.submitText}>{saving ? "Submitting…" : "Submit review"}</Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.noOrderText}>Only a completed pickup can be reviewed.</Text>
            )}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { color: communityColors.muted, fontSize: fontSizes.bodySmall },
  retryText: { color: communityColors.green, fontWeight: "700" },
  content: { paddingHorizontal: 18, paddingTop: 9, paddingBottom: 26 },
  shopCard: { minHeight: 89, borderRadius: 23, borderWidth: 1.3, borderColor: communityColors.line, padding: 10, flexDirection: "row", alignItems: "center", gap: 11 },
  shopPhoto: { width: 61, height: 61, borderRadius: 15, overflow: "hidden" },
  shopPhotoImage: { width: "100%", height: "100%" },
  shopInfo: { flex: 1, minWidth: 0 },
  shopName: { color: communityColors.ink, fontSize: fontSizes.bodyMedium, fontWeight: "800" },
  shopRating: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  star: { color: "#df7c29", fontSize: fontSizes.bodyLarge },
  shopSub: { flex: 1, color: communityColors.muted, fontSize: fontSizes.caption },
  openText: { color: communityColors.ink, fontSize: fontSizes.bodySmall, fontWeight: "800", paddingHorizontal: 6 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 17, marginBottom: 9 },
  sectionTitle: { color: communityColors.ink, fontSize: fontSizes.bodyMedium },
  seeAll: { color: communityColors.muted, fontSize: fontSizes.caption },
  summaryCard: { minHeight: 171, borderWidth: 1.3, borderColor: communityColors.line, borderRadius: 24, padding: 16, flexDirection: "row", alignItems: "center" },
  averageColumn: { width: "32%", alignItems: "center", borderRightWidth: 1, borderColor: communityColors.line, paddingRight: 10 },
  average: { color: communityColors.ink, fontSize: fontSizes.display, fontWeight: "800" },
  stars: { color: "#dd842e", fontSize: fontSizes.subtitle, letterSpacing: 1, marginTop: 2 },
  reviewCount: { color: communityColors.muted, fontSize: fontSizes.badge, marginTop: 8 },
  distribution: { flex: 1, paddingLeft: 13, gap: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  score: { width: 13, color: communityColors.muted, fontSize: fontSizes.caption, textAlign: "right" },
  barTrack: { height: 8, flex: 1, borderRadius: 5, backgroundColor: communityColors.pale, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 5, backgroundColor: "#df7c29" },
  reviewList: { borderWidth: 1.2, borderColor: communityColors.line, borderRadius: 24, overflow: "hidden", marginTop: 14 },
  reviewCard: { paddingHorizontal: 15, paddingVertical: 16, borderBottomWidth: 1, borderColor: communityColors.line },
  reviewTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 22, backgroundColor: communityColors.pale, alignItems: "center", justifyContent: "center" },
  avatarText: { color: communityColors.ink, fontSize: fontSizes.bodyMedium, fontWeight: "800" },
  reviewerInfo: { flex: 1 },
  reviewerName: { color: communityColors.ink, fontSize: fontSizes.bodySmall, fontWeight: "800" },
  reviewMeta: { color: communityColors.muted, fontSize: fontSizes.badge, marginTop: 4 },
  reviewStars: { color: "#df7c29", fontSize: fontSizes.bodyMedium },
  reviewComment: { color: communityColors.muted, fontSize: fontSizes.bodySmall, lineHeight: 20, marginTop: 14 },
  noReviews: { minHeight: 125, marginTop: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: communityColors.line, borderRadius: 22 },
  noReviewsTitle: { color: communityColors.ink, fontSize: fontSizes.bodyMedium, fontWeight: "800", marginTop: 7 },
  noReviewsText: { color: communityColors.muted, fontSize: fontSizes.caption, marginTop: 4 },
  writeReview: { borderWidth: 1.2, borderColor: communityColors.line, borderRadius: 23, padding: 15, marginTop: 15 },
  verifiedLabel: { color: communityColors.muted, fontSize: fontSizes.badge, fontWeight: "800", letterSpacing: 0.6 },
  writeTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  writeTitle: { color: communityColors.ink, fontSize: fontSizes.subtitle, fontWeight: "800" },
  orderId: { color: communityColors.muted, fontSize: fontSizes.badge },
  rateRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 16 },
  rateButton: { width: 43, height: 43, borderRadius: 23, borderWidth: 1.2, borderColor: communityColors.line, alignItems: "center", justifyContent: "center" },
  rateStar: { color: "#df7c29", fontSize: fontSizes.header },
  rateStarActive: { color: "#df7c29" },
  commentInput: { minHeight: 80, borderWidth: 1, borderColor: communityColors.line, borderRadius: 17, padding: 12, color: communityColors.ink, fontSize: fontSizes.bodySmall, marginTop: 14, textAlignVertical: "top" },
  submitButton: { height: 48, borderRadius: 25, backgroundColor: communityColors.green, alignItems: "center", justifyContent: "center", marginTop: 11 },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: "#fff", fontSize: fontSizes.bodySmall, fontWeight: "800" },
  noOrderText: { color: communityColors.muted, fontSize: fontSizes.caption, lineHeight: 18, marginTop: 12 },
});
