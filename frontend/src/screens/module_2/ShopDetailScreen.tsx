import { fontSizes } from "../../theme";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommunityHeader, communityColors } from "../../components/CommunityLayout";
import { FallbackPhoto } from "../../components/FallbackPhoto";
import { cornerKitchenPhoto, foodPhoto } from "../../data/designPhotos";
import {
  getCommunityFoods,
  getCommunityShop,
  getSavedShops,
  getShopDropAlert,
  getShopReviews,
  imageUrl,
  saveShopDropAlert,
  submitShopReview,
  toggleSavedShop,
  type CommunityFood,
  type CommunityShop,
  type EligibleReviewOrder,
  type ShopReview,
} from "../../services/communityApi";
import type { Food } from "./HomeScreen";

export default function ShopDetailScreen({
  onBack,
  onOpenReviews,
  onOpenSettings,
  onOpenFood,
  onOpenFoodList,
  shopId,
  userId,
}: {
  onBack: () => void;
  onOpenReviews: (shopId: string) => void;
  onOpenSettings: () => void;
  onOpenFood?: (food: Food) => void;
  onOpenFoodList?: (shopId: string) => void;
  shopId?: string;
  userId: string;
}) {
  const [shop, setShop] = useState<CommunityShop | null>(null);
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [dropAlert, setDropAlert] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertBusy, setAlertBusy] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviews, setReviews] = useState<ShopReview[]>([]);
  const [eligibleOrder, setEligibleOrder] = useState<EligibleReviewOrder | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const allFoods = await getCommunityFoods();
        const id = shopId ?? allFoods[0]?.shop_id;
        if (!id) {
          if (active) setError("Chưa có cửa hàng nào để hiển thị.");
          return;
        }
        const [shopDetails, shopAlert, savedShops, reviewResult] = await Promise.all([
          getCommunityShop(id),
          getShopDropAlert(userId, id),
          getSavedShops(userId),
          getShopReviews(id, userId),
        ]);
        if (!active) return;
        setShop(shopDetails);
        setFoods(allFoods.filter((food) => food.shop_id === id));
        setDropAlert(Boolean(shopAlert?.enabled));
        setIsSaved(savedShops.some((savedShop) => savedShop.id === id));
        setReviews(reviewResult.items);
        setEligibleOrder(reviewResult.eligibleOrder);
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Không thể tải thông tin cửa hàng.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [shopId, userId]);

  const toggleDropAlert = async (enabled: boolean) => {
    if (!shop) return;
    setAlertBusy(true);
    try {
      await saveShopDropAlert(userId, shop.id, enabled);
      setDropAlert(enabled);
    } catch (reason) {
      Alert.alert("Không thể lưu Drop-alert", reason instanceof Error ? reason.message : "Vui lòng thử lại.");
    } finally {
      setAlertBusy(false);
    }
  };

  const toggleSaved = async () => {
    if (!shop) return;
    try {
      const result = await toggleSavedShop(userId, shop.id);
      setIsSaved(result.saved);
    } catch (reason) {
      Alert.alert("Saved shop", reason instanceof Error ? reason.message : "Could not update saved shops.");
    }
  };

  const showCertificate = async () => {
    if (!shop?.safety_certificate_url) {
      Alert.alert("Chứng nhận an toàn", shop?.verified ? "Cửa hàng được hệ thống đánh dấu đã xác minh." : "Cửa hàng chưa có liên kết chứng nhận.");
      return;
    }
    try {
      await Linking.openURL(shop.safety_certificate_url);
    } catch {
      Alert.alert("Không thể mở chứng nhận", shop.safety_certificate_url);
    }
  };

  const gallery = foods.filter((food) => imageUrl(food.image_url));
  const heroImage = imageUrl(gallery[0]?.image_url);
  const ratingDistribution = [5, 4, 3, 2, 1].map((score) => reviews.filter((review) => Number(review.rating) === score).length);
  const maxRatingCount = Math.max(1, ...ratingDistribution);
  const reviewCount = Math.max(Number(shop?.review_count ?? 0), reviews.length);
  const submitReview = async () => {
    if (!shop || !eligibleOrder || reviewRating < 1 || reviewBusy) return;
    setReviewBusy(true);
    try {
      const submitted = await submitShopReview(shop.id, { authorId: userId, orderId: eligibleOrder.id, rating: reviewRating, comment: reviewComment });
      setReviews((current) => [submitted, ...current]);
      setShop((current) => current ? {
        ...current,
        average_rating: ((Number(current.average_rating) * Number(current.review_count) + reviewRating) / (Number(current.review_count) + 1)).toFixed(1),
        review_count: Number(current.review_count) + 1,
      } : current);
      setEligibleOrder(null);
      setReviewRating(0);
      setReviewComment("");
      Alert.alert("Review submitted", "Thanks for sharing your experience.");
    } catch (reason) {
      Alert.alert("Shop review", reason instanceof Error ? reason.message : "Could not submit your review.");
    } finally {
      setReviewBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <CommunityHeader title="Shop Detail" onBack={onBack} onMore={() => setMenuOpen((open) => !open)} />
      {menuOpen ? (
        <View style={styles.moreMenu}>
          <Pressable onPress={() => { setMenuOpen(false); Alert.alert("Report shop", "Shop reporting is not available yet."); }} style={styles.moreMenuItem}>
            <Text style={styles.moreMenuText}>Report shop</Text>
          </Pressable>
          <Pressable onPress={() => { setMenuOpen(false); onOpenSettings(); }} style={styles.moreMenuItem}>
            <Text style={styles.moreMenuText}>Search settings</Text>
          </Pressable>
        </View>
      ) : null}
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={communityColors.green} /></View>
      ) : error ? (
        <Text style={styles.stateText}>{error}</Text>
      ) : shop ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.photoWrap}>
            <FallbackPhoto uri={heroImage} fallback={cornerKitchenPhoto} style={styles.shopPhoto} />
          </View>
          <View style={styles.dots}>
            {gallery.slice(0, 3).map((food, index) => (
              <View key={food.id} style={[styles.dot, index === 0 && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.shopHeading}>
            <View style={styles.shopCopy}>
              <Text style={styles.shopName}>{shop.name}</Text>
              <Pressable onPress={() => onOpenReviews(shop.id)}>
                <Text style={styles.reviewCount}>{Number(shop.review_count)} reviews · Shop review</Text>
              </Pressable>
              <Text style={styles.address}>{shop.address}</Text>
            </View>
            <View style={styles.headingActions}>
              <Pressable onPress={() => void toggleSaved()} style={styles.saveShopButton} accessibilityLabel={isSaved ? "Unsave shop" : "Save shop"}>
                <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={19} color={communityColors.green} />
              </Pressable>
              <View style={styles.rating}>
                <Text style={styles.star}>★</Text>
                <Text style={styles.ratingText}>{Number(shop.average_rating).toFixed(1)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.safetyCard}>
            <View style={styles.safetyIcon}>
              <Ionicons name="shield-checkmark-outline" size={25} color={communityColors.ink} />
            </View>
            <View style={styles.safetyCopy}>
              <Text style={styles.safetyEyebrow}>FOOD SAFETY</Text>
              <Text style={styles.safetyTitle}>{shop.verified ? "Safety certificate verified" : "Certificate not verified"}</Text>
              <Text style={styles.safetyDetails}>{shop.safety_certificate_url ? "Certificate available to view" : "No certificate has been uploaded"}</Text>
            </View>
            <Pressable onPress={() => void showCertificate()} style={styles.viewButton}>
              <Text style={styles.viewText}>View</Text>
            </Pressable>
          </View>
          <View style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <Ionicons name="notifications-outline" size={24} color={communityColors.ink} />
            </View>
            <View style={styles.alertCopy}>
              <Text style={styles.alertTitle}>Drop-alert</Text>
              <Text style={styles.alertDescription}>Get notified when this shop starts an end-of-day food drop.</Text>
            </View>
            <Switch
              disabled={alertBusy}
              value={dropAlert}
              onValueChange={(enabled) => void toggleDropAlert(enabled)}
              trackColor={{ false: "#697a6d", true: communityColors.green }}
              thumbColor={communityColors.white}
              ios_backgroundColor="#697a6d"
            />
          </View>

          <View style={styles.writeReviewCard}>
            <Text style={styles.verifiedLabel}>VERIFIED PURCHASE</Text>
            <View style={styles.reviewPromptRow}>
              <Text style={styles.reviewPrompt}>How was your order?</Text>
              <Text style={styles.orderId}>{eligibleOrder ? `Order #${eligibleOrder.id.slice(0, 8)}` : "No eligible order"}</Text>
            </View>
            {eligibleOrder ? <>
              <View style={styles.rateStarsRow}>{[1, 2, 3, 4, 5].map((score) => (
                <Pressable key={score} onPress={() => setReviewRating(score)} accessibilityLabel={`Rate ${score} stars`}>
                  <Text style={[styles.rateStar, score <= reviewRating && styles.rateStarActive]}>{score <= reviewRating ? "★" : "☆"}</Text>
                </Pressable>
              ))}</View>
              <TextInput value={reviewComment} onChangeText={setReviewComment} placeholder="Share your experience with this shop..." placeholderTextColor={communityColors.muted} style={styles.reviewInput} multiline />
              <Pressable disabled={reviewBusy || reviewRating < 1} onPress={() => void submitReview()} style={[styles.submitReviewButton, (reviewBusy || reviewRating < 1) && styles.submitReviewDisabled]}>
                <Text style={styles.submitReviewText}>{reviewBusy ? "Submitting…" : "Submit review"}</Text>
              </Pressable>
            </> : <Text style={styles.reviewEligibility}>Only a completed pickup can be reviewed.</Text>}
          </View>

          <View style={styles.reviewsSection}>
            <View style={styles.reviewsSectionHeader}>
              <Text style={styles.listingHeading}>Reviews &amp; ratings</Text>
              <Pressable onPress={() => onOpenReviews(shop.id)} hitSlop={8}>
                <Text style={styles.seeAllReviews}>See all {reviewCount}</Text>
              </Pressable>
            </View>
            <View style={styles.ratingSummary}>
              <View style={styles.ratingOverview}>
                <Text style={styles.averageRating}>{Number(shop.average_rating).toFixed(1)}</Text>
                <Text style={styles.summaryStars}>★★★★★</Text>
                <Text style={styles.summaryReviewCount}>{reviewCount} reviews</Text>
              </View>
              <View style={styles.ratingBars}>{ratingDistribution.map((count, index) => {
                const score = 5 - index;
                return <View key={score} style={styles.ratingBarRow}>
                  <Text style={styles.ratingScore}>{score}</Text>
                  <View style={styles.ratingTrack}><View style={[styles.ratingFill, { width: `${(count / maxRatingCount) * 100}%` }]} /></View>
                </View>;
              })}</View>
            </View>
            {reviews.slice(0, 2).map((review) => (
              <View key={review.id} style={styles.reviewPreview}>
                <View style={styles.reviewPreviewHeader}>
                  <View style={styles.reviewerAvatar}><Text style={styles.reviewerAvatarText}>{review.author_name.slice(0, 1).toUpperCase()}</Text></View>
                  <View style={{ flex: 1 }}><Text style={styles.reviewerName}>{review.author_name}</Text><Text style={styles.reviewMeta}>Verified order · {new Date(review.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</Text></View>
                  <Text style={styles.reviewStars}>{"★".repeat(Number(review.rating))}{"☆".repeat(Math.max(0, 5 - Number(review.rating)))}</Text>
                </View>
                {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
              </View>
            ))}
            {!reviews.length ? <Text style={styles.noReviews}>No reviews yet.</Text> : null}
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 8 }}>
            <Text style={styles.listingHeading}>Available at this shop</Text>
            {foods.length > 0 && onOpenFoodList ? (
              <Pressable onPress={() => onOpenFoodList(shop.id)}>
                <Text style={{ color: communityColors.green, fontSize: fontSizes.caption, fontWeight: "700" }}>View full menu ›</Text>
              </Pressable>
            ) : null}
          </View>

          {foods.length ? foods.map((food) => (
            <Pressable
              key={food.id}
              onPress={() => onOpenFood?.({
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
              })}
              style={styles.foodRow}
            >
              <FallbackPhoto uri={imageUrl(food.image_url)} fallback={foodPhoto(food.name)} style={styles.foodImage} />
              <View style={styles.foodCopy}>
                <Text numberOfLines={1} style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodMeta}>{food.quantity_available} left · {Number(food.current_price).toLocaleString("vi-VN")}₫</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={communityColors.muted} />
            </Pressable>
          )) : <Text style={styles.stateText}>Chưa có món ăn đang được đăng.</Text>}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: communityColors.white },
  moreMenu: { position: "absolute", top: 62, right: 20, zIndex: 5, width: 164, paddingHorizontal: 13, paddingVertical: 6, borderWidth: 1, borderColor: communityColors.line, borderRadius: 16, backgroundColor: communityColors.white, elevation: 7 },
  moreMenuItem: { minHeight: 38, justifyContent: "center" },
  moreMenuText: { color: communityColors.ink, fontSize: fontSizes.bodySmall },
  content: { paddingHorizontal: 18, paddingTop: 9, paddingBottom: 28 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  stateText: { color: communityColors.muted, fontSize: fontSizes.caption, padding: 22, textAlign: "center" },
  photoWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 21,
    overflow: "hidden",
    backgroundColor: communityColors.pale,
    borderWidth: 1,
    borderColor: communityColors.line,
  },
  shopPhoto: { width: "100%", height: "100%" },
  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7, height: 28 },
  dot: { width: 7, height: 7, borderRadius: 5, backgroundColor: "#e5eee5" },
  dotActive: { backgroundColor: "#687a6c" },
  shopHeading: {
    minHeight: 69,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  shopCopy: { flex: 1 },
  headingActions: { flexDirection: "row", alignItems: "center", gap: 7 },
  saveShopButton: { width: 36, height: 36, borderRadius: 19, backgroundColor: communityColors.pale, alignItems: "center", justifyContent: "center" },
  shopName: { color: communityColors.ink, fontSize: fontSizes.subtitleSmall, fontWeight: "600" },
  reviewCount: { color: communityColors.muted, fontSize: fontSizes.badge, marginTop: 5 },
  address: { color: communityColors.muted, fontSize: fontSizes.micro, marginTop: 4 },
  rating: {
    height: 36,
    minWidth: 62,
    borderRadius: 12,
    backgroundColor: communityColors.paleOrange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  star: { color: "#dd842e", fontSize: fontSizes.bodySmall },
  ratingText: { color: "#4b5e51", fontSize: fontSizes.badge },
  safetyCard: {
    minHeight: 102,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  safetyIcon: {
    width: 39,
    height: 39,
    borderRadius: 22,
    backgroundColor: communityColors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  safetyCopy: { flex: 1, gap: 4 },
  safetyEyebrow: { color: communityColors.muted, fontSize: fontSizes.badge, fontWeight: "600", letterSpacing: 0.6 },
  safetyTitle: { color: communityColors.ink, fontSize: fontSizes.caption, fontWeight: "600" },
  safetyDetails: { color: communityColors.muted, fontSize: fontSizes.micro, lineHeight: 14 },
  viewButton: {
    minWidth: 43,
    height: 30,
    borderRadius: 17,
    paddingHorizontal: 10,
    backgroundColor: communityColors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  viewText: { color: communityColors.ink, fontSize: fontSizes.badge, fontWeight: "700" },
  alertCard: {
    minHeight: 66,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    borderRadius: 36,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  alertIcon: {
    width: 39,
    height: 39,
    borderRadius: 22,
    backgroundColor: communityColors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  alertCopy: { flex: 1, gap: 6 },
  alertTitle: { color: communityColors.ink, fontSize: fontSizes.caption },
  alertDescription: { color: communityColors.muted, fontSize: fontSizes.mini },
  writeReviewCard: { borderWidth: 1, borderColor: communityColors.line, borderRadius: 20, padding: 14, marginTop: 16, gap: 8 },
  verifiedLabel: { color: communityColors.green, fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  reviewPromptRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  reviewPrompt: { color: communityColors.ink, fontSize: fontSizes.bodySmall, fontWeight: "700" },
  orderId: { color: communityColors.muted, fontSize: fontSizes.mini },
  rateStarsRow: { flexDirection: "row", gap: 8 },
  rateStar: { color: "#d9dfd9", fontSize: 23 },
  rateStarActive: { color: "#df7c29" },
  reviewInput: { minHeight: 54, borderWidth: 1, borderColor: communityColors.line, borderRadius: 12, padding: 10, color: communityColors.ink, fontSize: fontSizes.caption, textAlignVertical: "top" },
  submitReviewButton: { minHeight: 39, alignItems: "center", justifyContent: "center", backgroundColor: communityColors.green, borderRadius: 21 },
  submitReviewDisabled: { opacity: 0.5 },
  submitReviewText: { color: communityColors.white, fontSize: fontSizes.caption, fontWeight: "700" },
  reviewEligibility: { color: communityColors.muted, fontSize: fontSizes.caption },
  reviewsSection: { marginTop: 19 },
  reviewsSectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  seeAllReviews: { color: communityColors.green, fontSize: fontSizes.caption, fontWeight: "700" },
  ratingSummary: { borderWidth: 1, borderColor: communityColors.line, borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", gap: 18 },
  ratingOverview: { alignItems: "center", minWidth: 100, gap: 2 },
  averageRating: { color: communityColors.ink, fontSize: 31, fontWeight: "800" },
  summaryStars: { color: "#df7c29", fontSize: 14, letterSpacing: 1 },
  summaryReviewCount: { color: communityColors.muted, fontSize: fontSizes.mini },
  ratingBars: { flex: 1, gap: 5 },
  ratingBarRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  ratingScore: { width: 10, color: communityColors.muted, fontSize: fontSizes.mini },
  ratingTrack: { height: 6, flex: 1, borderRadius: 4, backgroundColor: "#edf1ed", overflow: "hidden" },
  ratingFill: { height: "100%", borderRadius: 4, backgroundColor: "#dd842e" },
  reviewPreview: { paddingVertical: 13, borderBottomWidth: 1, borderColor: communityColors.line },
  reviewPreviewHeader: { flexDirection: "row", alignItems: "center", gap: 9 },
  reviewerAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: communityColors.pale, alignItems: "center", justifyContent: "center" },
  reviewerAvatarText: { color: communityColors.green, fontSize: fontSizes.caption, fontWeight: "800" },
  reviewerName: { color: communityColors.ink, fontSize: fontSizes.caption, fontWeight: "700" },
  reviewMeta: { color: communityColors.muted, fontSize: fontSizes.mini, marginTop: 2 },
  reviewStars: { color: "#df7c29", fontSize: fontSizes.caption },
  reviewComment: { color: communityColors.muted, fontSize: fontSizes.caption, lineHeight: 18, marginTop: 9 },
  noReviews: { color: communityColors.muted, fontSize: fontSizes.caption, paddingVertical: 15 },
  listingHeading: { color: communityColors.ink, fontSize: fontSizes.bodyMedium, fontWeight: "600" },
  foodRow: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: communityColors.line,
    paddingVertical: 6,
  },
  foodImage: { width: 50, height: 50, borderRadius: 10, backgroundColor: communityColors.pale },
  foodCopy: { flex: 1, gap: 5 },
  foodName: { color: communityColors.ink, fontSize: fontSizes.caption, fontWeight: "700" },
  foodMeta: { color: communityColors.muted, fontSize: fontSizes.micro },
});
